import type { Server as HTTPServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { broadcast, joinRoom, leaveRoom } from './broadcast';
import { prisma } from '../config/prisma';
import { AUTH_TOKEN, SYSTEM_USER_ID } from '../config/index';

const HEARTBEAT_INTERVAL = 30_000;   // 30s between heartbeats
const HEARTBEAT_TIMEOUT = 5_000;    // 5s to receive heartbeat ack before closing

/** Extended WebSocket with per-connection state */
interface WsWithState extends WebSocket {
  userId?: string;
  activeSessionId?: string;
  heartbeatTimer?: ReturnType<typeof setInterval>;
  heartbeatTimeout?: ReturnType<typeof setTimeout>;
  alive?: boolean;
}

export function createWsServer(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WsWithState) => {
    ws.alive = true;

    // Heartbeat: start after the first message (which is always auth)
    // This gives ~30s before the first ping, plenty of time for auth to complete
    ws.once('message', () => {
      ws.heartbeatTimer = setInterval(() => {
        if (ws.readyState !== ws.OPEN) return;
        ws.alive = false;
        ws.send(JSON.stringify({ type: 'ping' }));
        ws.heartbeatTimeout = setTimeout(() => {
          if (!ws.alive) ws.terminate();
        }, HEARTBEAT_TIMEOUT);
      }, HEARTBEAT_INTERVAL);
    });

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; [key: string]: unknown };

        switch (msg.type) {
          case 'auth':
            handleAuth(ws, msg.token as string);
            break;

          case 'start':
            if (!ws.userId) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }));
              return;
            }
            await handleStart(ws, ws.userId, msg.taskId as string, msg.plannedMinutes as number | undefined);
            break;

          case 'close':
            if (!ws.userId) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }));
              return;
            }
            await handleClose(ws, ws.userId);
            break;

          case 'pong':
            // Heartbeat acknowledgment — client confirmed they're alive
            ws.alive = true;
            break;

          default:
            ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown message type: ${msg.type}` }));
        }
      } catch {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
      }
    });

    ws.on('close', () => {
      clearInterval(ws.heartbeatTimer);
      clearTimeout(ws.heartbeatTimeout);
      clearTimeout(ws.heartbeatTimeout);

      if (ws.userId) {
        leaveRoom(ws.userId, ws);

        if (ws.activeSessionId) {
          // Fire-and-forget: auto-complete happens async so it doesn't block close
          autoCompleteSession(ws.userId, ws.activeSessionId).catch(() => {
            // Swallow: happens when session already completed or connection already gone
          });
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });

    // Handle TCP-level pong (for raw ping frames — less common)
    ws.on('pong', () => {
      ws.alive = true;
    });
  });

  return wss;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function handleAuth(ws: WsWithState, token: string): void {
  if (token !== AUTH_TOKEN) {
    ws.send(JSON.stringify({ type: 'AUTH_FAILED', message: 'Invalid token' }));
    ws.close();
    return;
  }

  ws.userId = SYSTEM_USER_ID;
  joinRoom(ws.userId, ws);
  ws.send(JSON.stringify({ type: 'AUTH_OK' }));
}

// ─── Start ───────────────────────────────────────────────────────────────────

async function handleStart(ws: WsWithState, userId: string, taskId: string, plannedMinutes = 25): Promise<void> {
  if (!taskId) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'taskId is required' }));
    return;
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
  });

  if (!task) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Task not found' }));
    return;
  }

  if (task.taskType !== 'POMODORO') {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Sessions can only be started for POMODORO tasks' }));
    return;
  }

  const active = await prisma.pomodoroSession.findFirst({
    where: { userId, status: 'RUNNING', deletedAt: null },
  });

  if (active) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'A session is already active' }));
    return;
  }

  const session = await prisma.pomodoroSession.create({
    data: {
      taskId,
      userId,
      taskType: task.taskType,
      plannedMinutes,
      startedAt: new Date(),
      status: 'RUNNING',
    },
  });

  ws.activeSessionId = session.id;

  broadcast(userId, 'SESSION_STARTED', {
    session: {
      id: session.id,
      taskId: session.taskId,
      taskType: session.taskType,
      plannedMinutes: session.plannedMinutes,
      startedAt: session.startedAt,
      status: session.status,
    },
    task: { id: task.id, title: task.title, taskType: task.taskType },
  });
}

// ─── Close ───────────────────────────────────────────────────────────────────

async function handleClose(ws: WsWithState, userId: string): Promise<void> {
  const sessionId = ws.activeSessionId;
  if (!sessionId) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'No active session' }));
    return;
  }

  ws.activeSessionId = undefined;
  await autoCompleteSession(userId, sessionId);
}

// ─── Auto-complete ─────────────────────────────────────────────────────────────

async function autoCompleteSession(userId: string, sessionId: string): Promise<void> {
  try {
    const session = await prisma.pomodoroSession.findFirst({
      where: { id: sessionId, userId, status: 'RUNNING', deletedAt: null },
      include: { task: true },
    });

    if (!session) return;

    const elapsedMs = Date.now() - session.startedAt.getTime();
    const actualMinutes = Math.max(1, Math.round(elapsedMs / 60_000));

    const updated = await prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        actualMinutes,
        endedAt: new Date(),
      },
    });

    broadcast(userId, 'SESSION_COMPLETED', {
      session: {
        id: updated.id,
        taskId: updated.taskId,
        plannedMinutes: updated.plannedMinutes,
        actualMinutes: updated.actualMinutes,
        startedAt: updated.startedAt,
        endedAt: updated.endedAt,
        status: updated.status,
      },
      task: { id: session.task.id, title: session.task.title },
    });
  } catch {
    // Silenced: thrown when session already completed (e.g. explicit close then disconnect)
  }
}
