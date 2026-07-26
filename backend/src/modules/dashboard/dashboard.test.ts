import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';
import { createUser } from '../users/users.service.js';

async function loginUser(name = 'Alice') {
  const res = await request(app).post('/api/auth/register').send({
    email: `${name.toLowerCase()}@example.com`,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

async function createUserDirectly(name: string) {
  return createUser({
    email: `${name.toLowerCase()}@example.com`,
    password: 'securePass123',
    name
  });
}

function makeDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(12, 0, 0, 0);
  return date;
}

describe('Dashboard API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/dashboard', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
    });

    it('returns default goal and zero stats for a new user', async () => {
      const accessToken = await loginUser('Bob');
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Bob',
        goal: 'Solve 500 Problems',
        progress: '0 / 500'
      });
      expect(res.body.stats).toMatchObject({
        totalProblemsSolved: 0,
        currentStreak: 0,
        longestStreak: 0,
        contestRating: null,
        monthlyGrowth: 0,
        applicationsSubmitted: 0
      });
    });

    it('aggregates problem stats, streaks, and growth', async () => {
      const user = await createUserDirectly('Carol');

      await prisma.problemStats.create({
        data: {
          userId: user.id,
          totalSolved: 120,
          easySolved: 40,
          mediumSolved: 60,
          hardSolved: 20,
          acceptanceRate: 0.55,
          contestRating: 1450,
          globalRanking: 5000
        }
      });

      await prisma.goal.create({
        data: {
          userId: user.id,
          title: 'Master 200 Problems',
          target: 200,
          current: 120
        }
      });

      // 10 consecutive days ending today
      for (let i = 0; i < 10; i++) {
        await prisma.dailySnapshot.create({
          data: {
            userId: user.id,
            totalSolved: 100 + i,
            easySolved: 30,
            mediumSolved: 50,
            hardSolved: 20,
            acceptanceRate: 0.5,
            snapshotDate: makeDate(i - 9)
          }
        });
      }

      // 5-day older streak
      for (let i = 0; i < 5; i++) {
        await prisma.dailySnapshot.create({
          data: {
            userId: user.id,
            totalSolved: 50 + i,
            easySolved: 20,
            mediumSolved: 25,
            hardSolved: 5,
            acceptanceRate: 0.5,
            snapshotDate: makeDate(i - 25)
          }
        });
      }

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'carol@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Carol',
        goal: 'Master 200 Problems',
        progress: '120 / 200'
      });
      expect(res.body.stats.totalProblemsSolved).toBe(120);
      expect(res.body.stats.contestRating).toBe(1450);
      expect(res.body.stats.currentStreak).toBe(10);
      expect(res.body.stats.longestStreak).toBe(10);
      expect(res.body.stats.monthlyGrowth).toBeGreaterThan(0);
    });
  });
});
