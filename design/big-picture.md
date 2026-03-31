# Pomodoro Manager — Big Picture

## Overview

A **web-first Pomodoro timer application** with an **Android companion app** (built via Capacitor). Users manage tasks, run timed focus sessions, and view session history on a custom-built calendar — styled dark-first and minimal.

For detailed architecture of each layer, see:

- `design/archs/fe.md` — Frontend architecture (feature-based, components/features/pages)
- `design/archs/be.md` — Backend architecture (feature-based, routes/controllers/services/repositories)
- `design/features/database.md` — Database design (Prisma schema, models, API)

---

## App Layout — Single-Page `/dashboard`

The entire app lives at **one route: `/dashboard`** (after login). No multi-page routing.

```text
┌─────────────────────────────────────────────────────────┐
│  Header: Logo + User / Settings                         │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│  LEFT COLUMN     │  MAIN AREA — Calendar View            │
│  (Task Panel)    │  (Month Grid, Google Calendar-style)   │
│                  │                                       │
│  • Date header   │  Each day cell shows:                  │
│  • Task list     │  - Colored dots/bars for sessions      │
│    for selected  │  - Task name on hover/click             │
│    day           │                                       │
│  • "Add Task"    │  Click a day → highlights left column   │
│  • Timer widget  │  and shows that day's tasks             │
│    (custom dur.) │                                       │
│                  │                                       │
│  Timer controls: │                                       │
│  [Start]         │                                       │
│  [Pause]         │                                       │
│  [Reset]         │                                       │
│  + custom mins   │                                       │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
```

### Key UX Principles

- **Calendar is the hero** — the main, always-visible area
- **Left column is day-centric** — shows tasks for the currently selected calendar day
- **Tasks are per-day** — no global task list; tasks belong to a specific date
- **Timer runs in the side panel** — custom duration input, logs session to the calendar
- **Session results → calendar** — completed sessions appear as events on the calendar

---

## Core Features

### 1. Pomodoro Timer (side panel)

- **Custom duration** — user inputs any number of minutes (not just 25/5/15)
- Quick-select buttons: 25 min / 15 min / 5 min
- Start / Pause / Reset controls
- Browser notification + audio chime when timer ends
- On completion → session is logged and appears as a dot on the calendar
- A task can accumulate **multiple sessions** over time (start → reset → start again = 2 sessions)

### 2. Task Management (side panel, per-day)

- Create task: title, type (`POMODORO` / `OFFICE` / `MEETING` / `FOCUS` / `OTHER`), optional tags
- Tasks scoped to the **selected day** (from calendar)
- Edit / delete / mark complete
- Select a task before starting the timer → session is linked to that task
- **Cancel task** — for `OFFICE` type tasks (auto-generated from templates), cancel explicitly instead of leaving as pending
- Filter tasks by tag

### 3. Calendar View (main area, custom React)

- **Month grid** — 7-column, day cells
- Each day cell shows **colored session dots** (color = first tag's color, or task type default)
- Click a day → selects it, left column updates to show that day's tasks
- Hover/click a session dot → tooltip: task name, duration, start time
- Navigation: prev/next month, "Today" button
- Sessions fetched for the visible month range from backend

### 4. Task Templates (auto-generation)

- Create templates with a repeat rule (`DAILY`, `WEEKDAYS`, `WEEKLY`, `CUSTOM`, `ONCE`)
- `WEEKDAYS` — Mon–Fri every week (e.g. office schedule)
- `OFFICE` type — pre-generated on the calendar, cancel if you don't work that day
- A cron job generates missing Task instances daily from active templates

### 5. Statistics / History

- Daily / weekly summary of focus time (collapsible panel in header)
- Weekly bar chart of focus minutes
- Total Pomodoros completed

### 6. Authentication

- **Predefined token** — user logs in with a fixed token from `.env`
- No DB token table; User table reserved for future real auth
- All data is user-scoped to a single hardcoded `SYSTEM_USER_ID`

### 7. Notifications & Sounds

- Browser notification when a session ends
- Audio chime (`.mp3` bell sound)
- Both triggered via Web Audio API + Notification API

---

## Tech Stack

### Frontend

| Layer | Choice |
|---|---|
| Framework | **React 18 + Vite** |
| Architecture | **Feature-based** (`components/` + `features/` + `pages/`) |
| Routing | **React Router v6** (two routes: `/`, `/dashboard`) |
| State Management | **Zustand** (store per feature) |
| Styling | **CSS Modules + SCSS** with CSS variables, dark-first theme |
| Calendar | **Custom React calendar** (month grid) |
| Testing | **Vitest** + **Storybook** |
| Capacitor | For Android APK packaging |

### Backend

| Layer | Choice |
|---|---|
| Runtime | **Node.js** |
| Framework | **Express** (TypeScript) |
| Architecture | **Feature-based** (routes / controllers / services / repositories) |
| ORM | **Prisma** (schema-first, migrations, type-safe) |
| Database | **MySQL** (Docker service — official image, no volume) |
| Auth | Token in `.env` — Bearer header validation |
| Testing | **Jest** |
| Cron | **node-cron** for task auto-generation |

### Architecture Pattern

- **Monorepo** — `/client` + `/server` at root level
- **Docker Compose** — `server`, `client` (nginx), `mysql` services
- REST API communication between client and server
- Capacitor wraps the React app for Android

---

## Data Model

See `design/features/database.md` for the full Prisma schema.

| Model | Role |
|---|---|
| **User** | Reserved for future auth. System user seeded for v1. |
| **TaskTemplate** | Defines title, type, repeat rule (`DAILY`/`WEEKDAYS`/`WEEKLY`/`CUSTOM`/`ONCE`), schedule. Auto-generates Tasks. |
| **Task** | A concrete task on a date. Has `taskStatus` (`PENDING`/`COMPLETED`/`CANCELLED`). Can be linked to many sessions. |
| **TaskTag** | Reusable label (name + color). Applied to tasks via a many-to-many join. |
| **PomodoroSession** | One timer run on a task. `actualMinutes` captured on end/reset. Many sessions can accumulate per task. |

---

## UI / Design Direction

- **Dark-first** aesthetic: deep background, muted accent colors
- **Minimalist**: clean typography, ample whitespace, no clutter
- **Color accents**: subtle accent color for timer active state, session dots on calendar
- Focus mode: when timer is running, UI dims non-essential elements
- Theme toggling via CSS variables (`.light` / `.dark` class on root)

---

## Open Questions (To Be Decided Later)

1. Should the calendar support **drag-to-reschedule** sessions?
2. Should tasks support **subtasks** or just flat lists?
3. Do you want a **PWA manifest** for installable web experience?
4. Real auth (email/password or OAuth) — when to implement?
