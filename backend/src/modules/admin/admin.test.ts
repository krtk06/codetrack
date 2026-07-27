import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';

async function createAdmin(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  const userId = res.body.user.id as string;
  await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
  const login = await request(app).post('/api/auth/login').send({
    email,
    password: 'securePass123'
  });
  return login.body.accessToken as string;
}

async function loginUser(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

describe('Admin API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/admin/users', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });

    it('rejects non-admin users', async () => {
      const accessToken = await loginUser('tyler@example.com', 'Tyler');
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(403);
    });

    it('returns users for admin', async () => {
      const accessToken = await createAdmin('uma2@example.com', 'Uma');
      await loginUser('victor2@example.com', 'Victor');

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('returns platform stats for admin', async () => {
      const accessToken = await createAdmin('wendy2@example.com', 'Wendy');

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalUsers: expect.any(Number),
        activeUsers: expect.any(Number),
        snapshotsToday: expect.any(Number)
      });
    });
  });

  describe('GET /api/admin/recommendations', () => {
    it('returns an empty list when no recommendations exist', async () => {
      const accessToken = await createAdmin('xavier@example.com', 'Xavier');
      const res = await request(app)
        .get('/api/admin/recommendations')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recommendations).toEqual([]);
    });
  });

  describe('GET /api/admin/usage', () => {
    it('returns usage counters for admin', async () => {
      const accessToken = await createAdmin('yara@example.com', 'Yara');
      const res = await request(app)
        .get('/api/admin/usage')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        apiCalls: expect.any(Number),
        errors: expect.any(Number)
      });
    });
  });
});
