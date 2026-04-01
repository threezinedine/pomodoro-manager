# API Playground — Swagger UI

## Context

As the server grows with more features (tasks, sessions, templates, tags), manually testing endpoints via `curl` or Postman becomes tedious. An interactive API playground makes development faster and serves as living documentation.

## Plan

### Step 1 — Install dependencies

- `npm install swagger-ui-express swagger-jsdoc` in `server/`
- Dev dependency (not needed in production Docker build, but fine to include)

### Step 2 — Create OpenAPI 3.0 spec

File: `server/src/openapi.yaml`

Document all endpoints with:
- Path, method, summary, description
- Request body schema (JSON Schema inline)
- Response schemas (200, 201, 400, 401, 404)
- Security: Bearer token on all `/api/*` routes

Endpoints to document:
- `POST /api/auth/token` — no auth required
- `GET /api/tasks?date=YYYY-MM-DD`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/cancel`
- `POST /api/tasks/:id/tags`
- `DELETE /api/tasks/:id/tags/:tagId`
- `GET /api/tags`
- `POST /api/tags`
- `DELETE /api/tags/:id`
- `POST /api/sessions` *(future)*
- `PUT /api/sessions/:id/reset` *(future)*
- `PUT /api/sessions/:id/complete` *(future)*
- `GET /api/sessions` *(future)*
- `DELETE /api/sessions/:id` *(future)*
- `GET /api/templates` *(future)*
- `POST /api/templates` *(future)*
- `PUT /api/templates/:id` *(future)*
- `DELETE /api/templates/:id` *(future)*

### Step 3 — Wire Swagger into Express

File: `server/src/config/swagger.ts`

- Load `openapi.yaml` as string
- Configure `swagger-jsdoc` options (servers pointing to Docker URL in dev: `http://localhost:3000`, prod: `http://server:3000`)

File: `server/src/main.ts`

- Import swagger setup
- Add `app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec))` — must be **before** `authMiddleware` for the docs route itself (or use a separate unauthenticated route)
- Strategy: mount at `/api/docs` WITHOUT auth middleware (swagger-ui-express serves its own static assets)

### Step 4 — Authorize button in Swagger UI

Since all API routes use Bearer token auth, pre-fill the `Authorization: Bearer changeme` header in Swagger UI:
- Set `presets: [swaggerUi.presets.apis]` and `supportedSubmitMethods: ['get', 'post', 'put', 'delete']`
- Use `initOptions` or `configUrl` approach to set default headers

Simpler approach: document that `AUTH_TOKEN=changeme` from `.env` is the Bearer token. In dev, users open `/api/docs`, click "Authorize", enter `Bearer changeme`.

### Step 5 — Ensure Docker exposes server port

The dev compose already exposes `3000:3000`. Verify nginx doesn't proxy `/api/docs` (it only routes `/api/*` → server), so `/api/docs` is accessible directly.

## Files to create/modify

| File | Action |
|------|--------|
| `server/src/openapi.yaml` | Create |
| `server/src/config/swagger.ts` | Create |
| `server/src/main.ts` | Modify — add Swagger route |
| `server/package.json` | Modify — add dependencies |

## Verification

- Visit `http://localhost:8080/api/docs` (through nginx) or `http://localhost:3000/api/docs` (direct)
- All documented endpoints appear in the UI
- Click "Authorize" → enter `Bearer changeme` → protected endpoints return real data
- Health check (`GET /health`) visible without auth

## Impact on other tasks

- Swagger spec will be updated incrementally as new features (sessions 7, templates 8, tags 9) are built
- Task 10 (health feature) — Swagger should include the health endpoint
