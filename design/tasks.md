- [ ] 1. Initialize monorepo structure (`/client`, `/server` root-level folders)
    - [ ] 1.1. Initialize server: Express + TypeScript project
    - [ ] 1.2. Initialize client: React 18 + Vite + TypeScript project
    - [ ] 1.3. Add Tailwind CSS to client with dark-first theme config
    - [ ] 1.4. Install and configure Capacitor (android platform)
    - [ ] 1.5. Set up Docker environment (Docker and Docker Compose installed locally)
    - [ ] 1.6. Create docker-compose.yml — define services: server (Node.js), client (nginx), mysql (official image)
    - [ ] 1.7. Create server Dockerfile — multi-stage build (build + production stage)
    - [ ] 1.8. Create server/.dockerignore to exclude node_modules, dist, prisma/migrations
    - [ ] 1.9. Create client Dockerfile — build stage with Vite, serve with nginx (production stage)
    - [ ] 1.10. Create client/.dockerignore to exclude node_modules, dist
    - [ ] 1.11. Verify shell project builds and Android APK generates

- [ ] 2. Install project dependencies
    - [ ] 2.1. Install Zustand in client
    - [ ] 2.2. Install React Router v6 in client
    - [ ] 2.3. Install Prisma in server (@prisma/client, prisma CLI)
    - [ ] 2.4. Install Express, CORS, body-parser in server
    - [ ] 2.5. Add bell sound file (.mp3) to client public/ directory

- [ ] 3. Set up database and Prisma schema
    - [ ] 3.1. Initialize Prisma with MySQL (update schema provider to mysql)
    - [ ] 3.2. Define User model (id, createdAt — reserved for future)
    - [ ] 3.3. Define Project model (id, name, color, userId)
    - [ ] 3.4. Define Task model (id, title, projectId, userId, date, completed)
    - [ ] 3.5. Define PomodoroSession model (id, taskId, userId, startedAt, endedAt, durationMinutes)
    - [ ] 3.6. Run Prisma migrations (connect to MySQL container)
    - [ ] 3.7. Seed a predefined auth token into the DB

- [ ] 4. Build Express REST API routes
    - [ ] 4.1. POST /api/auth/token — validate predefined token, return user info
    - [ ] 4.2. GET /api/tasks?date=YYYY-MM-DD — list tasks for a specific day (auth required)
    - [ ] 4.3. POST /api/tasks — create task with { title, date, projectId? } (auth required)
    - [ ] 4.4. PUT /api/tasks/:id — update task title, project, completed status (auth required)
    - [ ] 4.5. DELETE /api/tasks/:id — delete task (auth required)
    - [ ] 4.6. GET /api/projects — list all projects for current user (auth required)
    - [ ] 4.7. POST /api/projects — create project with { name, color } (auth required)
    - [ ] 4.8. DELETE /api/projects/:id — delete project (auth required)
    - [ ] 4.9. GET /api/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD — list sessions in date range (auth required)
    - [ ] 4.10. POST /api/sessions — log completed session with { taskId?, startedAt, endedAt, durationMinutes } (auth required)

- [ ] 5. Add backend middleware and testing
    - [ ] 5.1. Add CORS middleware (allow client origin)
    - [ ] 5.2. Add JSON body parsing middleware
    - [ ] 5.3. Add auth middleware (extract user from token, attach to req.user)
    - [ ] 5.4. Write basic API integration tests

- [ ] 6. Set up React Router with routes
    - [ ] 6.1. Configure routes: / (login), /dashboard (main app)
    - [ ] 6.2. Build / login page: token input field, submit button, error state
    - [ ] 6.3. Guard /dashboard route — redirect to / if no valid token in localStorage
    - [ ] 6.4. Store token in localStorage on successful login; read on app load

- [ ] 7. Build Zustand stores
    - [ ] 7.1. useAuthStore — token, userId, login/logout actions
    - [ ] 7.2. useAppStore — selectedDate (default: today), setSelectedDate action
    - [ ] 7.3. useTasksStore — tasks for selected date, fetchTasks, createTask, updateTask, deleteTask
    - [ ] 7.4. useProjectsStore — projects list, fetchProjects, createProject, deleteProject
    - [ ] 7.5. useSessionsStore — sessions for visible month range, fetchSessions, createSession
    - [ ] 7.6. useTimerStore — isRunning, duration, remaining, start, pause, resume, reset, tick

- [ ] 8. Create API client
    - [ ] 8.1. Create api/client.ts — Axios instance with base URL and auth header interceptor
    - [ ] 8.2. Create typed API functions matching all backend routes
    - [ ] 8.3. Handle API errors gracefully (show toast/alert, no crashes)

- [ ] 9. Build dashboard layout components
    - [ ] 9.1. DashboardLayout — flex/grid container: fixed sidebar left, calendar main area right
    - [ ] 9.2. Sidebar — left column: date header, task panel, timer widget
    - [ ] 9.3. CalendarView — main area component
    - [ ] 9.4. Header — top bar: app logo/name, settings icon, user info

- [ ] 10. Implement responsive layout behavior
    - [ ] 10.1. On mobile: sidebar collapses to bottom drawer or slide-over panel
    - [ ] 10.2. Calendar scales down on smaller viewports (no horizontal scroll)
    - [ ] 10.3. Timer widget remains accessible at all breakpoints

- [ ] 11. Build month grid calendar
    - [ ] 11.1. CalendarView — full-width month grid (7 columns x 5-6 rows)
    - [ ] 11.2. Day-of-week headers row (Sun-Sat or Mon-Sun)
    - [ ] 11.3. Each DayCell shows: date number, session dots (colored bars)
    - [ ] 11.4. prevMonth / nextMonth navigation buttons
    - [ ] 11.5. Today button — jumps back to current month
    - [ ] 11.6. Click a DayCell — calls setSelectedDate(day) in Zustand

- [ ] 12. Implement session dots on calendar
    - [ ] 12.1. Each DayCell renders a dot for every PomodoroSession on that day
    - [ ] 12.2. Dot color = linked task's project color (or default accent if no task)
    - [ ] 12.3. Multiple sessions — show up to 3 dots + overflow indicator (e.g. "+2")
    - [ ] 12.4. Click a session dot — show tooltip/popover: task name, duration, start time
    - [ ] 12.5. Session data fetched from GET /api/sessions?from=&to= for visible month range
    - [ ] 12.6. Cache sessions in Zustand to avoid redundant fetches on month navigation

- [ ] 13. Build task list in sidebar
    - [ ] 13.1. TaskList component — renders tasks for selectedDate from Zustand
    - [ ] 13.2. Each TaskItem shows: title, project color dot, complete checkbox, edit icon, delete icon
    - [ ] 13.3. "No tasks yet" empty state with a prompt to add one
    - [ ] 13.4. Filter dropdown in sidebar header — filter by project (All / per-project option)
    - [ ] 13.5. Show/hide completed tasks toggle

- [ ] 14. Build add / edit task functionality
    - [ ] 14.1. AddTaskForm — inline form in sidebar: title input + Add button
    - [ ] 14.2. New task button expands an inline form if not already open
    - [ ] 14.3. Optional: project selector dropdown + color picker
    - [ ] 14.4. On submit — call createTask({ title, date, projectId? }) — update Zustand
    - [ ] 14.5. EditTaskModal — modal for editing task title / project / completed status
    - [ ] 14.6. Delete button — confirmation — call deleteTask(id) — update Zustand

- [ ] 15. Build timer widget in sidebar
    - [ ] 15.1. TimerWidget — prominent duration display (large mm:ss text)
    - [ ] 15.2. Quick-select duration buttons: 5 min / 15 min / 25 min
    - [ ] 15.3. Custom duration input — numeric field, type any number of minutes
    - [ ] 15.4. Active task selector dropdown — pick which task this session is for (optional)
    - [ ] 15.5. Control buttons: Start / Pause / Resume / Reset
    - [ ] 15.6. Session type indicator (Work / Break — toggleable mode)
    - [ ] 15.7. Session count display (e.g. Session 3)

- [ ] 16. Implement timer logic
    - [ ] 16.1. useTimerStore — start(), pause(), resume(), reset(), tick() (called every second)
    - [ ] 16.2. tick() decrements remaining seconds; dispatches notification + chime when it hits 0
    - [ ] 16.3. On timer end — call createSession({ taskId?, startedAt, endedAt, durationMinutes })
    - [ ] 16.4. Session appears in calendar immediately (update Zustand sessions cache)
    - [ ] 16.5. Persist active timer state (isRunning, remaining, startedAt) to localStorage
    - [ ] 16.6. On page reload — restore timer from localStorage (show timer was running state)
    - [ ] 16.7. Auto-reset UI (clear remaining time, reset to initial state) after session ends

- [ ] 17. Wire up browser notifications and audio chime
    - [ ] 17.1. Request notification permission on first timer start
    - [ ] 17.2. Fire new Notification("Session complete!") when timer hits 0
    - [ ] 17.3. Play .mp3 bell sound via new Audio() or Web Audio API when timer hits 0

- [ ] 18. Build stats panel
    - [ ] 18.1. StatsPanel — collapsible panel in sidebar header or a slide-over drawer
    - [ ] 18.2. Today's progress section: total focus minutes + number of completed sessions
    - [ ] 18.3. This week section: simple bar chart (7 bars, one per day, height = minutes)
    - [ ] 18.4. All time section: total Pomodoro count
    - [ ] 18.5. Data fetched from GET /api/sessions on dashboard load and after each session

- [ ] 19. Set up Capacitor for Android
    - [ ] 19.1. Run npx cap init (app name, app ID, web app directory)
    - [ ] 19.2. Run npx cap add android
    - [ ] 19.3. Configure capacitor.config.ts — dark theme, app name, web directory path
    - [ ] 19.4. Sync web build to Android: npx cap sync android
    - [ ] 19.5. Build debug APK: cd android && ./gradlew assembleDebug
    - [ ] 19.6. Verify APK installs and runs on Android device/emulator
    - [ ] 19.7. Test browser notifications work on Android (Capacitor Notification plugin if needed)
    - [ ] 19.8. Generate production APK: assembleRelease with signing config (optional)

- [ ] 20. Polish and final fixes
    - [ ] 20.1. Add PWA manifest (manifest.json) — app name, icons, theme color, display: standalone
    - [ ] 20.2. Timer sound toggle button (mute/unmute the bell)
    - [ ] 20.3. Settings panel — custom default durations, auto-start next session toggle
    - [ ] 20.4. Ensure all interactive elements have hover/focus/active states styled
    - [ ] 20.5. Final dark-theme audit — check all components for contrast, readability, consistency
    - [ ] 20.6. Test on mobile viewport (Chrome DevTools) — sidebar, calendar, timer all usable
