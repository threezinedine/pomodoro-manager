import { createServer, Server } from 'http';
import { WebSocket } from 'ws';
import { createWsServer } from './server';
import { app } from '../main';

const AUTH_TOKEN = 'changeme';  // Bearer token value from .env
const TASKS_BASE = '/api/tasks';
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createTask(title = 'WS Test Task', taskType = 'POMODORO'): Promise<string> {
  const supertest = await import('supertest').then(m => m.default);
  const res = await supertest(app)
    .post(TASKS_BASE)
    .set('Authorization', `Bearer ${AUTH_TOKEN}`)
    .send({ title, taskType, date: '2026-04-01' });
  return res.body.data.id;
}

async function cleanupSessions(): Promise<void> {
  const { prisma } = await import('../config/prisma');
  await prisma.pomodoroSession.updateMany({
    where: { userId: SYSTEM_USER_ID },
    data: { deletedAt: new Date() },
  });
}

// ─── WS Helpers ─────────────────────────────────────────────────────────────

/** Connect and authenticate. Returns the authenticated WS. */
function authWs(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    ws.on('error', reject);
    ws.on('close', () => {}); // suppressUnhandledRejection

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'auth', token: AUTH_TOKEN }));
    });

    ws.on('message', function handler(data: Buffer) {
      const msg = JSON.parse(data.toString()) as { type: string };
      if (msg.type === 'AUTH_OK') {
        ws.removeListener('message', handler);
        resolve(ws);
      }
    });
  });
}

/** Wait for a message of a specific type, rejecting if the connection closes first. */
function nextMsg(ws: WebSocket, type: string, timeoutMs = 5000): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const tid = setTimeout(() => reject(new Error(`Timeout waiting for ${type} after ${timeoutMs}ms`)), timeoutMs);
    ws.on('close', () => { clearTimeout(tid); reject(new Error('Connection closed while waiting for ' + type)); });
    ws.on('error', (e) => { clearTimeout(tid); reject(e); });
    ws.on('message', function handler(data: Buffer) {
      const msg = JSON.parse(data.toString()) as Record<string, unknown>;
      if (msg.type === type) {
        clearTimeout(tid);
        ws.removeListener('message', handler);
        ws.removeListener('close', reject as () => void);
        ws.removeListener('error', reject);
        resolve(msg);
      }
    });
  });
}

/** Wait for any single message */
function anyMsg(ws: WebSocket, timeoutMs = 5000): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const tid = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
    ws.on('close', () => { clearTimeout(tid); reject(new Error('Closed')) });
    ws.on('error', (e) => { clearTimeout(tid); reject(e) });
    ws.on('message', function handler(data: Buffer) {
      clearTimeout(tid);
      ws.removeListener('message', handler);
      resolve(JSON.parse(data.toString()) as Record<string, unknown>);
    });
  });
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('WebSocket session lifecycle', () => {
  let server: Server;
  let port: number;
  let wss: ReturnType<typeof createWsServer>;

  beforeAll(done => {
    server = createServer(app);
    wss = createWsServer(server);
    server.listen(0, () => {
      port = (server.address() as { port: number }).port;
      done();
    });
  });

  afterAll(done => {
    wss.close();
    server.close(done);
  });

  beforeEach(async () => {
    await cleanupSessions();
  });

  // ─── Auth ───────────────────────────────────────────────────────────────

  it('valid token → AUTH_OK', async () => {
    const ws = await authWs(port);
    ws.close();
  });

  it('invalid token → AUTH_FAILED + connection closed', async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    let closeFired = false;

    await new Promise<void>((resolve) => {
      ws.on('open', () => ws.send(JSON.stringify({ type: 'auth', token: 'wrong-token' })));
      ws.on('close', () => { closeFired = true; resolve(); });
      ws.on('error', () => {}); // suppress
    });

    expect(closeFired).toBe(true);
  });

  // ─── start ─────────────────────────────────────────────────────────────

  it('start POMODORO task → SESSION_STARTED', async () => {
    const taskId = await createTask();
    const ws = await authWs(port);
    ws.send(JSON.stringify({ type: 'start', taskId, plannedMinutes: 25 }));

    const msg = await nextMsg(ws, 'SESSION_STARTED');
    expect(msg.type).toBe('SESSION_STARTED');
    const payload = msg.payload as { session: Record<string, unknown> };
    expect(payload.session.status).toBe('RUNNING');
    expect(payload.session.taskId).toBe(taskId);

    ws.close();
  });

  it('start non-POMODORO task → ERROR', async () => {
    const taskId = await createTask('Office Task', 'OFFICE');
    const ws = await authWs(port);
    ws.send(JSON.stringify({ type: 'start', taskId }));

    const msg = await nextMsg(ws, 'ERROR');
    expect(msg.type).toBe('ERROR');
    expect((msg.message as string).toLowerCase()).toContain('pomodoro');

    ws.close();
  });

  it('start without taskId → ERROR', async () => {
    const ws = await authWs(port);
    ws.send(JSON.stringify({ type: 'start' }));

    const msg = await nextMsg(ws, 'ERROR');
    expect(msg.type).toBe('ERROR');
    expect(msg.message).toBe('taskId is required');

    ws.close();
  });

  it('start task not found → ERROR', async () => {
    const ws = await authWs(port);
    ws.send(JSON.stringify({ type: 'start', taskId: '00000000-0000-0000-0000-000000000099' }));

    const msg = await nextMsg(ws, 'ERROR');
    expect(msg.type).toBe('ERROR');
    expect(msg.message).toBe('Task not found');

    ws.close();
  });

  it('second start while session active → ERROR', async () => {
    const taskIdA = await createTask('Task A');
    const taskIdB = await createTask('Task B');
    const ws = await authWs(port);

    ws.send(JSON.stringify({ type: 'start', taskId: taskIdA }));
    await nextMsg(ws, 'SESSION_STARTED'); // consume

    ws.send(JSON.stringify({ type: 'start', taskId: taskIdB }));
    const msg = await nextMsg(ws, 'ERROR');
    expect(msg.type).toBe('ERROR');
    expect((msg.message as string).toLowerCase()).toContain('already active');

    ws.close();
  });

  // ─── close ─────────────────────────────────────────────────────────────

  it('close → SESSION_COMPLETED', async () => {
    const taskId = await createTask('Close Test');
    const ws = await authWs(port);

    ws.send(JSON.stringify({ type: 'start', taskId, plannedMinutes: 25 }));
    await nextMsg(ws, 'SESSION_STARTED');

    ws.send(JSON.stringify({ type: 'close' }));
    const msg = await nextMsg(ws, 'SESSION_COMPLETED');
    expect(msg.type).toBe('SESSION_COMPLETED');
    const payload = msg.payload as { session: Record<string, unknown> };
    expect(payload.session.status).toBe('COMPLETED');

    ws.close();
  });

  it('close without active session → ERROR', async () => {
    const ws = await authWs(port);
    ws.send(JSON.stringify({ type: 'close' }));

    const msg = await nextMsg(ws, 'ERROR');
    expect(msg.type).toBe('ERROR');
    expect(msg.message).toBe('No active session');

    ws.close();
  });

  // ─── disconnect auto-complete ─────────────────────────────────────────

  it('disconnect while session active → auto-completes session in DB', async () => {
    const taskId = await createTask('Auto-complete Test');
    const ws = await authWs(port);

    ws.send(JSON.stringify({ type: 'start', taskId, plannedMinutes: 25 }));
    const startMsg = await nextMsg(ws, 'SESSION_STARTED');
    const sessionId = (startMsg.payload as { session: { id: string } }).session.id;

    // Abrupt disconnect (simulates tab crash)
    ws.close();

    // Server processes close event asynchronously
    await new Promise(resolve => setTimeout(resolve, 300));

    const { prisma } = await import('../config/prisma');
    const session = await prisma.pomodoroSession.findFirst({ where: { id: sessionId } });

    expect(session).not.toBeNull();
    expect(session!.status).toBe('COMPLETED');
    expect(session!.actualMinutes).toBeGreaterThanOrEqual(0);
    expect(session!.endedAt).not.toBeNull();
  });

  // ─── heartbeat ───────────────────────────────────────────────────────

  it('connection stays open after auth (heartbeat scheduled)', async () => {
    const ws = await authWs(port);

    // Wait briefly — heartbeat interval is 30s so connection should stay open
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(ws.readyState).toBe(WebSocket.OPEN);

    ws.close();
  });

  // ─── multi-tab broadcast ────────────────────────────────────────────

  it('SESSION_STARTED broadcast to all connections of same user', async () => {
    const taskId = await createTask('Broadcast Test');
    const [ws1, ws2] = await Promise.all([authWs(port), authWs(port)]);

    ws1.send(JSON.stringify({ type: 'start', taskId }));

    const [msg1, msg2] = await Promise.all([
      nextMsg(ws1, 'SESSION_STARTED'),
      nextMsg(ws2, 'SESSION_STARTED'),
    ]);

    expect(msg1.type).toBe('SESSION_STARTED');
    expect(msg2.type).toBe('SESSION_STARTED');
    expect(msg1).toEqual(msg2); // identical broadcast

    ws1.close();
    ws2.close();
  });
});
