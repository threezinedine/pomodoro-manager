# Frontend Architecture

## Overview

The frontend follows a **feature-based** architecture with a strict split between presentational and stateful layers:

- **`components/`** — Pure, stateless UI building blocks. All state is passed in via props. No internal `useState`, no side effects, no business logic. Examples: `Button`, `Modal`, `Badge`.
- **`features/`** — Stateful wrappers around `components/`, bundled with their own logic. Each feature owns its state (Zustand store, hooks, or prop) and its components compose the primitives from `components/`. Examples: `timer/`, `tasks/`, `calendar/`, `auth/`.
- **`pages/`** — Route-level components that compose features and layouts.

This separation keeps `components/` genuinely reusable across the entire app, while each feature remains self-contained and testable.

---

## Directory Tree

```plaintext
client/
├── src/
│   ├── stories/                     # Storybook configuration & stories
│   │
│   ├── components/                 # Pure presentational UI components (stateless)
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.scss
│   │   │   ├── Button.test.tsx    # ✅ required
│   │   │   ├── Button.stories.tsx # ✅ required
│   │   │   └── index.tsx          # public barrel export
│   │   ├── badge/
│   │   ├── modal/
│   │   ├── tooltip/
│   │   ├── input/
│   │   └── spinner/
│   │
│   ├── layout/                    # Page layout wrappers
│   │   └── dashboard/
│   │       ├── DashboardLayout.tsx
│   │       ├── DashboardLayout.scss
│   │       └── index.tsx
│   │
│   ├── pages/                     # Route-level page components
│   │   ├── LoginPage/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginPage.scss
│   │   │   └── index.tsx
│   │   └── DashboardPage/
│   │       ├── DashboardPage.tsx
│   │       ├── DashboardPage.scss
│   │       └── index.tsx
│   │
│   ├── features/                   # Stateful wrappers around components/ + domain logic
│   │   ├── auth/
│   │   │   ├── services/
│   │   │   │   └── authApi.ts   # auth API calls
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── utils/
│   │   ├── timer/
│   │   │   ├── components/
│   │   │   │   ├── TimerWidget/
│   │   │   │   ├── DurationInput/
│   │   │   │   └── SessionCounter/
│   │   │   └── stores/
│   │   │       └── timerStore.ts  # Zustand store
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   │   ├── TaskList/
│   │   │   │   ├── TaskItem/
│   │   │   │   ├── AddTaskForm/
│   │   │   │   └── TaskTagFilter/
│   │   │   ├── services/
│   │   │   │   └── taskApi.ts
│   │   │   ├── hooks/
│   │   │   │   └── useTasks.ts
│   │   │   └── stores/
│   │   │       └── tasksStore.ts
│   │   ├── calendar/
│   │   │   ├── components/
│   │   │   │   ├── CalendarView/
│   │   │   │   ├── DayCell/
│   │   │   │   ├── SessionDot/
│   │   │   │   └── MonthNavigator/
│   │   │   ├── services/
│   │   │   │   └── sessionApi.ts
│   │   │   └── stores/
│   │   │       └── calendarStore.ts
│   │   ├── templates/
│   │   │   ├── components/
│   │   │   │   ├── TemplateList/
│   │   │   │   └── TemplateForm/
│   │   │   ├── services/
│   │   │   │   └── templateApi.ts
│   │   │   └── stores/
│   │   │       └── templatesStore.ts
│   │   └── stats/
│   │       ├── components/
│   │       │   └── WeeklyChart/
│   │       └── stores/
│   │           └── statsStore.ts
│   │
│   ├── services/                  # Global / shared API services
│   │   └── apiClient.ts         # Axios instance, auth interceptor
│   │
│   ├── hooks/                   # Global / shared custom hooks
│   │   ├── useNotification.ts
│   │   └── useAudio.ts
│   │
│   ├── utils/                   # Global / shared utility functions
│   │   ├── date.ts             # date formatting, day calculation
│   │   └── time.ts             # mm:ss formatting, duration helpers
│   │
│   ├── global/
│   │   ├── global.css          # CSS variables, theme, reset
│   │   ├── themes.css          # .light and .dark class definitions
│   │   └── App.tsx             # Root component, router, providers
│   │
│   └── main.tsx                # Entry point
│
├── public/
│   └── sounds/
│       └── bell.mp3            # Timer chime sound
│
├── capacitor.config.ts
├── package.json
└── tsconfig.json
```

---

## Key Notes

### 1. Component Contract (`components/`)

Components in `components/` are **pure and stateless**. All state is injected via props.

Every component **must** include `index.tsx`, `.test.tsx`, and `.stories.tsx`.

```plaintext
ComponentName.tsx          → implementation (stateless, props only)
ComponentName.scss         → styles
ComponentName.test.tsx      → unit / integration test  ✅ required
ComponentName.stories.tsx  → Storybook story            ✅ required
index.tsx                  → public barrel export
```

### 2. Feature Modules are Stateful (`features/`)

A feature module wraps `components/` and adds its own state. Feature components compose and manage the stateless primitives from `components/`.

```plaintext
features/timer/
├── components/
│   ├── TimerWidget/          # Stateful — owns timer state, subscribes to timerStore
│   │   └── index.tsx
│   └── DurationInput/
│       └── index.tsx
├── stores/
│   └── timerStore.ts        # Zustand store: isRunning, duration, start, pause, resume, reset, tick
├── services/
│   └── timerApi.ts          # API calls for sessions
└── utils/
    └── timeFormat.ts

features/tasks/
├── components/
│   ├── TaskList/
│   ├── TaskItem/
│   └── AddTaskForm/
├── stores/
│   └── tasksStore.ts        # Zustand store: tasks, selectedDate, CRUD actions
└── services/
    └── taskApi.ts
```

Tests and stories inside `features/` are **optional** — add only when the feature is complex enough to benefit.

### 3. Components vs Features — When to Use Which

| Location | State | Usage |
|---|---|---|
| `components/` | **None** — all state via props | Reusable primitives: `Button`, `Badge`, `Modal`, `Tooltip`, `Spinner` |
| `features/` | **Owns internal state** | Domain logic: `TimerWidget`, `TaskList`, `CalendarView`, `TemplateForm` |
| `pages/` | **None** (just composing) | Route assembly: `LoginPage`, `DashboardPage` |

### 4. Theme System (`global/themes.css`)

The app uses CSS variables with `.light` / `.dark` class toggling on the root element.

```css
/* global/themes.css */
.light {
  --color-primary: #6366f1;
  --color-secondary: #1c1c1e;
  --color-background: #0f0f0f;
  --color-surface: #1a1a1a;
  --color-text: #e5e5e5;
  --color-text-muted: #9ca3af;
  --color-border: #2d2d2d;
  --color-accent: #818cf8;
}

.dark {
  --color-primary: #6366f1;
  --color-secondary: #1c1c1e;
  --color-background: #0f0f0f;
  --color-surface: #1a1a1a;
  --color-text: #e5e5e5;
  --color-text-muted: #9ca3af;
  --color-border: #2d2d2d;
  --color-accent: #818cf8;
}
```

> The theme is **dark-first** by default — `.dark` class is on the root element. The light theme is available as an alternative.

### 5. Zustand Stores

Global stores live inside their feature's `stores/` folder. Feature state is isolated — only the feature that owns a store uses it directly.

| Store | File | State |
|---|---|---|
| Auth | `features/auth/stores/authStore.ts` | token, userId, login, logout |
| Timer | `features/timer/stores/timerStore.ts` | isRunning, duration, remaining, start, pause, resume, reset, tick |
| Tasks | `features/tasks/stores/tasksStore.ts` | tasks[], selectedDate, fetchTasks, createTask, updateTask, deleteTask, cancelTask |
| Calendar | `features/calendar/stores/calendarStore.ts` | visibleMonth, selectedDate, sessions[], fetchSessions, createSession |
| Templates | `features/templates/stores/templatesStore.ts` | templates[], fetchTemplates, createTemplate, updateTemplate, deleteTemplate |
| Stats | `features/stats/stores/statsStore.ts` | todayStats, weeklyData, totalCount |

### 6. API Client (`services/apiClient.ts`)

Axios instance with auth header interceptor and base URL configuration.

```typescript
// services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

// Attach Bearer token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 7. Barrel Exports

Every component and feature module exposes a public API via `index.tsx`.

```tsx
// Good — import from barrel
import { Button } from '@/components/button';
import { TimerWidget } from '@/features/timer/components/TimerWidget';
import { useAuthStore } from '@/features/auth/stores/authStore';

// Avoid — direct internal import
import { Button } from '@/components/button/Button';
```

### 8. Routing

Two routes only:

```tsx
/          → LoginPage   (public)
/dashboard  → DashboardPage (protected)
```

All features live inside `/dashboard`. No nested routing beyond this.

---

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run test         # Run Vitest tests
npm run storybook    # Start Storybook
npm run lint         # ESLint
```
