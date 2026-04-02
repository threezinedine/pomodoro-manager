# WebSocket Design — Real-time Session Sync

## Context

The client needs to stay in sync with running Pomodoro sessions. Rather than a hybrid REST+WS approach, the WebSocket **IS** the session lifecycle — cleaner, simpler, no polling.

## Architecture

```
Client                              Server (Express + ws)
───────────────────────────    ─────────────────────────────────────
1. connect ws://host/ws        →  accept connection
2. send { type: 'auth', token } →  validate Bearer token, join user room
                                    send { type: 'AUTH_OK' }
────────────────────────────────────────────────────────────────────
3. send { type: 'start', taskId } →  validate taskId (must be POMODORO)
                                      DB: create PomodoroSession (RUNNING)
                                      broadcast { type: 'SESSION_STARTED', session }
                                      ←←←←← SESSION_STARTED ←←←←
────────────────────────────────────────────────────────────────────
4. timer runs in client browser
   (no server interaction needed)
────────────────────────────────────────────────────────────────────
5. disconnect WS               →  DB: complete session (COMPLETED, actualMinutes)
   OR send { type: 'close' }     broadcast { type: 'SESSION_COMPLETED', session }
────────────────────────────────────────────────────────────────────
```

## Key Design Principle

**WebSocket IS the session.** The connection itself represents an active timer.
- `connect` + `start` → creates DB session (RUNNING)
- `disconnect` / `close` → completes DB session (COMPLETED, actualMinutes calculated)
- No HTTP requests needed for session lifecycle

## WebSocket Message Protocol

### Client → Server

```typescript
// Authenticate immediately after connect
{ type: 'auth', token: 'Bearer changeme' }

// Start a Pomodoro session
{ type: 'start', taskId: 'uuid', plannedMinutes?: number }
// plannedMinutes defaults to 25

// Close/end the current session (optional — disconnect also triggers this)
{ type: 'close' }

// Keepalive ping
{ type: 'ping' }
```

### Server → Client

```typescript
// Auth result
{ type: 'AUTH_OK' }
{ type: 'AUTH_FAILED', message: string }

// Session started
{
  type: 'SESSION_STARTED',
  payload: {
    session: { id, taskId, taskType, plannedMinutes, startedAt, status: 'RUNNING' },
    task: { id, title, taskType },
  }
}

// Session completed (triggered by disconnect or 'close')
{
  type: 'SESSION_COMPLETED',
  payload: {
    session: { id, taskId, plannedMinutes, actualMinutes, startedAt, endedAt, status: 'COMPLETED' },
    task: { id, title },
  }
}

// Error
{ type: 'ERROR', message: string }

// Pong (reply to ping)
{ type: 'pong' }

// Ping (server → client, 30s keepalive)
{ type: 'ping' }
```

## Server-Side Logic

### On `auth`
1. Extract token from `token` field
2. Validate against `AUTH_TOKEN` env var
3. If valid: derive `userId = SYSTEM_USER_ID`, add WS to user room, send `AUTH_OK`
4. If invalid: send `AUTH_FAILED`, close connection

### On `start`
1. Validate `taskId` is present
2. Fetch task from DB — must belong to `userId`, must be `taskType: POMODORO`
3. If task not found or wrong type → send `{ type: 'ERROR', message: '...' }`
4. Check no other active RUNNING session exists for this user
5. DB: create `PomodoroSession { status: 'RUNNING', startedAt: now() }`
6. Store `activeSessionId` in the WS connection state
7. Broadcast `SESSION_STARTED` to user's room

### On `close`
1. Check `activeSessionId` on WS connection state
2. If none → send `{ type: 'ERROR', message: 'No active session' }`
3. DB: update session to `{ status: 'COMPLETED', actualMinutes: elapsed, endedAt: now() }`
4. Broadcast `SESSION_COMPLETED` to user's room
5. Clear `activeSessionId`

### On disconnect
1. Check `activeSessionId` on WS connection state
2. If active → same as `close` logic above (auto-complete)
3. Remove WS from user room

### Keepalive
- Server sends `{ type: 'ping' }` every 30s to each connection
- Client must reply `{ type: 'pong' }` within 5s
- If no pong received → close connection (triggers auto-complete)

## Data Flow

```
WS connect + auth
      ↓
WS: { type: 'start', taskId }
      ↓
validate task (POMODORO only)
      ↓
DB INSERT PomodoroSession (RUNNING)
      ↓
broadcast SESSION_STARTED → user room
      ↓
client starts local timer (no server contact needed)
      ↓
[30s ping/pong keepalive]
      ↓
client disconnects OR sends { type: 'close' }
      ↓
DB UPDATE PomodoroSession (COMPLETED, actualMinutes = now - startedAt)
      ↓
broadcast SESSION_COMPLETED → user room
```

## File Structure

```
server/src/
  ws/
    server.ts       — WS server: connect/disconnect/auth/start/close/ping handlers
    broadcast.ts   — Helper: broadcast(userId, event, payload)
    index.ts        — Re-exports
```

## Changes to REST API

### Remove (sessions no longer managed via REST)
- `POST /api/sessions` — deleted
- `PUT /api/sessions/:id/complete` — deleted
- `PUT /api/sessions/:id/reset` — deleted
- `POST /api/tasks/:id/start` — deleted (now via WS `start` message)
- `POST /api/tasks/:id/pause` — deleted (now via WS `close` message)
- `POST /api/tasks/:id/resume` — deleted (now via WS `start` again)

### Keep (read-only)
- `GET /api/sessions` — list sessions for calendar/analytics
- `DELETE /api/sessions/:id` — soft delete (admin/data cleanup)

## WebSocket Route

```
ws://localhost:3000/ws         (local dev)
ws://server:3000/ws            (Docker)
```

## Security

- Same Bearer token as REST API — no separate WS auth mechanism
- User can only interact with their own sessions (validated against `userId`)
- One active session per user at a time (enforced server-side)

## Prisma Schema — No Changes Needed

`PomodoroSession` model already has all fields needed. No new columns required.

## Dependencies

- `ws` — pure WebSocket server

## Impact on Tasks

- Task 6 (tasks feature): remove `start`, `pause`, `resume` from tasks routes/controller/service
- Task 7 (sessions feature): remove `create`, `complete`, `reset` from sessions routes/controller/service; keep `list`, `delete`
- Task 6c (WS): add WebSocket server as described above
- Task 14 (client timer): `useWebSocket` hook replaces all timer-related REST calls

## Testing Strategy

### Tooling

- `ws` package — server-side (already chosen)
- `ws` client — for test connections (same package, simple enough without Socket.io client)
- Jest with `testEnvironment: 'node'` — no jsdom needed for WS tests
- `jest-websocket` or raw `ws` client — avoid over-engineering; raw `ws` client is sufficient

No test framework has first-class WS support in Jest the way supertest handles HTTP. The simplest reliable approach is: start a real HTTP+WS server per test file, connect real `ws` clients, send raw JSON messages, collect server responses.

### Test File Structure

```
server/src/ws/
  ws.test.ts          — integration tests for the WS server lifecycle
  broadcast.test.ts    — unit tests for broadcast helper (no WS needed)
```

### Approach: Real HTTP+WS Server Per Test

```typescript
describe('WS session lifecycle', () => {
  let server: http.Server;
  let wss: ws.Server;

  beforeAll((done) => {
    // Create fresh Express app + WS server per test suite
    const app = createTestApp(); // minimal Express with mocked Prisma
    server = http.createServer(app);
    wss = createWsServer(server as unknown as http.Server);
    server.listen(0, done); // port 0 = random available port
  });

  afterAll((done) => {
    wss.close();
    server.close(done);
  });
});
```

Key: create a **separate test app** (not the production `app`) so DB state is isolated from REST integration tests.

### Prisma Mocking Strategy

WS tests need to hit the DB. Two options:

**Option A — Real DB with `beforeEach` cleanup (recommended)**
- Use the same MySQL test DB as REST tests
- `beforeEach`: delete all `PomodoroSession` rows for `SYSTEM_USER_ID`
- `afterEach`: delete created rows
- Deterministic — tests see real DB behavior

**Option B — Prisma client mock with `jest.mock`**
- Mock `prisma.pomodoroSession.create/findMany/update`
- More isolation but fragile — mocks can diverge from real behavior
- Useful for unit-testing `broadcast()` in isolation (no DB needed)

Use **Option A** for the full lifecycle tests, **Option B** for pure unit tests.

### Test Cases

#### Unit — broadcast helper (no WS, no DB)

```typescript
describe('broadcast', () => {
  it('sends JSON to all connections in user room', () => {
    // Mock two WS connections for same userId
    // Call broadcast(userId, 'TEST_EVENT', { foo: 'bar' })
    // Assert both ws.send was called with JSON payload
  });

  it('silently skips closed connections', () => {
    // One closed WS, one open WS
    // broadcast should not throw
  });
});
```

#### Integration — auth

```typescript
it('AUTH — valid token → AUTH_OK', (done) => {
  const ws = new WebSocket(`ws://localhost:${port}/ws`);
  ws.on('open', () => {
    ws.send(JSON.stringify({ type: 'auth', token: 'Bearer changeme' }));
  });
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    expect(msg.type).toBe('AUTH_OK');
    ws.close();
    done();
  });
});

it('AUTH — invalid token → AUTH_FAILED + connection closed', (done) => {
  const ws = new WebSocket(`ws://localhost:${port}/ws`);
  ws.on('open', () => {
    ws.send(JSON.stringify({ type: 'auth', token: 'Bearer wrong' }));
  });
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    expect(msg.type).toBe('AUTH_FAILED');
  });
  ws.on('close', () => done());
});
```

#### Integration — start session

```typescript
it('start — POMODORO task → SESSION_STARTED', (done) => {
  // Setup: create a POMODORO task in DB first
  // Connect WS, authenticate
  // Send { type: 'start', taskId: pomodoroTask.id }
  // Receive SESSION_STARTED with session.status === 'RUNNING'
  done();
});

it('start — non-POMODORO task → ERROR', (done) => {
  // Setup: create an OFFICE task
  // Connect WS, authenticate
  // Send { type: 'start', taskId: officeTask.id }
  // Receive ERROR with message about POMODORO requirement
  done();
});

it('start — second start while session active → ERROR (one session per user)', (done) => {
  // Start first session
  // Try to start second
  // Receive ERROR about already active session
  done();
});
```

#### Integration — disconnect auto-completes

```typescript
it('disconnect — active session auto-completes with actualMinutes', (done) => {
  // Setup: create POMODORO task + session
  // Capture session id from SESSION_STARTED
  // Close WS client abruptly (simulating tab crash)
  // Wait 100ms
  // Query DB: session should be COMPLETED with actualMinutes > 0
  done();
});

it('close message — ends active session', (done) => {
  // Start session
  // Send { type: 'close' }
  // Receive SESSION_COMPLETED
  // Verify DB session is COMPLETED
  done();
});

it('close — no active session → ERROR', (done) => {
  // Connect, authenticate, no session started
  // Send { type: 'close' }
  // Receive ERROR 'No active session'
  done();
});
```

#### Integration — ping/pong keepalive

```typescript
it('pong — server ping receives pong response', (done) => {
  // Spy on ws.send and capture all messages
  // After auth, server sends ping within 30s
  // Client must respond with pong
  done();
});

it('no pong — connection dropped', (done) => {
  // Mock client that never sends pong
  // After 5s timeout, server closes connection
  done();
});
```

#### Integration — multi-tab sync

```typescript
it('SESSION_STARTED — broadcast to all tabs of same user', (done) => {
  // Connect tab A + tab B (same userId)
  // Tab A sends { type: 'start', taskId }
  // Both tabs receive SESSION_STARTED
  let received = 0;
  [tabA, tabB].forEach((ws) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SESSION_STARTED') received++;
      if (received === 2) done();
    });
  });
  tabA.send(JSON.stringify({ type: 'start', taskId }));
});
```

### Test Isolation

| Concern | Solution |
|---------|----------|
| DB pollution between tests | `beforeEach` cleanup of `PomodoroSession` for `SYSTEM_USER_ID` |
| WS port conflicts | `server.listen(0)` — OS assigns random free port; store in `beforeAll` closure |
| Stale connections between tests | `afterEach`: close all WS clients; `afterAll`: close WS server + HTTP server |
| Timer-based tests (keepalive) | Mock server clock with `jest.useFakeTimers()` for ping/pong tests |
| Async/connection timing | Use `done` callbacks + small `setTimeout(..., 50)` after WS message to flush |

### jest.config.js — no changes needed

WS tests use the same Jest config as REST tests — `testEnvironment: 'node'`, same roots. Create a separate `ws.test.ts` alongside `ws/server.ts`.

### What NOT to test

- **WS message parsing edge cases** — minimal; message format is simple JSON with a `type` field
- **HTTP endpoints via WS** — WS only handles session lifecycle; REST handles everything else
- **Reconnection with exponential backoff** — that's client-side logic, belongs in client tests (task 14)

