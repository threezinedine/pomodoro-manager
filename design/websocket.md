# WebSocket Design — Real-time Session Sync

## Context

The client needs to stay in sync with running Pomodoro sessions. The app is single-user (Bearer token auth), but multiple browser tabs or a mobile app could be open simultaneously. Polling is acceptable but WebSockets give:

- Instant updates across all connected clients (tabs)
- No polling overhead
- Foundation for future features (live notifications, shared timers)

## Architecture

```
Client (React)                  Server (Express + ws)
────────────────                ───────────────────────────
WS.connect(token)     ────     Authenticate, join user room
                                 ↓
start/pause/resume    ────→    Express REST API
(React action)                  processes request
                                         ↓
  ←←←←←←←←←←←←←←←←←←←←←←    ws.broadcast(userId, event)
```

- WebSocket server attaches to the same HTTP server as Express
- Auth: same Bearer token — sent on connection, validated server-side
- Rooms: one room per `userId`. Only the authenticated user's connections receive events
- Express REST remains the source of truth. WebSocket is purely for broadcasting state changes

## Message Protocol

### Client → Server

```typescript
// Outgoing messages (client sends)
// type: 'auth' — sent immediately on connect
{ type: 'auth', token: 'Bearer changeme' }

// type: 'ping' — keepalive, server replies 'pong'
{ type: 'ping' }
```

### Server → Client

```typescript
// Incoming messages (server broadcasts)
// Session started
{
  type: 'SESSION_STARTED',
  payload: {
    session: PomodoroSession,
    task: Task,
  }
}

// Session paused (completed)
{
  type: 'SESSION_PAUSED',
  payload: {
    session: PomodoroSession,  // status: COMPLETED
    task: Task,
  }
}

// Session resumed (new session started)
{
  type: 'SESSION_RESUMED',
  payload: {
    session: PomodoroSession,   // status: RUNNING
    task: Task,
  }
}

// Session completed (timer fully finished)
{
  type: 'SESSION_COMPLETED',
  payload: {
    session: PomodoroSession,   // status: COMPLETED
    task: Task,
  }
}

// Session reset (timer manually stopped)
{
  type: 'SESSION_RESET',
  payload: {
    session: PomodoroSession,   // status: RESET
    task: Task,
  }
}

// Auth result
{ type: 'AUTH_OK' }
{ type: 'AUTH_FAILED', message: string }

// Pong
{ type: 'pong' }

// Error
{ type: 'ERROR', message: string }
```

## Events That Trigger Broadcasts

These Express REST handlers emit WebSocket events after persisting to DB:

| REST Handler | WebSocket Event |
|---|---|
| `POST /api/tasks/:id/start` | `SESSION_STARTED` |
| `POST /api/tasks/:id/pause` | `SESSION_PAUSED` |
| `POST /api/tasks/:id/resume` | `SESSION_RESUMED` |
| `PUT /api/sessions/:id/complete` | `SESSION_COMPLETED` |
| `PUT /api/sessions/:id/reset` | `SESSION_RESET` |

## File Structure

```
server/src/
  ws/
    server.ts          — WebSocket server, auth, rooms, ping/pong
    broadcast.ts       — Helper: broadcast(event, userId, payload)
  features/
    sessions/
      sessions.service.ts  — Import broadcast, emit after DB write
```

## Detailed Design

### server/src/ws/server.ts

- Uses `ws` npm package
- `Server<WebSocket>` attached to the HTTP server (passed from server-entry.ts)
- Connection map: `Map<userId, Set<WebSocket>>` — one room per user
- On connect: client sends `{ type: 'auth', token }`. Server validates Bearer token. On success: add to user room, send `AUTH_OK`. On failure: send `AUTH_FAILED`, close connection
- Ping/pong: server sends `{ type: 'ping' }` every 30s. Client replies `{ type: 'pong' }`. If no pong in 10s → close connection
- On disconnect: remove from room. If room empty → delete room

### server/src/ws/broadcast.ts

```typescript
function broadcast(userId: string, event: string, payload: object): void
```

Iterates all WebSockets in the user's room, sends `JSON.stringify({ type: event, payload })`. Silently skips closed connections.

### server/src/ws/index.ts

```typescript
import { createWsServer } from './server';
import { broadcast } from './broadcast';
export { createWsServer, broadcast };
```

### sessions.service.ts changes

After each DB write, call `broadcast(userId, 'SESSION_STARTED', { session, task })` etc. No response changes — REST API response unchanged.

### server-entry.ts

```typescript
import { createWsServer } from './ws';
// ... after app.listen ...
createWsServer(httpServer);
```

### Client (React) — brief notes for task 14

```typescript
// useWebSocket hook
// - Connect to ws://host/ws on mount (or reconnect on token change)
// - Handle SESSION_STARTED, SESSION_PAUSED, SESSION_RESUMED, SESSION_COMPLETED, SESSION_RESET
// - Update Zustand timerStore on each event
// - Auto-reconnect on disconnect with exponential backoff
```

## Security

- Same Bearer token as REST API — no separate WS auth mechanism
- User can only join their own room (validated against `userId` derived from token)
- No rate limiting on WS in v1 (single-user, low message volume)

## Dependencies

- `ws` — pure WebSocket server (no Socket.io, keeps bundle small)

## Connection URL

```
ws://localhost:3000/ws        (local dev)
ws://server:3000/ws           (Docker internal)
wss://.../ws                 (production, if HTTPS)
```

## No Breaking Changes

- REST API unchanged — all existing endpoints work as-is
- No changes to Prisma schema needed
- WebSocket is purely additive — if WS fails, app continues to work via REST polling

## Impact on Other Tasks

- Task 14 (client timer): `useWebSocket` hook replaces polling
- Task 6b.5 (Swagger): add WS connection info to openapi.yaml docs
