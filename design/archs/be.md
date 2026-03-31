# Backend Architecture

## Overview

The backend follows a **feature-based** architecture. The core principle:

> **Source code that serves the same feature lives in the same place.**

Each feature is fully self-contained: routes, business logic, data access, schemas, and middleware. Cross-cutting concerns (DB connection, auth, error handling) live in a shared `core/` directory.

---

## Directory Tree

```plaintext
server/
├── src/
│   ├── main.ts                  # Application entry point (Express app factory)
│   │
│   ├── config/                 # Configuration & environment
│   │   ├── index.ts            # dotenv loading, env var exports
│   │   └── prisma.ts          # Prisma client singleton
│   │
│   ├── core/                   # Cross-cutting concerns (shared across all features)
│   │   ├── middleware/
│   │   │   ├── auth.ts        # Bearer token validation
│   │   │   ├── cors.ts        # CORS configuration
│   │   │   ├── errorHandler.ts # Global error handler
│   │   │   └── requestLogger.ts
│   │   ├── errors/
│   │   │   └── AppError.ts    # Custom error classes (NotFoundError, UnauthorizedError, etc.)
│   │   └── utils/
│   │       ├── date.ts        # Date / time helpers
│   │       └── response.ts    # Standardized response helpers
│   │
│   ├── features/               # Feature modules (self-contained bundles)
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.ts     # Route definitions
│   │   │   ├── auth.controller.ts # Request handlers
│   │   │   ├── auth.service.ts    # Business logic (token validation)
│   │   │   ├── auth.repository.ts # Data access
│   │   │   └── auth.test.ts      # Unit / integration tests
│   │   │
│   │   ├── tasks/
│   │   │   ├── tasks.routes.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.repository.ts
│   │   │   └── tasks.test.ts
│   │   │
│   │   ├── templates/
│   │   │   ├── templates.routes.ts
│   │   │   ├── templates.controller.ts
│   │   │   ├── templates.service.ts
│   │   │   ├── templates.repository.ts
│   │   │   ├── templates.test.ts
│   │   │   └── templates.cron.ts   # Auto-generation job
│   │   │
│   │   ├── sessions/
│   │   │   ├── sessions.routes.ts
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.service.ts
│   │   │   ├── sessions.repository.ts
│   │   │   └── sessions.test.ts
│   │   │
│   │   ├── tags/
│   │   │   ├── tags.routes.ts
│   │   │   ├── tags.controller.ts
│   │   │   ├── tags.service.ts
│   │   │   ├── tags.repository.ts
│   │   │   └── tags.test.ts
│   │   │
│   │   └── health/
│   │       └── health.routes.ts  # GET /health
│   │
│   └── jobs/                    # Scheduled / background jobs
│       └── generateTasks.ts     # Cron: daily task auto-generation from templates
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## Key Notes

### 1. Feature Modules are Self-Contained (`features/`)

Each feature owns everything it needs. If you want to understand `sessions`, you go to `features/sessions/` and find routes, controller, service, repository, and tests.

```plaintext
features/sessions/
├── sessions.routes.ts     → Express router: router.post('/', ...), router.put('/:id/reset', ...)
├── sessions.controller.ts → Request handlers: parse body, call service, return response
├── sessions.service.ts    → Business logic: validate, call repository, return data
├── sessions.repository.ts → Data access: Prisma queries
└── sessions.test.ts      → Unit + integration tests
```

Not every file is required in every feature:

| File | Required when... |
|---|---|
| `*.routes.ts` | The feature exposes HTTP endpoints. |
| `*.controller.ts` | The feature has request/response logic. |
| `*.service.ts` | The feature has non-trivial business logic. |
| `*.repository.ts` | The feature reads or writes to the database. |
| `*.cron.ts` | The feature has scheduled background jobs. |
| `*.test.ts` | Always — even if minimal. |

### 2. Shared Core (`core/`)

Only truly cross-cutting concerns go here:

| File/Dir | Purpose |
|---|---|
| `core/middleware/auth.ts` | Bearer token validation, `req.userId` attachment |
| `core/middleware/cors.ts` | CORS configuration |
| `core/middleware/errorHandler.ts` | Global error handler (maps AppError → HTTP response) |
| `core/errors/AppError.ts` | Custom error classes: `NotFoundError`, `UnauthorizedError`, `ValidationError` |
| `core/utils/response.ts` | `res.success(data)` and `res.error(message)` helpers |
| `config/prisma.ts` | Prisma client singleton |
| `config/index.ts` | Environment variable loading |

> **Rule of thumb:** If only one feature needs it, it belongs inside that feature. If two or more features need it, consider moving it to `core/`.

### 3. Request Lifecycle

```
HTTP Request
    │
    ├── core/middleware/cors.ts         (CORS headers)
    │
    ├── core/middleware/errorHandler.ts  (global error wrapper)
    │
    ├── features/{name}/routes.ts        (route definition)
    │       │
    │       ├── core/middleware/auth.ts  (token → req.userId)
    │       │
    │       ├── features/{name}/controller.ts  (parse, validate)
    │       │       │
    │       │       └── features/{name}/service.ts   (business logic)
    │       │               │
    │       │               └── features/{name}/repository.ts (Prisma queries)
    │       │                       │
    │       │                       └── config/prisma.ts  (client → MySQL)
    │       │
    │       └── controller returns response
    │
HTTP Response
```

### 4. Exception Handling

Define feature-specific errors in `core/errors/AppError.ts`. The global error handler maps them to HTTP status codes.

```typescript
// core/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
}

export class ValidationError extends AppError {
  statusCode = 400;
}
```

```typescript
// core/middleware/errorHandler.ts
export function errorHandler(err: Error, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
```

### 5. Data Access Pattern

The service layer never speaks to Prisma directly — it delegates to the repository.

```typescript
// features/tasks/tasks.service.ts
export class TasksService {
  constructor(private tasksRepo: TasksRepository) {}

  async createTask(data: CreateTaskDto, userId: string) {
    return this.tasksRepo.create({ ...data, userId });
  }

  async getTasksByDate(date: Date, userId: string) {
    return this.tasksRepo.findManyByDate(date, userId);
  }
}
```

```typescript
// features/tasks/tasks.repository.ts
export class TasksRepository {
  constructor(private prisma: PrismaClient) {}

  async findManyByDate(date: Date, userId: string) {
    return this.prisma.task.findMany({
      where: { userId, date, deletedAt: null },
      include: { tags: { include: { tag: true } } },
    });
  }
}
```

### 6. Auth Middleware

Token in `.env`, scoped to a single hardcoded `SYSTEM_USER_ID`.

```typescript
// core/middleware/auth.ts
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.userId = SYSTEM_USER_ID;
  next();
}
```

### 7. Cron Job — Task Auto-Generation

A daily job reads active templates and creates missing Task instances.

```typescript
// jobs/generateTasks.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateTasksFromTemplates() {
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

### 8. Configuration

Environment variables loaded once in `config/index.ts`:

```typescript
// config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  databaseUrl: process.env.DATABASE_URL!,
  authToken: process.env.AUTH_TOKEN!,
};
```

---

## Development Commands

```bash
npm run dev          # Start dev server (ts-node-dev)
npm run build       # TypeScript compilation
npm run start       # Production start
npm run test        # Run Jest tests
npm run migrate     # Run Prisma migrations
npm run seed        # Seed the database
npm run db:studio   # Open Prisma Studio
```
