import request from 'supertest';
import { app } from '../../main';

const AUTH = { Authorization: `Bearer changeme` };
const SESSIONS_BASE = '/api/sessions';
const TASKS_BASE = '/api/tasks';

describe('sessions API', () => {
  // Helper: create a task via REST
  async function createTask(title = 'Session Test Task', taskType = 'POMODORO') {
    const res = await request(app)
      .post(TASKS_BASE)
      .set(AUTH)
      .send({ title, taskType, date: '2026-04-01' });
    return res.body.data;
  }

  // ─── GET /api/sessions ──────────────────────────────────

  it('GET /api/sessions — returns 200 with sessions array', async () => {
    const res = await request(app)
      .get(`${SESSIONS_BASE}?from=2026-04-01&to=2026-04-01`)
      .set(AUTH)
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/sessions?taskId= — returns sessions for a task', async () => {
    const task = await createTask();
    const res = await request(app)
      .get(`${SESSIONS_BASE}?taskId=${task.id}`)
      .set(AUTH)
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/sessions — returns 401 without auth', async () => {
    await request(app).get(SESSIONS_BASE).expect(401);
  });

  // ─── DELETE /api/sessions/:id ───────────────────────────

  it('DELETE /api/sessions/:id — returns 401 without auth', async () => {
    await request(app)
      .delete(`${SESSIONS_BASE}/00000000-0000-0000-0000-000000000001`)
      .expect(401);
  });

  it('DELETE /api/sessions/:id — returns 404 for non-existent id', async () => {
    await request(app)
      .delete(`${SESSIONS_BASE}/00000000-0000-0000-0000-000000000099`)
      .set(AUTH)
      .expect(404);
  });

  // ─── Session lifecycle via WebSocket (tested in ws/ws.test.ts) ────────────
  // Note: start/complete/reset are now WS-only (no REST endpoints)
  // See server/src/ws/ws.test.ts for the full lifecycle tests
});
