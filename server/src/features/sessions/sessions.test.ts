import request from 'supertest';
import { app } from '../../main';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';
const AUTH = { Authorization: `Bearer changeme` };
const SESSIONS_BASE = '/api/sessions';
const TASKS_BASE = '/api/tasks';

describe('sessions API', () => {
  // Helper: create a POMODORO task
  async function createPomodoroTask(title = 'Pomodoro Task') {
    const res = await request(app)
      .post(TASKS_BASE)
      .set(AUTH)
      .send({ title, taskType: 'POMODORO', date: '2026-04-01' });
    return res.body.data;
  }

  // ─── Session lifecycle through task API ───────────────────

  it('POST /api/tasks/:id/start — creates RUNNING session (POMODORO only)', async () => {
    const task = await createPomodoroTask();

    const res = await request(app)
      .post(`${TASKS_BASE}/${task.id}/start`)
      .set(AUTH)
      .send({ plannedMinutes: 25 })
      .expect(201);

    expect(res.body.data.session).toMatchObject({
      taskId: task.id,
      taskType: 'POMODORO',
      status: 'RUNNING',
      plannedMinutes: 25,
    });
  });

  it('POST /api/tasks/:id/start — returns 400 for non-POMODORO task', async () => {
    const res = await request(app)
      .post(TASKS_BASE)
      .set(AUTH)
      .send({ title: 'Office Task', taskType: 'OFFICE', date: '2026-04-01' });

    await request(app)
      .post(`${TASKS_BASE}/${res.body.data.id}/start`)
      .set(AUTH)
      .send({ plannedMinutes: 25 })
      .expect(400);
  });

  it('POST /api/tasks/:id/pause — completes RUNNING session', async () => {
    const task = await createPomodoroTask('Pause Test');

    // Start session
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/start`)
      .set(AUTH)
      .send({ plannedMinutes: 25 });

    // Pause: completes with actualMinutes = elapsed
    const res = await request(app)
      .post(`${TASKS_BASE}/${task.id}/pause`)
      .set(AUTH)
      .send({ actualMinutes: 10 })
      .expect(200);

    expect(res.body.data.session).toMatchObject({
      taskId: task.id,
      status: 'COMPLETED',
      actualMinutes: 10,
    });
  });

  it('POST /api/tasks/:id/pause — returns 404 when no active session', async () => {
    const task = await createPomodoroTask('No Active Session');
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/pause`)
      .set(AUTH)
      .send({ actualMinutes: 5 })
      .expect(404);
  });

  it('POST /api/tasks/:id/resume — creates new RUNNING session', async () => {
    const task = await createPomodoroTask('Resume Test');

    // Start first session
    const startRes = await request(app)
      .post(`${TASKS_BASE}/${task.id}/start`)
      .set(AUTH)
      .send({ plannedMinutes: 25 });

    const firstId = startRes.body.data.session.id;

    // Pause first session
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/pause`)
      .set(AUTH)
      .send({ actualMinutes: 12 });

    // Resume creates a new session
    const resumeRes = await request(app)
      .post(`${TASKS_BASE}/${task.id}/resume`)
      .set(AUTH)
      .send({ plannedMinutes: 25 })
      .expect(201);

    expect(resumeRes.body.data.session).toMatchObject({
      taskId: task.id,
      taskType: 'POMODORO',
      status: 'RUNNING',
    });
    expect(resumeRes.body.data.session.id).not.toBe(firstId);
  });

  it('POST /api/tasks/:id/resume — returns 400 for non-POMODORO task', async () => {
    const res = await request(app)
      .post(TASKS_BASE)
      .set(AUTH)
      .send({ title: 'Focus Task', taskType: 'FOCUS', date: '2026-04-01' });

    await request(app)
      .post(`${TASKS_BASE}/${res.body.data.id}/resume`)
      .set(AUTH)
      .send({ plannedMinutes: 50 })
      .expect(400);
  });

  // ─── GET /api/sessions ──────────────────────────────────

  it('GET /api/sessions — returns 200 with sessions', async () => {
    const res = await request(app)
      .get(`${SESSIONS_BASE}?from=2026-04-01&to=2026-04-01`)
      .set(AUTH)
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/sessions?taskId= — returns sessions for a task', async () => {
    const task = await createPomodoroTask('Sessions for Task');
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/start`)
      .set(AUTH)
      .send({ plannedMinutes: 25 });

    const res = await request(app)
      .get(`${SESSIONS_BASE}?taskId=${task.id}`)
      .set(AUTH)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((s: { taskId: string }) => s.taskId === task.id)).toBe(true);
  });

  // ─── 401s ────────────────────────────────────────────────

  it('GET /api/sessions — returns 401 without auth', async () => {
    await request(app).get(`${SESSIONS_BASE}`).expect(401);
  });

  it('POST /api/sessions — returns 401 without auth', async () => {
    await request(app).post(SESSIONS_BASE).send({ taskId: 'x', taskType: 'POMODORO' }).expect(401);
  });

  it('PUT /api/sessions/:id/reset — returns 401 without auth', async () => {
    await request(app)
      .put(`${SESSIONS_BASE}/00000000-0000-0000-0000-000000000001/reset`)
      .send({ actualMinutes: 10 })
      .expect(401);
  });

  it('PUT /api/sessions/:id/complete — returns 401 without auth', async () => {
    await request(app)
      .put(`${SESSIONS_BASE}/00000000-0000-0000-0000-000000000001/complete`)
      .send({ plannedMinutes: 25 })
      .expect(401);
  });

  it('DELETE /api/sessions/:id — returns 401 without auth', async () => {
    await request(app).delete(`${SESSIONS_BASE}/00000000-0000-0000-0000-000000000001`).expect(401);
  });

  it('POST /api/tasks/:id/start — returns 401 without auth', async () => {
    const task = await createPomodoroTask();
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/start`)
      .send({ plannedMinutes: 25 })
      .expect(401);
  });

  it('POST /api/tasks/:id/pause — returns 401 without auth', async () => {
    const task = await createPomodoroTask();
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/pause`)
      .send({ actualMinutes: 5 })
      .expect(401);
  });

  it('POST /api/tasks/:id/resume — returns 401 without auth', async () => {
    const task = await createPomodoroTask();
    await request(app)
      .post(`${TASKS_BASE}/${task.id}/resume`)
      .send({ plannedMinutes: 25 })
      .expect(401);
  });

  // ─── Soft-delete session ─────────────────────────────────

  it('DELETE /api/sessions/:id — returns 204', async () => {
    const task = await createPomodoroTask('Delete Session');
    const startRes = await request(app)
      .post(`${TASKS_BASE}/${task.id}/start`)
      .set(AUTH)
      .send({ plannedMinutes: 25 });

    const sessionId = startRes.body.data.session.id;

    await request(app).delete(`${SESSIONS_BASE}/${sessionId}`).set(AUTH).expect(204);
  });
});
