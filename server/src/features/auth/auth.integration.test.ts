import request from 'supertest';
import { app } from '../../main';

const AUTH_TOKEN = 'changeme';

describe('auth integration', () => {
  it('POST /api/auth/token — returns 200 with valid token', async () => {
    const res = await request(app)
      .post('/api/auth/token')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .expect(200);

    expect(res.body.data).toMatchObject({
      valid: true,
      userId: expect.stringMatching(/^00000000-/),
    });
  });

  it('POST /api/auth/token — returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/auth/token')
      .expect(401);

    expect(res.body).toMatchObject({
      error: 'UnauthorizedError',
      message: 'Invalid token',
    });
  });

  it('POST /api/auth/token — returns 401 with wrong token', async () => {
    const res = await request(app)
      .post('/api/auth/token')
      .set('Authorization', 'Bearer wrong-token')
      .expect(401);

    expect(res.body).toMatchObject({
      error: 'UnauthorizedError',
      message: 'Invalid token',
    });
  });

  it('POST /api/auth/token — returns 401 with empty Bearer header', async () => {
    const res = await request(app)
      .post('/api/auth/token')
      .set('Authorization', 'Bearer ')
      .expect(401);

    expect(res.body.error).toBe('UnauthorizedError');
  });

  it('GET /health — returns 200 without auth', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
