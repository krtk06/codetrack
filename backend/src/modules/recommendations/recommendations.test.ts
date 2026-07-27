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

describe('Recommendations API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/recommendations', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/recommendations');
      expect(res.status).toBe(401);
    });

    it('returns a default recommendation payload for a new user', async () => {
      const accessToken = await loginUser('theo@example.com', 'Theo');
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.weakTopics).toEqual([]);
      expect(res.body.dailyPlan).toEqual([]);
      expect(res.body.learningPath[0].phase).toBe('Explore');
    });

    it('flags weak topics and builds a daily plan', async () => {
      const user = await createUser({
        email: 'uma@example.com',
        password: 'securePass123',
        name: 'Uma'
      });

      const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' } });
      const targetNames = ['Arrays', 'Trees'];
      const weakEntries = topics.filter((t) => targetNames.includes(t.name));

      for (const topic of weakEntries) {
        await prisma.topicPerformance.create({
          data: {
            userId: user.id,
            topicId: topic.id,
            solved: 10,
            attempted: 30,
            successRate: 33
          }
        });
      }

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'uma@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.weakTopics).toEqual(expect.arrayContaining(targetNames));
      expect(res.body.dailyPlan.length).toBe(2);
      expect(res.body.dailyPlan[0].count).toBeGreaterThanOrEqual(3);
      expect(res.body.learningPath[0].phase).toBe('Focus');

      const stored = await prisma.recommendation.findUnique({ where: { userId: user.id } });
      expect(stored).not.toBeNull();
    });

    it('builds a Reinforce phase when no weak topics exist', async () => {
      const user = await createUser({
        email: 'victor@example.com',
        password: 'securePass123',
        name: 'Victor'
      });

      const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' }, take: 2 });
      for (const topic of topics) {
        await prisma.topicPerformance.create({
          data: {
            userId: user.id,
            topicId: topic.id,
            solved: 20,
            attempted: 25,
            successRate: 80
          }
        });
      }

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'victor@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.weakTopics).toEqual([]);
      expect(res.body.dailyPlan).toEqual([]);
      expect(res.body.learningPath[0].phase).toBe('Reinforce');
    });
  });
});
