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

describe('Companies API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/companies/companies', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/companies/companies');
      expect(res.status).toBe(401);
    });

    it('returns the list of supported companies', async () => {
      const accessToken = await loginUser('eve2@example.com', 'Eve');
      const res = await request(app)
        .get('/api/companies/companies')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.companies).toEqual(
        expect.arrayContaining(['Google', 'Amazon', 'Microsoft', 'Meta', 'Adobe', 'Atlassian'])
      );
    });
  });

  describe('GET /api/companies/prep', () => {
    it('rejects missing company query', async () => {
      const accessToken = await loginUser('frank2@example.com', 'Frank');
      const res = await request(app)
        .get('/api/companies/prep')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(400);
    });

    it('returns 404 for an unknown company', async () => {
      const accessToken = await loginUser('grace2@example.com', 'Grace');
      const res = await request(app)
        .get('/api/companies/prep?company=UnknownCo')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(404);
    });

    it('returns prep data for a known company', async () => {
      const accessToken = await loginUser('henry2@example.com', 'Henry');
      const res = await request(app)
        .get('/api/companies/prep?company=Google')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.company).toBe('Google');
      expect(res.body.frequentTopics).toEqual(
        expect.arrayContaining(['Graphs', 'Trees', 'Dynamic Programming'])
      );
      expect(res.body.roadmap.length).toBeGreaterThan(0);
      expect(res.body.weakTopicFocus).toEqual([]);
    });

    it('highlights user weak topics that match company frequent topics', async () => {
      const user = await createUser({
        email: 'ivy2@example.com',
        password: 'securePass123',
        name: 'Ivy'
      });

      const google = ['Graphs', 'Trees'];
      const topics = await prisma.topic.findMany({ where: { name: { in: google } } });
      for (const topic of topics) {
        await prisma.topicPerformance.create({
          data: {
            userId: user.id,
            topicId: topic.id,
            solved: 5,
            attempted: 20,
            successRate: 25
          }
        });
      }

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'ivy2@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .get('/api/companies/prep?company=Google')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.weakTopicFocus).toEqual(expect.arrayContaining(google));
    });
  });
});
