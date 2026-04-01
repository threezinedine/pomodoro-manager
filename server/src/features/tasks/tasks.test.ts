import request from 'supertest';
import { app } from '../../main';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';
const AUTH = { Authorization: `Bearer changeme` };
const BASE = '/api/tasks';

describe('tasks API', () => {
  // ─── GET /api/tasks?date= ────────────────────────────────────────────

  it('GET /api/tasks?date=YYYY-MM-DD — returns 200 with tasks', async () => {
    const res = await request(app)
      .get(`${BASE}?date=2026-03-31`)
      .set(AUTH)
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/tasks — returns 400 without date param', async () => {
    await request(app).get(BASE).set(AUTH).expect(400);
  });

  it('GET /api/tasks — returns 401 without auth', async () => {
    await request(app).get(`${BASE}?date=2026-03-31`).expect(401);
  });

  it('POST /api/tasks — returns 401 without auth', async () => {
    await request(app).post(BASE).send({ title: 'X', taskType: 'POMODORO', date: '2026-03-31' }).expect(401);
  });

  it('GET /api/tasks/:id — returns 401 without auth', async () => {
    await request(app).get(`${BASE}/00000000-0000-0000-0000-000000000001`).expect(401);
  });

  it('PUT /api/tasks/:id — returns 401 without auth', async () => {
    await request(app).put(`${BASE}/00000000-0000-0000-0000-000000000001`).send({ title: 'X' }).expect(401);
  });

  it('DELETE /api/tasks/:id — returns 401 without auth', async () => {
    await request(app).delete(`${BASE}/00000000-0000-0000-0000-000000000001`).expect(401);
  });

  it('POST /api/tasks/:id/cancel — returns 401 without auth', async () => {
    await request(app).post(`${BASE}/00000000-0000-0000-0000-000000000001/cancel`).expect(401);
  });

  it('POST /api/tasks/:id/tags — returns 401 without auth', async () => {
    await request(app).post(`${BASE}/00000000-0000-0000-0000-000000000001/tags`).send({ tagIds: [] }).expect(401);
  });

  it('DELETE /api/tasks/:id/tags/:tagId — returns 401 without auth', async () => {
    await request(app).delete(`${BASE}/00000000-0000-0000-0000-000000000001/tags/00000000-0000-0000-0000-000000000002`).expect(401);
  });

  // ─── POST /api/tasks ──────────────────────────────────────────────

  it('POST /api/tasks — returns 201 with created task', async () => {
    const res = await request(app)
      .post(BASE)
      .set(AUTH)
      .send({ title: 'Test Task', taskType: 'POMODORO', date: '2026-03-31' })
      .expect(201);

    expect(res.body.data).toMatchObject({
      title: 'Test Task',
      taskType: 'POMODORO',
      taskStatus: 'PENDING',
    });
  });

  it('POST /api/tasks — returns 400 without required fields', async () => {
    await request(app).post(BASE).set(AUTH).send({}).expect(400);
  });

  it('POST /api/tasks — creates task with tags', async () => {
    // First create a tag
    const tagRes = await request(app)
      .post('/api/tags')
      .set(AUTH)
      .send({ name: 'urgent', color: '#ff0000' });

    const tagId = tagRes.body.data.id;

    const res = await request(app)
      .post(BASE)
      .set(AUTH)
      .send({ title: 'Task with Tag', taskType: 'FOCUS', date: '2026-04-01', tagIds: [tagId] })
      .expect(201);

    expect(res.body.data.tags).toEqual(
      expect.arrayContaining([expect.objectContaining({ tag: expect.objectContaining({ id: tagId }) })])
    );
  });

  // ─── GET /api/tasks/:id ────────────────────────────────────────

  it('GET /api/tasks/:id — returns 200 with task', async () => {
    // Create a task first
    const createRes = await request(app)
      .post(BASE)
      .set(AUTH)
      .send({ title: 'Find Me', taskType: 'OTHER', date: '2026-03-31' });

    const id = createRes.body.data.id;

    const res = await request(app).get(`${BASE}/${id}`).set(AUTH).expect(200);
    expect(res.body.data).toMatchObject({ id, title: 'Find Me' });
  });

  it('GET /api/tasks/:id — returns 404 for non-existent id', async () => {
    await request(app)
      .get(`${BASE}/00000000-0000-0000-0000-000000000099`)
      .set(AUTH)
      .expect(404);
  });

  // ─── PUT /api/tasks/:id ────────────────────────────────────────

  it('PUT /api/tasks/:id — returns 200 with updated task', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set(AUTH)
      .send({ title: 'Original', taskType: 'POMODORO', date: '2026-03-31' });

    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`${BASE}/${id}`)
      .set(AUTH)
      .send({ title: 'Updated', taskStatus: 'COMPLETED' })
      .expect(200);

    expect(res.body.data).toMatchObject({ title: 'Updated', taskStatus: 'COMPLETED' });
  });

  // ─── POST /api/tasks/:id/cancel ────────────────────────────────

  it('POST /api/tasks/:id/cancel — sets taskStatus to CANCELLED', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set(AUTH)
      .send({ title: 'Cancel Me', taskType: 'OFFICE', date: '2026-03-31' });

    const id = createRes.body.data.id;

    const res = await request(app)
      .post(`${BASE}/${id}/cancel`)
      .set(AUTH)
      .expect(200);

    expect(res.body.data.taskStatus).toBe('CANCELLED');
  });

  // ─── DELETE /api/tasks/:id ────────────────────────────────────

  it('DELETE /api/tasks/:id — returns 204 and task is no longer listed', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set(AUTH)
      .send({ title: 'Delete Me', taskType: 'OTHER', date: '2026-03-31' });

    const id = createRes.body.data.id;

    await request(app).delete(`${BASE}/${id}`).set(AUTH).expect(204);

    // Task should no longer appear in list
    const listRes = await request(app)
      .get(`${BASE}?date=2026-03-31`)
      .set(AUTH)
      .expect(200);

    expect(listRes.body.data.some((t: { id: string }) => t.id === id)).toBe(false);
  });

  // ─── POST /api/tasks/:id/tags ────────────────────────────────

  it('POST /api/tasks/:id/tags — adds tag to task', async () => {
    // Create task and tag
    const [taskRes, tagRes] = await Promise.all([
      request(app).post(BASE).set(AUTH).send({ title: 'Tag Task', taskType: 'POMODORO', date: '2026-04-02' }),
      request(app).post('/api/tags').set(AUTH).send({ name: 'work', color: '#00ff00' }),
    ]);

    const taskId = taskRes.body.data.id;
    const tagId = tagRes.body.data.id;

    const res = await request(app)
      .post(`${BASE}/${taskId}/tags`)
      .set(AUTH)
      .send({ tagIds: [tagId] })
      .expect(200);

    expect(res.body.data.tags).toEqual(
      expect.arrayContaining([expect.objectContaining({ tag: expect.objectContaining({ id: tagId }) })])
    );
  });

  // ─── DELETE /api/tasks/:id/tags/:tagId ─────────────────────

  it('DELETE /api/tasks/:id/tags/:tagId — removes tag from task', async () => {
    // Create task + tag
    const [taskRes, tagRes] = await Promise.all([
      request(app).post(BASE).set(AUTH).send({ title: 'Remove Tag Task', taskType: 'FOCUS', date: '2026-04-03' }),
      request(app).post('/api/tags').set(AUTH).send({ name: 'temp', color: '#0000ff' }),
    ]);

    const taskId = taskRes.body.data.id;
    const tagId = tagRes.body.data.id;

    // Add tag
    await request(app).post(`${BASE}/${taskId}/tags`).set(AUTH).send({ tagIds: [tagId] });

    // Remove tag
    const res = await request(app)
      .delete(`${BASE}/${taskId}/tags/${tagId}`)
      .set(AUTH)
      .expect(200);

    const tagIds = res.body.data.tags.map((t: { tag: { id: string } }) => t.tag.id);
    expect(tagIds).not.toContain(tagId);
  });
});
