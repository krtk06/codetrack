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

describe('Notifications API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('GET /api/notifications/preferences', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/notifications/preferences');
      expect(res.status).toBe(401);
    });

    it('returns default preferences for a new user', async () => {
      const accessToken = await loginUser('nina2@example.com', 'Nina');
      const res = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        dailyReminders: true,
        goalCompletionAlerts: true,
        interviewNotifications: true,
        contestNotifications: true
      });
    });
  });

  describe('PATCH /api/notifications/preferences', () => {
    it('updates preferences', async () => {
      const accessToken = await loginUser('oscar@example.com', 'Oscar');
      const res = await request(app)
        .patch('/api/notifications/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyReminders: false, contestNotifications: false });

      expect(res.status).toBe(200);
      expect(res.body.dailyReminders).toBe(false);
      expect(res.body.contestNotifications).toBe(false);
      expect(res.body.goalCompletionAlerts).toBe(true);
      expect(res.body.interviewNotifications).toBe(true);
    });

    it('rejects invalid payload', async () => {
      const accessToken = await loginUser('pearl@example.com', 'Pearl');
      const res = await request(app)
        .patch('/api/notifications/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyReminders: 'yes', extra: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/notifications/jobs', () => {
    it('returns scheduled job cron expressions', async () => {
      const accessToken = await loginUser('quinn3@example.com', 'Quinn');
      const res = await request(app)
        .get('/api/notifications/jobs')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        dailyReminderJob: expect.any(String),
        goalCompletionJob: expect.any(String),
        interviewReminderJob: expect.any(String),
        contestAlertJob: expect.any(String)
      });
    });
  });
});
