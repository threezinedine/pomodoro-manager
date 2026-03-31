# Database Design — Pomodoro Manager

## Overview

- **ORM**: Prisma
- **Database**: MySQL (Docker service)
- **Auth**: Static token hardcoded in `.env` — no token table in DB
- **Soft delete**: All models use `deletedAt` (timestamp, nullable). Hard delete never exposed via API.

---

## Core Concept

| Concept | Description |
|---|---|
| **TaskTemplate** | A recurring template — defines title, description, task type, repeat rule, and schedule. The system uses this to auto-generate Task instances. |
| **Task** | A concrete task on a specific date. Created manually or by a TaskTemplate. Has a `type` that determines how it's tracked. |
| **TaskTag** | A reusable label (name + color) applied to any Task. |
| **PomodoroSession** | One timer run on a task. Many sessions can accumulate on a single task. |

**Key rule**: `Task.totalMinutes = SUM(PomodoroSession.actualMinutes)` across all sessions for that task.

---

## Task Status

Each task carries a `taskStatus` field — the state of the task on its date:

| Status | Meaning |
|---|---|
| `PENDING` | Default. Task is on the calendar, work has not started or not yet confirmed. |
| `COMPLETED` | Work was done. |
| `CANCELLED` | Task was planned (e.g. office day from template) but did not happen. |

**Why `CANCELLED`?** OFFICE tasks are auto-generated from templates and appear on the calendar before the day happens. If you don't go to work, you need to explicitly cancel — not just leave it as "pending". It distinguishes a missed day from a completed one and keeps the calendar accurate.

**`taskStatus` vs `completed`**: `taskStatus` replaces the boolean `completed` field. The API should expose it as a string enum.

---

## Task Types

Tasks are categorized by type, which determines their tracking behavior:

| Type | Description | Tracking Behavior |
|---|---|---|
| `POMODORO` | Classic Pomodoro session — work interval with timer | Timer-based: sessions have `plannedMinutes`, `actualMinutes` |
| `OFFICE` | Fixed work block — e.g. 9 AM–5 PM, Mon–Fri | Time-block based: sessions have `startedAt`, `endedAt` (real clock time) |
| `MEETING` | A scheduled meeting | Similar to OFFICE — clock-time based |
| `FOCUS` | Long uninterrupted focus block | Timer-based like POMODORO |
| `OTHER` | Catch-all for anything else | Flexible — can be either timer or clock based |

> **Why a `type` field?** Not all work looks like a Pomodoro. "Office time" is fixed hours (Mon–Fri 9–5), tracked by actual clock-in/clock-out, not interval timers. The `type` field allows each task to be tracked in the way that fits its nature.

---

## Entity Relationship Diagram

```text
┌─────────────────────┐       1:N        ┌──────────────────┐
│   TaskTemplate      │─────────────────►│       Task        │
│─────────────────────│                  │──────────────────│
│ id                  │                  │ id               │
│ title               │                  │ taskTemplateId(FK)│◄──┐│
│ description         │                  │ title            │   │
│ taskType            │                  │ taskType         │   │
│ repeatRule          │                  │ date             │   │
│ repeatDays (JSON)   │                  │ taskStatus      │   │
│ timeOfDay           │                  │ createdAt        │   │
│ officeHours (JSON)   │                  │ updatedAt        │   │
│ active              │                  │ deletedAt        │   │
│ userId (FK)         │                  └────────┬─────────┘   │
│ createdAt           │                           │ 1:N             │
│ deletedAt           │                           │                  │
└─────────────────────┘                           │            ┌─────▼──────────┐
                                                  │            │   TaskTag       │
                                                  │            │────────────────│
                                                  └───────────►│ id             │
                                                               │ name           │
                                                               │ color (hex)    │
                                                               │ userId (FK)    │
                                                               │ deletedAt      │
                                                               └────────────────┘

┌─────────────────────────────────────┐
│         PomodoroSession              │
│─────────────────────────────────────│
│ id                                   │
│ taskId (FK)                         │◄──── Task
│ userId (FK)                         │
│ taskType                            │
│ plannedMinutes  (POMODORO/FOCUS)    │
│ actualMinutes   (set on end)        │
│ startedAt                           │
│ endedAt                             │
│ status                             │
│ createdAt                           │
│ deletedAt                           │
└─────────────────────────────────────┘
```

---

## Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @db.DateTime

  taskTemplates TaskTemplate[]
  tasks        Task[]
  tags         TaskTag[]
  sessions     PomodoroSession[]

  // Reserved for future real auth (email/password, OAuth, etc.)
  @@map("users")
}

// ──────────────────────────────────────────────
// TaskTemplate — defines a recurring pattern
// ──────────────────────────────────────────────
model TaskTemplate {
  id           String    @id @default(uuid())
  title        String
  description  String?
  taskType     String    // "POMODORO" | "OFFICE" | "MEETING" | "FOCUS" | "OTHER"
  repeatRule   String    // "ONCE" | "DAILY" | "WEEKDAYS" | "WEEKLY" | "CUSTOM"
  repeatDays   Json?     // WEEKLY: ["mon","wed","fri"]; CUSTOM: ["15","20","25"]
  timeOfDay    String?   // optional HH:mm for display / future notifications
  officeHours  Json?     // for OFFICE type: { start: "09:00", end: "17:00" }
  active       Boolean   @default(true)
  userId       String
  createdAt    DateTime  @default(now())
  deletedAt    DateTime? // soft delete

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks  Task[]

  @@index([userId, active])
  @@index([userId])
  @@map("task_templates")
}

// ──────────────────────────────────────────────
// Task — a concrete task instance on a date
// ──────────────────────────────────────────────
model Task {
  id              String    @id @default(uuid())
  title           String
  taskType        String    // mirrors TaskTemplate.taskType; can be overridden per-instance
  taskTemplateId  String?
  userId          String
  date            DateTime  @db.Date // YYYY-MM-DD, time component ignored
  taskStatus     String    @default("PENDING") // "PENDING" | "COMPLETED" | "CANCELLED"
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime? // soft delete

  user    User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  template TaskTemplate?   @relation(fields: [taskTemplateId], references: [id], onDelete: SetNull)
  tags    TaskTagOnTask[]  // many-to-many
  sessions PomodoroSession[]

  @@index([userId, date])
  @@index([userId])
  @@map("tasks")
}

// ──────────────────────────────────────────────
// TaskTag — reusable labels for tasks
// ──────────────────────────────────────────────
model TaskTag {
  id        String    @id @default(uuid())
  name      String
  color     String    @default("#6366f1") // hex color for calendar dots
  userId    String
  createdAt DateTime  @default(now())
  deletedAt DateTime? // soft delete

  user  User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks TaskTagOnTask[]

  @@index([userId])
  @@map("task_tags")
}

// ──────────────────────────────────────────────
// TaskTagOnTask — many-to-many join
// ──────────────────────────────────────────────
model TaskTagOnTask {
  taskId String
  tagId  String

  task Task    @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag  TaskTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
  @@map("task_tags_on_tasks")
}

// ──────────────────────────────────────────────
// PomodoroSession — one timer/stopped-time run on a task
// ──────────────────────────────────────────────
model PomodoroSession {
  id              String    @id @default(uuid())
  taskId          String
  userId          String
  taskType        String    // mirrors Task.type; used for display and analytics
  plannedMinutes  Int?      // null for OFFICE/MEETING types; set for POMODORO/FOCUS/OTHER
  actualMinutes   Int?      // null = session still in progress; set on complete/reset
  startedAt       DateTime  @db.DateTime // when the session started
  endedAt         DateTime? @db.DateTime // null = in progress
  status          String    @default("RUNNING") // "RUNNING" | "COMPLETED" | "RESET"
  createdAt       DateTime  @default(now())
  deletedAt       DateTime? // soft delete

  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task  @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])
  @@index([taskId])
  @@map("pomodoro_sessions")
}
```

---

## Field Details

### TaskTemplate

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `title` | `String` | Max 255 chars |
| `description` | `String?` | Optional long description |
| `taskType` | `String` | `"POMODORO"` \| `"OFFICE"` \| `"MEETING"` \| `"FOCUS"` \| `"OTHER"` |
| `repeatRule` | `String` | `"ONCE"` \| `"DAILY"` \| `"WEEKDAYS"` \| `"WEEKLY"` \| `"CUSTOM"` |
| `repeatDays` | `Json?` | WEEKLY: `["mon","wed","fri"]`; CUSTOM: `["15","20"]` (day-of-month) |
| `timeOfDay` | `String?` | `HH:mm` format, e.g. `"09:00"`. For display and future notifications. |
| `officeHours` | `Json?` | For `OFFICE` type: `{ start: "09:00", end: "17:00" }`. Pre-fills session times. |
| `active` | `Boolean` | Default `true`. Pausing stops auto-generation. |
| `userId` | `String` (FK) | |
| `createdAt` | `DateTime` | |
| `deletedAt` | `DateTime?` | Soft delete |

**Repeat rule examples:**

| `repeatRule` | `repeatDays` | Meaning |
|---|---|---|
| `ONCE` | `null` | One-off task — generates a single Task, then done |
| `DAILY` | `null` | Every calendar day, starting from creation |
| `WEEKDAYS` | `null` | Monday through Friday, every week |
| `WEEKLY` | `["mon", "wed", "fri"]` | Only those weekdays, every week |
| `CUSTOM` | `["15", "20", "25"]` | On specific days of the month (e.g. 15th, 20th, 25th) |

---

### Task

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `title` | `String` | Max 255 chars. Can override template's title. |
| `taskType` | `String` | `"POMODORO"` \| `"OFFICE"` \| `"MEETING"` \| `"FOCUS"` \| `"OTHER"`. Mirrors template's type but can be overridden per-instance. |
| `taskTemplateId` | `String?` (FK) | Null = manually created. Non-null = auto-generated. |
| `userId` | `String` (FK) | |
| `date` | `DateTime` (`@db.Date`) | Calendar day the task is for. Time component ignored. |
| `taskStatus` | `String` | `"PENDING"` \| `"COMPLETED"` \| `"CANCELLED"`. Default `"PENDING"`. |
| `createdAt` | `DateTime` | When the DB record was created. |
| `updatedAt` | `DateTime` | Auto-updated on any field change. |
| `deletedAt` | `DateTime?` | Soft delete |

> **`date` vs `createdAt`**: `date` is the scheduled day. `createdAt` is when the record was created. A template-generated task for March 20 created on March 15 has `date = "2026-03-20"` and `createdAt = "2026-03-15"`.

---

### TaskTag / TaskTagOnTask

| Field | Type | Notes |
|---|---|---|
| `TaskTag.id` | `String` (UUID) | |
| `TaskTag.name` | `String` | Display name, e.g. `"work"`, `"urgent"` |
| `TaskTag.color` | `String` | Hex, e.g. `#ef4444`. Used for calendar dots and task chips. |
| `TaskTag.userId` | `String` (FK) | Tags are user-scoped. |
| `TaskTag.deletedAt` | `DateTime?` | Soft delete |
| `TaskTagOnTask` | | Composite PK `[taskId, tagId]`. Many-to-many join. |

---

### PomodoroSession

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `taskId` | `String` (FK) | The task this session belongs to. Many sessions can accumulate on one task. |
| `userId` | `String` (FK) | |
| `taskType` | `String` | Mirrors `Task.taskType`. Used for analytics, filtering, and display without joining the Task table. |
| `plannedMinutes` | `Int?` | Null for `OFFICE`/`MEETING`. Set for `POMODORO`/`FOCUS`. |
| `actualMinutes` | `Int?` | Null = session in progress. Set when `COMPLETED` or `RESET`. Always captures elapsed time. |
| `startedAt` | `DateTime` | When this session started |
| `endedAt` | `DateTime?` | Null = in progress. Set on complete or reset. |
| `status` | `String` | `"RUNNING"` \| `"COMPLETED"` \| `"RESET"` |
| `createdAt` | `DateTime` | Auto-set |
| `deletedAt` | `DateTime?` | Soft delete |

> **`actualMinutes` is always set when a session ends**, whether the timer ran fully or was reset early. A 25-min timer reset at 12 min = `actualMinutes = 12`. No work is ever silently lost.

> **`plannedMinutes` vs `endedAt`**:

- For `POMODORO`/`FOCUS`: use `plannedMinutes` + `actualMinutes`
- For `OFFICE`/`MEETING`: `plannedMinutes` is null; use `startedAt` and `endedAt` to compute duration (`TIMESTAMPDIFF`)

---

## UX Flow — How Sessions Accumulate Per Task

The UX: **start → work → pause → reset → resume → new session → complete**.

```text
User opens task "Write docs" (POMODORO type), clicks Start (25 min)

  → PomodoroSession #1 created:
      taskId: "write-docs-task-id"
      taskType: "POMODORO"
      plannedMinutes: 25
      actualMinutes: null
      status: "RUNNING"
      startedAt: now

  [Timer is running...]

  [User pauses at 12 min]
    → Session #1: no change yet (still RUNNING)

  [User clicks Reset at 12 min]
    → Session #1:
        status: "RESET"
        actualMinutes: 12       ← elapsed IS captured
        endedAt: now

  [User changes duration to 15 min, clicks Start]

  → PomodoroSession #2 created:
      taskId: "write-docs-task-id"   ← same taskId
      taskType: "POMODORO"
      plannedMinutes: 15
      actualMinutes: null
      status: "RUNNING"
      startedAt: now

  [Timer completes naturally at 15 min]
    → Session #2:
        status: "COMPLETED"
        actualMinutes: 15
        endedAt: now

  Task "Write docs" now has 2 sessions: 12 + 15 = 27 total minutes worked.
  TotalMinutes = SUM(PomodoroSession.actualMinutes) WHERE taskId = "write-docs-task-id"
```

---

## Indexes

| Model | Index | Purpose |
|---|---|---|
| TaskTemplate | `[userId, active]` | List active templates for auto-generation |
| TaskTemplate | `[userId]` | Filter templates by user |
| Task | `[userId, date]` | Fetch tasks for a specific day |
| Task | `[userId]` | Filter all tasks by user |
| TaskTag | `[userId]` | Filter tags by user |
| PomodoroSession | `[userId, startedAt]` | Fetch sessions in date range (calendar) |
| PomodoroSession | `[taskId]` | All sessions for a task (for analytics) |

---

## Auth Strategy

**Token is stored in `.env`, NOT in the database.**

```env

# .env (root — NOT committed to git)
DATABASE_URL="mysql://root:password@mysql:3306/pomodoro"
AUTH_TOKEN="my-super-secret-token-123"
```

```typescript
// server/src/middleware/auth.ts
const AUTH_TOKEN = process.env.AUTH_TOKEN;
export const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

export function authMiddleware(req, res, next) {
  const token = (req.headers.authorization ?? "").startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = SYSTEM_USER_ID;
  next();
}
```

---

## Soft Delete

All list queries **must exclude soft-deleted records**:

```typescript
const tasks = await prisma.task.findMany({
  where: { userId, date, deletedAt: null },
  include: { tags: { include: { tag: true } } },
});
```

Hard delete is never exposed via API.

---

## Task Auto-Generation

> A cron job runs daily, reads active templates, and creates missing Task instances.

```typescript
// server/src/jobs/generateTasks.ts
async function generateTasksFromTemplates() {
  const templates = await prisma.taskTemplate.findMany({
    where: { active: true, deletedAt: null },
  });

  for (const template of templates) {
    const dates = calculateDates(template); // based on repeatRule + repeatDays
    for (const date of dates) {
      const exists = await prisma.task.findFirst({
        where: { taskTemplateId: template.id, date, deletedAt: null },
      });
      if (!exists) {
        await prisma.task.create({
          data: {
            title: template.title,
            taskType: template.taskType,
            taskTemplateId: template.id,
            userId: template.userId,
            date,
          },
        });
      }
    }
  }
}
```

---

## API Endpoints & Database Operations

| Method | Route | Prisma Operation |
|---|---|---|
| `GET` | `/api/tasks?date=YYYY-MM-DD` | `prisma.task.findMany({ where: { userId, date, deletedAt: null }, include: { tags: { include: { tag: true } } } })` |
| `POST` | `/api/tasks` | `prisma.task.create({ data: { title, taskType, userId, date, taskTemplateId?, tagIds? } })` (taskStatus defaults to `"PENDING"`) |
| `PUT` | `/api/tasks/:id` | `prisma.task.update({ where: { id, userId, deletedAt: null }, data: { title?, taskType?, taskStatus?, date? } })` |
| `POST` | `/api/tasks/:id/cancel` | `prisma.task.update({ where: { id, userId }, data: { taskStatus: "CANCELLED" } })`. Sets task to CANCELLED (e.g. office day not worked). |
| `DELETE` | `/api/tasks/:id` | `prisma.task.update({ where: { id, userId }, data: { deletedAt: new Date() } })` |
| `POST` | `/api/tasks/:id/tags` | `prisma.taskTagOnTask.createMany({ data: tagIds.map(tid => ({ taskId, tagId: tid })) })` |
| `DELETE` | `/api/tasks/:id/tags/:tagId` | `prisma.taskTagOnTask.delete({ where: { taskId_tagId: { taskId, tagId } } })` |
| `GET` | `/api/templates` | `prisma.taskTemplate.findMany({ where: { userId, deletedAt: null } })` |
| `POST` | `/api/templates` | `prisma.taskTemplate.create({ data: { title, description?, taskType, repeatRule, repeatDays?, timeOfDay?, officeHours?, userId } })` |
| `PUT` | `/api/templates/:id` | `prisma.taskTemplate.update({ where: { id, userId, deletedAt: null }, data: { ... } })` |
| `DELETE` | `/api/templates/:id` | `prisma.taskTemplate.update({ where: { id, userId }, data: { deletedAt: new Date() } })` |
| `GET` | `/api/tags` | `prisma.taskTag.findMany({ where: { userId, deletedAt: null } })` |
| `POST` | `/api/tags` | `prisma.taskTag.create({ data: { name, color?, userId } })` |
| `DELETE` | `/api/tags/:id` | `prisma.taskTag.update({ where: { id, userId }, data: { deletedAt: new Date() } })` |
| `POST` | `/api/sessions` | `prisma.pomodoroSession.create({ data: { taskId, userId, taskType, plannedMinutes?, startedAt } })` |
| `PUT` | `/api/sessions/:id/reset` | `prisma.pomodoroSession.update({ where: { id, userId }, data: { status: "RESET", actualMinutes, endedAt } })` |
| `PUT` | `/api/sessions/:id/complete` | `prisma.pomodoroSession.update({ where: { id, userId }, data: { status: "COMPLETED", actualMinutes: plannedMinutes, endedAt } })` |
| `GET` | `/api/sessions?from=&to=` | `prisma.pomodoroSession.findMany({ where: { userId, startedAt: { gte, lte }, deletedAt: null } })` |
| `GET` | `/api/sessions?taskId=` | `prisma.pomodoroSession.findMany({ where: { taskId, deletedAt: null } })` |
| `DELETE` | `/api/sessions/:id` | `prisma.pomodoroSession.update({ where: { id, userId }, data: { deletedAt: new Date() } })` |

---

## Migrations

```bash

# Run migrations against the MySQL container
cd server
npx prisma migrate dev --name init

# Production migration (CI/CD)
npx prisma migrate deploy

# Seed
npx prisma db seed
```

---

## Seed Data

```typescript
// server/prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000001" },
  });

  console.log("Seed complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
```
