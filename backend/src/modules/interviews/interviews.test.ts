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

const futureDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

describe('Interviews API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/interviews', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/interviews');
      expect(res.status).toBe(401);
    });

    it('returns an empty list for a new user', async () => {
      const accessToken = await loginUser('yara@example.com', 'Yara');
      const res = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.interviews).toEqual([]);
    });
  });

  describe('POST /api/interviews', () => {
    it('creates an interview', async () => {
      const accessToken = await loginUser('zane@example.com', 'Zane');
      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'Acme',
          round: 'Technical',
          date: futureDate(2),
          time: '14:00',
          location: 'Remote',
          meetingLink: 'https://meet.example.com/abc'
        });

      expect(res.status).toBe(201);
      expect(res.body.interview).toMatchObject({
        company: 'Acme',
        round: 'Technical',
        time: '14:00',
        location: 'Remote',
        status: 'SCHEDULED'
      });
    });

    it('rejects invalid payload', async () => {
      const accessToken = await loginUser('abby@example.com', 'Abby');
      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: '', round: '', date: '', time: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/interviews/upcoming', () => {
    it('returns only scheduled interviews in the future', async () => {
      const accessToken = await loginUser('beth@example.com', 'Beth');
      const create = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'Acme',
          round: 'Tech',
          date: futureDate(1),
          time: '10:00'
        });
      const id = create.body.interview.id as string;

      await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'Old',
          round: 'Past',
          date: futureDate(-5),
          time: '10:00'
        });

      await request(app)
        .patch(`/api/interviews/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'COMPLETED' });

      const res = await request(app)
        .get('/api/interviews/upcoming')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.interviews).toHaveLength(0);
    });

    it('includes future scheduled interviews', async () => {
      const accessToken = await loginUser('cara@example.com', 'Cara');
      await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'FutureCo',
          round: 'Onsite',
          date: futureDate(3),
          time: '09:30'
        });

      const res = await request(app)
        .get('/api/interviews/upcoming')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.interviews).toHaveLength(1);
      expect(res.body.interviews[0].company).toBe('FutureCo');
    });
  });

  describe('PATCH /api/interviews/:id', () => {
    it('updates an interview', async () => {
      const accessToken = await loginUser('dora@example.com', 'Dora');
      const create = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'Acme',
          round: 'Tech',
          date: futureDate(1),
          time: '10:00'
        });
      const id = create.body.interview.id as string;

      const res = await request(app)
        .patch(`/api/interviews/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ round: 'System Design' });

      expect(res.status).toBe(200);
      expect(res.body.interview.round).toBe('System Design');
    });

    it('returns 404 for non-existent interview', async () => {
      const accessToken = await loginUser('ella@example.com', 'Ella');
      const res = await request(app)
        .patch('/api/interviews/non-existent')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ round: 'X' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/interviews/:id', () => {
    it('deletes an interview', async () => {
      const accessToken = await loginUser('finn@example.com', 'Finn');
      const create = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'Acme',
          round: 'Tech',
          date: futureDate(1),
          time: '10:00'
        });
      const id = create.body.interview.id as string;

      const res = await request(app)
        .delete(`/api/interviews/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      const list = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(list.body.interviews).toEqual([]);
    });
  });
});
