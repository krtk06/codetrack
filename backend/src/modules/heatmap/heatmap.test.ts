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

function makeDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day, 12, 0, 0, 0);
  return date;
}

describe('Heatmap API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/heatmap', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/heatmap?year=2026');
      expect(res.status).toBe(401);
    });

    it('rejects an invalid year', async () => {
      const accessToken = await loginUser('ivy@example.com', 'Ivy');
      const res = await request(app)
        .get('/api/heatmap?year=abc')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(400);
    });

    it('returns zero activity for a year with no snapshots', async () => {
      const accessToken = await loginUser('jay@example.com', 'Jay');
      const res = await request(app)
        .get('/api/heatmap?year=2026')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.days).toHaveLength(365);
      expect(res.body.summary.activeDays).toBe(0);
      expect(res.body.summary.consistency).toBe(0);
      expect(res.body.summary.longestStreak).toBe(0);
    });

    it('computes daily activity and levels from snapshots', async () => {
      const user = await createUser({
        email: 'kim@example.com',
        password: 'securePass123',
        name: 'Kim'
      });

      // 3 consecutive days with increasing totalSolved
      await prisma.dailySnapshot.create({
        data: {
          userId: user.id,
          totalSolved: 100,
          easySolved: 30,
          mediumSolved: 50,
          hardSolved: 20,
          acceptanceRate: 0.5,
          snapshotDate: makeDate(2026, 0, 1)
        }
      });
      await prisma.dailySnapshot.create({
        data: {
          userId: user.id,
          totalSolved: 103,
          easySolved: 30,
          mediumSolved: 50,
          hardSolved: 23,
          acceptanceRate: 0.5,
          snapshotDate: makeDate(2026, 0, 2)
        }
      });
      await prisma.dailySnapshot.create({
        data: {
          userId: user.id,
          totalSolved: 110,
          easySolved: 35,
          mediumSolved: 50,
          hardSolved: 25,
          acceptanceRate: 0.5,
          snapshotDate: makeDate(2026, 0, 3)
        }
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'kim@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/heatmap?year=2026')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.days).toHaveLength(365);

      const jan1 = res.body.days.find((d: { date: string }) => d.date === '2026-01-01');
      const jan2 = res.body.days.find((d: { date: string }) => d.date === '2026-01-02');
      const jan3 = res.body.days.find((d: { date: string }) => d.date === '2026-01-03');
      expect(jan1.count).toBe(100);
      expect(jan1.level).toBe(4);
      expect(jan2.count).toBe(3);
      expect(jan2.level).toBe(2);
      expect(jan3.count).toBe(7);
      expect(jan3.level).toBe(4);

      expect(res.body.summary.activeDays).toBe(3);
      expect(res.body.summary.longestStreak).toBe(3);
    });
  });
});
