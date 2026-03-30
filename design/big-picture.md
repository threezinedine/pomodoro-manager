# Pomodoro Manager — Big Picture

## Overview

A **web-first Pomodoro timer application** with an **Android companion app** (built via Capacitor). Users can manage tasks, run timed focus sessions, and view session history on a custom-built calendar — styled dark-first and minimal.

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
- **Tasks are per-day** — no global task list; tasks belong to a specific day
- **Timer runs in the side panel** — custom duration input, logs session to the calendar
- **Session results → calendar** — completed Pomodoro sessions appear as events on the calendar for that day

---

## Core Features

### 1. Pomodoro Timer (side panel)

- **Custom duration** — user inputs any number of minutes (not just 25/5/15)
- Quick-select buttons: 25 min / 15 min / 5 min
- Start / Pause / Reset controls
- Browser notification + audio chime when timer ends
- On completion → session is logged to backend and **appears as an event on the calendar** for that day
- Optional: cycle modes (work → break → work) can be toggled

### 2. Task Management (side panel, per-day)

- Create task: title (+ optional project/color)
- Tasks scoped to the **selected day** (from calendar)
- Edit / delete / mark complete
- Select a task before starting the timer → session is linked to that task
- Filter tasks by project

### 3. Calendar View (main area, custom React)

- **Month grid** — 7-column, day cells
- Each day cell shows **colored Pomodoro session dots/bars** (color = task or project color)
- Click a day → selects it, left column updates to show that day's tasks
- Hover/click a session dot → tooltip shows: task name, duration, start time
- Navigation: prev/next month, "Today" button
- Sessions are stored per-day in the backend; fetched for the visible month range

### 4. Statistics / History

- Daily / weekly summary of focus time (integrated in header or a collapsible panel)
- Weekly bar chart of focus minutes
- Total Pomodoros completed

### 5. Authentication
- **Predefined token** — user logs in with a fixed/seeded token (no real auth backend needed yet)
- User table exists in the database schema for future expansion (currently empty)
- All data is user-scoped (user ID associated with every record)

### 6. Notifications & Sounds
- Browser notification when a session ends
- Audio chime (e.g. `.mp3` bell sound)
- Both triggered via Web Audio API + Notification API

---

## Tech Stack

### Frontend (Web + Android)
| Layer            | Choice                                               |
| ---------------- | ---------------------------------------------------- |
| Framework        | **React 18 + Vite**                                  |
| Routing          | **React Router v6**                                  |
| State Management | **Zustand** (lightweight, minimal boilerplate)       |
| Styling          | **Tailwind CSS** (dark-first theme)                  |
| Calendar         | **Custom React calendar component** (month/week/day) |
| Capacitor        | For Android APK packaging                            |
| Audio            | Web Audio API + native HTML5 Audio                   |
| Notifications    | Browser Notification API                             |

### Backend

| Layer | Choice |
|---|---|---|
| Runtime | **Node.js** |
| Framework | **Express** (simple, flexible) |
| ORM | **Prisma** (schema-first, migrations, type-safe) |
| Database | **MySQL** (Docker service — official mysql image, no volume mount) |
| Auth | Token-based (predefined token validated on backend; user table ready for future) |
| Docker | Server + Client run as Docker containers via docker-compose |

### Architecture Pattern
- **Monorepo** structure:
  ```
  /client   → React frontend (Vite) — served via nginx in Docker
  /server   → Express + Prisma + Node.js — Docker container
  ```
- Docker Compose orchestrates: `server`, `client`, `mysql` services
- REST API communication between client and server
- Capacitor wraps the React app for Android

---

## Development Priority

1. **Web app first** — timer, task management, calendar view, notifications
2. **Backend** — API for tasks, sessions, auth (predefined token)
3. **Android app** — Capacitor packaging of the web app

---

## Data Model (High-Level)

```
User
  - id (UUID)
  - createdAt

Task
  - id, title, description
  - projectId (optional)
  - userId
  - completedAt (nullable)

Project
  - id, name, color
  - userId

PomodoroSession
  - id, taskId (optional)
  - userId
  - startedAt, endedAt
  - duration (minutes)
```

---

## UI / Design Direction

- **Dark-first** aesthetic: deep background, muted accent colors
- **Minimalist**: clean typography, ample whitespace, no clutter
- **Color accents**: subtle accent color for timer active state, session dots on calendar
- Focus mode: when timer is running, UI dims non-essential elements

---

## Open Questions (To Be Decided Later)

1. Should the calendar support **drag-to-reschedule** sessions?
2. Do you need **team/multi-user** support (shared projects)?
3. Should tasks support **subtasks** or just flat lists?
4. Do you want a **PWA manifest** for installable web experience?
5. Database choice for production — stick with SQLite or migrate to Postgres?
