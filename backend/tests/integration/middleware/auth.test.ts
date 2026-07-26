import request from 'supertest';
import express from 'express';
import { requireAuth, requireRole } from '../../../src/middleware/auth.js';
import { signAccessToken } from '../../../src/common/jwt.js';
import { errorHandler } from '../../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());

app.get('/protected', requireAuth, (_req, res) => {
  res.json({ ok: true });
});

app.get('/admin-only', requireAuth, requireRole('ADMIN'), (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

describe('auth middleware', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows requests with a valid token', async () => {
    const token = signAccessToken({ userId: 'u1', email: 'a@b.com', role: 'USER' });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects non-admin users from admin routes', async () => {
    const token = signAccessToken({ userId: 'u1', email: 'a@b.com', role: 'USER' });
    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows admin users', async () => {
    const token = signAccessToken({ userId: 'u1', email: 'a@b.com', role: 'ADMIN' });
    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
