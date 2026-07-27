import request from 'supertest';
import { app } from '../../app.js';

async function loginUser(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

describe('Mock Interviews API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/mock-interviews', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/mock-interviews');
      expect(res.status).toBe(401);
    });

    it('returns an empty list for a new user', async () => {
      const accessToken = await loginUser('gina@example.com', 'Gina');
      const res = await request(app)
        .get('/api/mock-interviews')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.mockInterviews).toEqual([]);
    });
  });

  describe('POST /api/mock-interviews', () => {
    it('creates a mock interview', async () => {
      const accessToken = await loginUser('hank@example.com', 'Hank');
      const res = await request(app)
        .post('/api/mock-interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: isoDate(-1),
          interviewer: 'Alice',
          topic: 'DSA',
          score: 7,
          scoreOutOf: 10,
          feedback: 'Need graph practice'
        });

      expect(res.status).toBe(201);
      expect(res.body.mockInterview).toMatchObject({
        interviewer: 'Alice',
        topic: 'DSA',
        score: 7,
        scoreOutOf: 10,
        feedback: 'Need graph practice'
      });
    });

    it('rejects invalid payload', async () => {
      const accessToken = await loginUser('irene@example.com', 'Irene');
      const res = await request(app)
        .post('/api/mock-interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ topic: '', score: -1, interviewer: '', date: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/mock-interviews/performance', () => {
    it('returns aggregated performance metrics', async () => {
      const accessToken = await loginUser('jack@example.com', 'Jack');
      const entries = [
        { topic: 'DSA', score: 8, scoreOutOf: 10, date: isoDate(-3), interviewer: 'A' },
        { topic: 'DSA', score: 6, scoreOutOf: 10, date: isoDate(-2), interviewer: 'B' },
        { topic: 'System Design', score: 9, scoreOutOf: 10, date: isoDate(-1), interviewer: 'C' }
      ];

      for (const e of entries) {
        await request(app)
          .post('/api/mock-interviews')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(e);
      }

      const res = await request(app)
        .get('/api/mock-interviews/performance')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalInterviews).toBe(3);
      expect(res.body.averageScore).toBeCloseTo(76.7, 1);
      expect(res.body.topicBreakdown).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ topic: 'DSA', count: 2, averageScore: 70 }),
          expect.objectContaining({ topic: 'System Design', count: 1, averageScore: 90 })
        ])
      );
      expect(res.body.scoreTrend).toHaveLength(3);
    });
  });

  describe('PATCH /api/mock-interviews/:id', () => {
    it('updates feedback', async () => {
      const accessToken = await loginUser('kate@example.com', 'Kate');
      const create = await request(app)
        .post('/api/mock-interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: isoDate(0),
          interviewer: 'Alice',
          topic: 'DSA',
          score: 5
        });
      const id = create.body.mockInterview.id as string;

      const res = await request(app)
        .patch(`/api/mock-interviews/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ feedback: 'Improved' });

      expect(res.status).toBe(200);
      expect(res.body.mockInterview.feedback).toBe('Improved');
    });
  });

  describe('DELETE /api/mock-interviews/:id', () => {
    it('deletes a mock interview', async () => {
      const accessToken = await loginUser('liam2@example.com', 'Liam');
      const create = await request(app)
        .post('/api/mock-interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: isoDate(0),
          interviewer: 'Alice',
          topic: 'DSA',
          score: 5
        });
      const id = create.body.mockInterview.id as string;

      const res = await request(app)
        .delete(`/api/mock-interviews/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    });
  });
});
