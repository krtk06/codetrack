import request from 'supertest';
import { app } from '../../app.js';
import * as client from './aiCoach.client.js';

jest.mock('./aiCoach.client.js', () => ({
  callOpenAI: jest.fn(),
  isOpenAIConfigured: true
}));

async function loginUser(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

describe('AI Coach API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
    jest.clearAllMocks();
  });

  describe('POST /api/ai-coach/analyze', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).post('/api/ai-coach/analyze').send({ failureDescription: 'I failed my Amazon interview.' });
      expect(res.status).toBe(401);
    });

    it('rejects empty description', async () => {
      const accessToken = await loginUser('jack2@example.com', 'Jack');
      const res = await request(app)
        .post('/api/ai-coach/analyze')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ failureDescription: '' });
      expect(res.status).toBe(400);
    });

    it('returns parsed analysis from the AI client', async () => {
      (client.callOpenAI as jest.Mock).mockResolvedValue(JSON.stringify({
        weakAreas: ['Trees', 'System Design'],
        recommendedPlan: [
          { activity: 'Tree Problems', count: 10 },
          { activity: 'System Design Reading', count: 3 }
        ]
      }));

      const accessToken = await loginUser('kim2@example.com', 'Kim');
      const res = await request(app)
        .post('/api/ai-coach/analyze')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ failureDescription: 'I failed my Amazon interview due to weak tree problems and system design.' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        weakAreas: ['Trees', 'System Design'],
        recommendedPlan: [
          { activity: 'Tree Problems', count: 10 },
          { activity: 'System Design Reading', count: 3 }
        ]
      });
    });

    it('returns 500 when the AI client returns invalid JSON', async () => {
      (client.callOpenAI as jest.Mock).mockResolvedValue('not json');

      const accessToken = await loginUser('liam3@example.com', 'Liam');
      const res = await request(app)
        .post('/api/ai-coach/analyze')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ failureDescription: 'I failed my Google interview badly.' });

      expect(res.status).toBe(500);
    });

    it('returns 500 when the AI client response fails schema validation', async () => {
      (client.callOpenAI as jest.Mock).mockResolvedValue(JSON.stringify({
        weakAreas: [],
        recommendedPlan: []
      }));

      const accessToken = await loginUser('mia2@example.com', 'Mia');
      const res = await request(app)
        .post('/api/ai-coach/analyze')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ failureDescription: 'I failed my Meta interview.' });

      expect(res.status).toBe(500);
    });
  });
});
