import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';
import { createUser } from '../users/users.service.js';

async function loginUser(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

describe('Topics API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/topics', () => {
    it('returns all 14 seeded topics', async () => {
      const res = await request(app).get('/api/topics');
      expect(res.status).toBe(200);
      expect(res.body.topics).toHaveLength(14);
      const names = res.body.topics.map((t: { name: string }) => t.name);
      expect(names).toContain('Arrays');
      expect(names).toContain('Dynamic Programming');
      expect(names).toContain('Trie');
    });
  });

  describe('GET /api/topics/performance', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/topics/performance');
      expect(res.status).toBe(401);
    });

    it('returns zero performance for a user with no ProblemStats', async () => {
      const accessToken = await loginUser('grace@example.com', 'Grace');
      const res = await request(app)
        .get('/api/topics/performance')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.performance).toHaveLength(14);
      expect(res.body.performance.every((p: { solved: number }) => p.solved === 0)).toBe(true);
    });

    it('distributes solved count across topics using the weight map', async () => {
      const user = await createUser({
        email: 'henry@example.com',
        password: 'securePass123',
        name: 'Henry'
      });

      await prisma.problemStats.create({
        data: {
          userId: user.id,
          totalSolved: 100,
          easySolved: 30,
          mediumSolved: 50,
          hardSolved: 20,
          acceptanceRate: 0.6
        }
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'henry@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/topics/performance')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      const totalDistributed = res.body.performance.reduce(
        (sum: number, p: { solved: number }) => sum + p.solved,
        0
      );
      expect(totalDistributed).toBe(100);

      const arrays = res.body.performance.find((p: { name: string }) => p.name === 'Arrays');
      expect(arrays.solved).toBe(17);
      expect(arrays.successRate).toBe(60);
    });
  });
});
