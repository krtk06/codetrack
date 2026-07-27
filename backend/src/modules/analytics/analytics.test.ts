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

function makeDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(12, 0, 0, 0);
  return date;
}

describe('Analytics API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/analytics/growth', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/analytics/growth?period=weekly');
      expect(res.status).toBe(401);
    });

    it('returns zeros for a user with no snapshots', async () => {
      const accessToken = await loginUser('ana@example.com', 'Ana');
      const res = await request(app)
        .get('/api/analytics/growth?period=weekly')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.labels).toHaveLength(7);
      expect(res.body.data).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('returns weekly growth data with forward-filled snapshots', async () => {
      const user = await createUser({
        email: 'bob@example.com',
        password: 'securePass123',
        name: 'Bob'
      });

      // snapshots on today and 3 days ago
      await prisma.dailySnapshot.create({
        data: {
          userId: user.id,
          totalSolved: 250,
          easySolved: 80,
          mediumSolved: 120,
          hardSolved: 50,
          acceptanceRate: 0.5,
          snapshotDate: makeDate(-3)
        }
      });
      await prisma.dailySnapshot.create({
        data: {
          userId: user.id,
          totalSolved: 278,
          easySolved: 90,
          mediumSolved: 130,
          hardSolved: 58,
          acceptanceRate: 0.5,
          snapshotDate: makeDate(0)
        }
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'bob@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/analytics/growth?period=weekly')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.labels).toHaveLength(7);
      expect(res.body.data).toHaveLength(7);
      expect(res.body.data[0]).toBe(0); // 6 days ago
      expect(res.body.data[3]).toBe(250); // 3 days ago
      expect(res.body.data[6]).toBe(278); // today
    });

    it('rejects an invalid period', async () => {
      const accessToken = await loginUser('charlie@example.com', 'Charlie');
      const res = await request(app)
        .get('/api/analytics/growth?period=daily')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/analytics/summary', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/analytics/summary');
      expect(res.status).toBe(401);
    });

    it('returns zero metrics for a user with no snapshots', async () => {
      const accessToken = await loginUser('dave@example.com', 'Dave');
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        dailyGrowth: 0,
        weeklyGrowth: 0,
        monthlyGrowth: 0,
        problemsPerDay: 0,
        successRate: 0,
        codingConsistency: 0,
        streakAnalysis: { current: 0, longest: 0 }
      });
    });

    it('calculates summary metrics from snapshots', async () => {
      const user = await createUser({
        email: 'eve@example.com',
        password: 'securePass123',
        name: 'Eve'
      });

      // 5 consecutive daily snapshots ending today
      for (let i = 0; i < 5; i++) {
        await prisma.dailySnapshot.create({
          data: {
            userId: user.id,
            totalSolved: 100 + i * 5,
            easySolved: 30,
            mediumSolved: 50,
            hardSolved: 20,
            acceptanceRate: 0.6,
            snapshotDate: makeDate(i - 4)
          }
        });
      }

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'eve@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.dailyGrowth).toBe(5);
      expect(res.body.weeklyGrowth).toBe(20);
      expect(res.body.monthlyGrowth).toBe(20);
      expect(res.body.successRate).toBe(60);
      expect(res.body.codingConsistency).toBeGreaterThan(0);
      expect(res.body.streakAnalysis).toMatchObject({
        current: expect.any(Number),
        longest: expect.any(Number)
      });
    });

    it('handles a single snapshot', async () => {
      const user = await createUser({
        email: 'frank@example.com',
        password: 'securePass123',
        name: 'Frank'
      });

      await prisma.dailySnapshot.create({
        data: {
          userId: user.id,
          totalSolved: 42,
          easySolved: 10,
          mediumSolved: 25,
          hardSolved: 7,
          acceptanceRate: 0.75,
          snapshotDate: makeDate(0)
        }
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'frank@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.dailyGrowth).toBe(0);
      expect(res.body.weeklyGrowth).toBe(0);
      expect(res.body.monthlyGrowth).toBe(0);
      expect(res.body.successRate).toBe(75);
    });
  });
});
