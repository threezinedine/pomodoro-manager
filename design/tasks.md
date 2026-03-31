- [ ] 1. Initialize monorepo structure (`/client`, `/server` root-level folders)
    - [x] 1.1. Initialize server: Express + TypeScript project
    - [x] 1.2. Initialize client: React 18 + Vite + TypeScript project
    - [x] 1.3. Set up CSS Modules + SCSS in client (no Tailwind)
    - [ ] 1.4. Install and configure Capacitor (android platform)
    - [x] 1.5. Set up Docker environment (Docker and Docker Compose installed locally)
    - [x] 1.6. Create docker-compose.dev.yml + docker-compose.prod.yml — nginx proxy + server + client + mysql
    - [x] 1.7. Create server/Dockerfile — multi-stage build (build + production stage)
    - [x] 1.8. Create server/.dockerignore — exclude node_modules, dist, .env, logs
    - [x] 1.9. Create client/Dockerfile — build with Vite, serve with nginx (production stage)
    - [x] 1.10. Create client/.dockerignore — exclude node_modules, dist, .env, logs
    - [ ] 1.11. Verify shell project builds and Android APK generates

- [ ] 2. Install project dependencies
    - [x] 2.1. Install Zustand in client
    - [x] 2.2. Install React Router v6 in client
    - [x] 2.3. Install Vitest and @testing-library/react in client
    - [x] 2.4. Install Storybook in client (@storybook/react, required for all components/)
    - [x] 2.5. Install Prisma in server (@prisma/client, prisma CLI) — Prisma 6.19.2 (MySQL)
    - [x] 2.6. Install Express, dotenv, helmet, compression in server (no CORS — server only runs in Docker, nginx handles routing)
    - [x] 2.7. Install Jest and supertest in server (Jest 30 + ts-jest)
    - [ ] 2.8. Install node-cron in server (for task auto-generation job)
    - [ ] 2.9. Add bell.mp3 sound file to client/public/sounds/ directory

- [ ] 3. Set up database and Prisma schema
    - [x] 3.1. Initialize Prisma with MySQL (schema provider = mysql)
    - [x] 3.2. Define User model (id, createdAt — reserved for future, no deletedAt)
    - [x] 3.3. Define TaskTemplate model (id, title, description, taskType, repeatRule, repeatDays, timeOfDay, officeHours, active, userId, createdAt, deletedAt)
    - [x] 3.4. Define Task model (id, title, taskType, taskTemplateId, userId, date, taskStatus, createdAt, updatedAt, deletedAt)
    - [x] 3.5. Define TaskTag model (id, name, color, userId, createdAt, deletedAt)
    - [x] 3.6. Define TaskTagOnTask join model (taskId, tagId — composite PK)
    - [x] 3.7. Define PomodoroSession model (id, taskId, userId, taskType, plannedMinutes, actualMinutes, startedAt, endedAt, status, createdAt, deletedAt)
    - [x] 3.8. Add indexes: [userId, active] on TaskTemplate, [userId, date] on Task, [userId, startedAt] on PomodoroSession
    - [x] 3.9. Run Prisma db push (connect to MySQL container) — no migrations folder, server self-migrates on startup
    - [x] 3.10. Create prisma/seed.ts — seed system user (UUID, all data scoped to this user)
    - [x] 3.11. Add AUTH_TOKEN and DATABASE_URL to root .env (no server/.env)

- [ ] 4. Build backend core infrastructure
    - [ ] 4.1. Set up server/src/main.ts — Express app factory
    - [ ] 4.2. Set up server/src/config/index.ts — dotenv loading, env var exports
    - [ ] 4.3. Set up server/src/config/prisma.ts — Prisma client singleton
    - [ ] 4.4. Omit CORS middleware — server runs only in Docker, nginx handles all routing
    - [ ] 4.5. Set up server/src/core/middleware/errorHandler.ts — global error handler
    - [ ] 4.6. Set up server/src/core/middleware/auth.ts — Bearer token validation, attach SYSTEM_USER_ID to req.userId
    - [ ] 4.7. Set up server/src/core/errors/AppError.ts — custom error classes (NotFoundError, UnauthorizedError, ValidationError)
    - [ ] 4.8. Set up server/src/core/utils/response.ts — res.success() and res.error() helpers

- [ ] 5. Build backend auth feature
    - [ ] 5.1. Create server/src/features/auth/auth.routes.ts
    - [ ] 5.2. Create server/src/features/auth/auth.controller.ts
    - [ ] 5.3. Create server/src/features/auth/auth.service.ts — validate AUTH_TOKEN from env
    - [ ] 5.4. Create server/src/features/auth/auth.test.ts — unit tests for token validation
    - [ ] 5.5. Write basic API integration tests for auth

- [ ] 6. Build backend tasks feature
    - [ ] 6.1. Create server/src/features/tasks/tasks.routes.ts
    - [ ] 6.2. Create server/src/features/tasks/tasks.controller.ts
    - [ ] 6.3. Create server/src/features/tasks/tasks.service.ts
    - [ ] 6.4. Create server/src/features/tasks/tasks.repository.ts
    - [ ] 6.5. Implement GET /api/tasks?date=YYYY-MM-DD — list tasks for a specific day (include tags)
    - [ ] 6.6. Implement POST /api/tasks — create task with { title, taskType, userId, date, taskTemplateId?, tagIds? }
    - [ ] 6.7. Implement PUT /api/tasks/:id — update task (title, taskType, taskStatus, date)
    - [ ] 6.8. Implement DELETE /api/tasks/:id — soft delete (deletedAt)
    - [ ] 6.9. Implement POST /api/tasks/:id/cancel — set taskStatus to CANCELLED
    - [ ] 6.10. Implement POST /api/tasks/:id/tags — add tags to task (TaskTagOnTask createMany)
    - [ ] 6.11. Implement DELETE /api/tasks/:id/tags/:tagId — remove tag from task
    - [ ] 6.12. Create server/src/features/tasks/tasks.test.ts

- [ ] 7. Build backend sessions feature
    - [ ] 7.1. Create server/src/features/sessions/sessions.routes.ts
    - [ ] 7.2. Create server/src/features/sessions/sessions.controller.ts
    - [ ] 7.3. Create server/src/features/sessions/sessions.service.ts
    - [ ] 7.4. Create server/src/features/sessions/sessions.repository.ts
    - [ ] 7.5. Implement POST /api/sessions — create PomodoroSession (status: RUNNING)
    - [ ] 7.6. Implement PUT /api/sessions/:id/reset — end session (status: RESET, actualMinutes = elapsed, endedAt = now)
    - [ ] 7.7. Implement PUT /api/sessions/:id/complete — end session (status: COMPLETED, actualMinutes = plannedMinutes)
    - [ ] 7.8. Implement GET /api/sessions?from=&to= — list sessions in date range for calendar
    - [ ] 7.9. Implement GET /api/sessions?taskId= — list all sessions for a task (for analytics)
    - [ ] 7.10. Implement DELETE /api/sessions/:id — soft delete session
    - [ ] 7.11. Create server/src/features/sessions/sessions.test.ts

- [ ] 8. Build backend templates feature
    - [ ] 8.1. Create server/src/features/templates/templates.routes.ts
    - [ ] 8.2. Create server/src/features/templates/templates.controller.ts
    - [ ] 8.3. Create server/src/features/templates/templates.service.ts
    - [ ] 8.4. Create server/src/features/templates/templates.repository.ts
    - [ ] 8.5. Implement GET /api/templates — list all templates for user
    - [ ] 8.6. Implement POST /api/templates — create template with { title, description?, taskType, repeatRule, repeatDays?, timeOfDay?, officeHours?, userId }
    - [ ] 8.7. Implement PUT /api/templates/:id — update template
    - [ ] 8.8. Implement DELETE /api/templates/:id — soft delete template
    - [ ] 8.9. Create server/src/features/templates/templates.cron.ts — task auto-generation logic
    - [ ] 8.10. Create server/src/jobs/generateTasks.ts — daily cron job to generate Task instances from active templates
    - [ ] 8.11. Create server/src/features/templates/templates.test.ts

- [ ] 9. Build backend tags feature
    - [ ] 9.1. Create server/src/features/tags/tags.routes.ts
    - [ ] 9.2. Create server/src/features/tags/tags.controller.ts
    - [ ] 9.3. Create server/src/features/tags/tags.service.ts
    - [ ] 9.4. Create server/src/features/tags/tags.repository.ts
    - [ ] 9.5. Implement GET /api/tags — list all tags for user
    - [ ] 9.6. Implement POST /api/tags — create tag with { name, color?, userId }
    - [ ] 9.7. Implement DELETE /api/tags/:id — soft delete tag
    - [ ] 9.8. Create server/src/features/tags/tags.test.ts

- [ ] 10. Build backend health feature
    - [ ] 10.1. Create server/src/features/health/health.routes.ts — GET /health
    - [ ] 10.2. Wire up all feature routes in main.ts under /api prefix

- [ ] 11. Set up client project structure
    - [ ] 11.1. Set up client/src/components/ — pure presentational components (Button, Badge, Modal, Tooltip, Spinner, Input, Select)
    - [ ] 11.2. Set up client/src/features/ — feature modules (auth/, timer/, tasks/, calendar/, templates/, tags/, stats/)
    - [ ] 11.3. Set up client/src/pages/ — LoginPage/, DashboardPage/
    - [ ] 11.4. Set up client/src/layout/ — dashboard/ layout components
    - [ ] 11.5. Set up client/src/global/ — global.css, themes.css (CSS variables, .light/.dark classes)
    - [ ] 11.6. Set up client/src/services/ — apiClient.ts (Axios instance, auth interceptor)
    - [ ] 11.7. Set up client/src/hooks/ — useNotification.ts, useAudio.ts
    - [ ] 11.8. Set up client/src/utils/ — date.ts, time.ts (formatting helpers)
    - [ ] 11.9. Set up client/src/stories/ — Storybook configuration

- [ ] 12. Build client components library (components/)
    - [x] 12.1. Build Button component (Button.tsx, Button.scss, Button.test.tsx, Button.stories.tsx, index.tsx)
    - [ ] 12.2. Build Badge component (task status badge — PENDING/COMPLETED/CANCELLED colors)
    - [ ] 12.3. Build Modal component
    - [ ] 12.4. Build Tooltip component (for session dot hover in calendar)
    - [ ] 12.5. Build Spinner component
    - [ ] 12.6. Build Input component (text input with label and error state)
    - [ ] 12.7. Build Select component (for task type, tag selection)

- [ ] 13. Build client auth feature
    - [ ] 13.1. Create client/src/features/auth/services/authApi.ts — POST /api/auth/token
    - [ ] 13.2. Create client/src/features/auth/stores/authStore.ts — Zustand store: token, userId, login, logout
    - [ ] 13.3. Create client/src/features/auth/hooks/useAuth.ts — convenience hook
    - [ ] 13.4. Build LoginPage (pages/LoginPage/) — token input, submit, error state
    - [ ] 13.5. Guard /dashboard route — redirect to / if no valid token in localStorage

- [ ] 14. Build client timer feature
    - [ ] 14.1. Create client/src/features/timer/stores/timerStore.ts — Zustand: isRunning, duration, remaining, start, pause, resume, reset, tick
    - [ ] 14.2. Build TimerWidget component (features/timer/components/TimerWidget/) — large mm:ss display, quick-select buttons, custom input, Start/Pause/Reset controls
    - [ ] 14.3. Build DurationInput component — numeric field for custom minutes
    - [ ] 14.4. Build SessionCounter component — session count display
    - [ ] 14.5. Create client/src/features/timer/services/sessionApi.ts — API calls for sessions
    - [ ] 14.6. Implement timer logic: start(), pause(), resume(), reset(), tick() every second
    - [ ] 14.7. On timer complete: POST session to API, update calendar store
    - [ ] 14.8. On timer reset: end current session (status: RESET), create new session (status: RUNNING)
    - [ ] 14.9. Persist active timer state to localStorage (survive page refresh)
    - [ ] 14.10. Restore timer from localStorage on page reload

- [ ] 15. Build client calendar feature
    - [ ] 15.1. Create client/src/features/calendar/stores/calendarStore.ts — Zustand: visibleMonth, selectedDate, sessions[], fetchSessions, createSession
    - [ ] 15.2. Build CalendarView component (features/calendar/components/CalendarView/) — full-width month grid, 7 columns
    - [ ] 15.3. Build DayCell component — date number, session dots, click handler
    - [ ] 15.4. Build SessionDot component — colored dot, click to show tooltip
    - [ ] 15.5. Build MonthNavigator component — prev/next month, Today button
    - [ ] 15.6. Render session dots per DayCell (color = first tag's color or default accent)
    - [ ] 15.7. Show up to 3 dots + overflow indicator (e.g. "+2") for busy days
    - [ ] 15.8. Click a DayCell — setSelectedDate(day), load that day's tasks into sidebar
    - [ ] 15.9. Fetch sessions from API for visible month range on mount and month navigation
    - [ ] 15.10. Cache sessions in Zustand to avoid redundant fetches

- [ ] 16. Build client tasks feature
    - [ ] 16.1. Create client/src/features/tasks/stores/tasksStore.ts — Zustand: tasks[], selectedDate, fetchTasks, createTask, updateTask, deleteTask, cancelTask
    - [ ] 16.2. Create client/src/features/tasks/services/taskApi.ts — API calls for tasks
    - [ ] 16.3. Build TaskList component (features/tasks/components/TaskList/) — renders tasks for selectedDate
    - [ ] 16.4. Build TaskItem component — title, tag color dots, taskStatus badge, edit icon, delete icon, cancel button (for OFFICE type)
    - [ ] 16.5. Build AddTaskForm component — inline form: title input, taskType selector, tag multi-select, submit
    - [ ] 16.6. Build TaskTagFilter component — filter tasks by tag (All / per-tag)
    - [ ] 16.7. Show/hide completed tasks toggle
    - [ ] 16.8. "No tasks yet" empty state with prompt to add one
    - [ ] 16.9. Cancel task button — visible only for OFFICE/PENDING tasks, calls POST /api/tasks/:id/cancel

- [ ] 17. Build client templates feature
    - [ ] 17.1. Create client/src/features/templates/stores/templatesStore.ts — Zustand: templates[], CRUD actions
    - [ ] 17.2. Create client/src/features/templates/services/templateApi.ts
    - [ ] 17.3. Build TemplateList component — list all templates
    - [ ] 17.4. Build TemplateForm component — create/edit template: title, description, taskType, repeatRule, repeatDays, timeOfDay, officeHours, active toggle

- [ ] 18. Build client tags feature
    - [ ] 18.1. Create client/src/features/tags/stores/tagsStore.ts — Zustand: tags[], CRUD actions
    - [ ] 18.2. Create client/src/features/tags/services/tagApi.ts
    - [ ] 18.3. Build TagBadge component — colored name badge for display
    - [ ] 18.4. Build TagSelector component — multi-select for adding tags to tasks

- [ ] 19. Build client stats feature
    - [ ] 19.1. Create client/src/features/stats/stores/statsStore.ts — Zustand: todayStats, weeklyData, totalCount
    - [ ] 19.2. Build StatsPanel component — collapsible panel in header or slide-over drawer
    - [ ] 19.3. Build WeeklyChart component — 7-bar chart (focus minutes per day)
    - [ ] 19.4. Fetch stats from sessions API on dashboard load and after each session

- [ ] 20. Build client dashboard layout
    - [ ] 20.1. Build DashboardLayout (layout/dashboard/) — sidebar left, calendar main area right, dark-first theme
    - [ ] 20.2. Build Header component — logo, user info, settings icon, stats panel toggle
    - [ ] 20.3. Build Sidebar — date header, TaskList, AddTaskForm, TimerWidget, TaskTagFilter
    - [ ] 20.4. Assemble DashboardPage — composes DashboardLayout with all features
    - [ ] 20.5. Wire up responsive behavior: sidebar collapses on mobile (bottom drawer)
    - [ ] 20.6. Calendar scales down on mobile viewports

- [ ] 21. Wire up browser notifications and audio chime
    - [ ] 21.1. Request notification permission on first timer start
    - [ ] 21.2. Fire new Notification("Session complete!") when timer hits 0
    - [ ] 21.3. Play bell.mp3 via Web Audio API when timer hits 0
    - [ ] 21.4. Add timer sound toggle button (mute/unmute bell)

- [ ] 22. Set up client Docker
    - [ ] 22.1. Configure client/Dockerfile — build with Vite, serve with nginx
    - [ ] 22.2. Create nginx/nginx.conf — reverse proxy config (api → server, /* → client)
    - [ ] 22.3. Update docker-compose.dev.yml + docker-compose.prod.yml with nginx service

- [ ] 23. Set up client Android packaging
    - [ ] 23.1. Run npx cap init (app name, app ID, web app directory: dist)
    - [ ] 23.2. Run npx cap add android
    - [ ] 23.3. Configure capacitor.config.ts — dark theme, app name
    - [ ] 23.4. Sync web build to Android: npx cap sync android
    - [ ] 23.5. Build debug APK: cd android && ./gradlew assembleDebug
    - [ ] 23.6. Verify APK installs and runs on Android device/emulator
    - [ ] 23.7. Generate production APK: assembleRelease with signing config (optional)

- [ ] 24. Polish and final fixes
    - [ ] 24.1. Add PWA manifest (manifest.json) — app name, icons, theme color, display: standalone
    - [ ] 24.2. Settings panel — custom default durations, auto-start next session toggle
    - [ ] 24.3. Ensure all interactive elements have hover/focus/active states styled
    - [ ] 24.4. Final dark-theme audit — check all components for contrast, readability, consistency
    - [ ] 24.5. Test on mobile viewport (Chrome DevTools) — sidebar, calendar, timer all usable
    - [ ] 24.6. Add .test.tsx and .stories.tsx to all components/ (as required by template)
