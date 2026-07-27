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
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

describe('Applications API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/applications', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/applications');
      expect(res.status).toBe(401);
    });

    it('returns an empty list for a new user', async () => {
      const accessToken = await loginUser('mike@example.com', 'Mike');
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.applications).toEqual([]);
    });
  });

  describe('POST /api/applications', () => {
    it('creates an application', async () => {
      const accessToken = await loginUser('nina@example.com', 'Nina');
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          company: 'Acme',
          role: 'SWE',
          location: 'Remote',
          appliedDate: isoDate(-1),
          status: 'APPLIED'
        });

      expect(res.status).toBe(201);
      expect(res.body.application).toMatchObject({
        company: 'Acme',
        role: 'SWE',
        location: 'Remote',
        status: 'APPLIED'
      });
    });

    it('rejects invalid payload', async () => {
      const accessToken = await loginUser('olive@example.com', 'Olive');
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: '', role: '', appliedDate: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/applications?status=...', () => {
    it('filters applications by status', async () => {
      const accessToken = await loginUser('pete@example.com', 'Pete');
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: 'A', role: 'R', appliedDate: isoDate(-1), status: 'APPLIED' });
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: 'B', role: 'R', appliedDate: isoDate(0), status: 'INTERVIEW' });

      const res = await request(app)
        .get('/api/applications?status=INTERVIEW')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.applications).toHaveLength(1);
      expect(res.body.applications[0].company).toBe('B');
    });

    it('rejects invalid status filter', async () => {
      const accessToken = await loginUser('quinn2@example.com', 'Quinn');
      const res = await request(app)
        .get('/api/applications?status=NotAStatus')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/applications/:id', () => {
    it('updates application status', async () => {
      const accessToken = await loginUser('rachel2@example.com', 'Rachel');
      const create = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: 'Acme', role: 'SWE', appliedDate: isoDate(0) });
      const id = create.body.application.id as string;

      const res = await request(app)
        .patch(`/api/applications/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'INTERVIEW' });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe('INTERVIEW');
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('deletes an application', async () => {
      const accessToken = await loginUser('sam2@example.com', 'Sam');
      const create = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: 'Acme', role: 'SWE', appliedDate: isoDate(0) });
      const id = create.body.application.id as string;

      const res = await request(app)
        .delete(`/api/applications/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    });
  });
});
