import request from 'supertest';
import nock from 'nock';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';
import { createUser } from '../users/users.service.js';

const CODEFORCES_BASE = 'https://codeforces.com/api';

async function loginUser(email: string, name: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'securePass123',
    name
  });
  return res.body.accessToken as string;
}

describe('Contests API', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect((host) => host.includes('localhost') || host.includes('127.0.0.1'));
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
    nock.cleanAll();
  });

  describe('GET /api/contests', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/contests');
      expect(res.status).toBe(401);
    });

    it('returns an empty list for a new user', async () => {
      const accessToken = await loginUser('liam@example.com', 'Liam');
      const res = await request(app)
        .get('/api/contests')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.contests).toEqual([]);
    });
  });

  describe('POST /api/contests', () => {
    it('creates a manual contest record', async () => {
      const accessToken = await loginUser('mia@example.com', 'Mia');
      const res = await request(app)
        .post('/api/contests')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          platform: 'LEETCODE',
          contestName: 'Weekly Contest 350',
          date: '2026-04-05T15:00:00.000Z',
          rank: 1500,
          solved: 3,
          ratingBefore: 1500,
          ratingAfter: 1520
        });

      expect(res.status).toBe(201);
      expect(res.body.contest).toMatchObject({
        platform: 'LEETCODE',
        contestName: 'Weekly Contest 350',
        rank: 1500,
        solved: 3
      });
    });

    it('rejects invalid payload', async () => {
      const accessToken = await loginUser('nia@example.com', 'Nia');
      const res = await request(app)
        .post('/api/contests')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ platform: 'INVALID', contestName: '', date: 'x', rank: -1 });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/contests/import/codeforces', () => {
    it('rejects missing handle', async () => {
      const accessToken = await loginUser('owen@example.com', 'Owen');
      const res = await request(app)
        .post('/api/contests/import/codeforces')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('imports contests from Codeforces rating history', async () => {
      const user = await createUser({
        email: 'paul@example.com',
        password: 'securePass123',
        name: 'Paul'
      });

      nock(CODEFORCES_BASE)
        .persist()
        .get('/user.rating')
        .query({ handle: 'tourist' })
        .reply(200, {
          status: 'OK',
          result: [
            {
              contestId: 1000,
              contestName: 'Codeforces Round 1000',
              handle: 'tourist',
              rank: 1,
              ratingUpdateTimeSeconds: 1700000000,
              oldRating: 3000,
              newRating: 3050
            },
            {
              contestId: 1001,
              contestName: 'Codeforces Round 1001',
              handle: 'tourist',
              rank: 5,
              ratingUpdateTimeSeconds: 1701000000,
              oldRating: 3050,
              newRating: 3080
            }
          ]
        });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'paul@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .post('/api/contests/import/codeforces')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ handle: 'tourist' });

      expect(res.status).toBe(200);
      expect(res.body.contests).toHaveLength(2);
      expect(res.body.contests[0]).toMatchObject({
        platform: 'CODEFORCES',
        externalContestId: '1000',
        contestName: 'Codeforces Round 1000',
        rank: 1,
        ratingBefore: 3000,
        ratingAfter: 3050,
        solved: 0
      });

      // Idempotent re-import should not duplicate
      const second = await request(app)
        .post('/api/contests/import/codeforces')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ handle: 'tourist' });
      expect(second.status).toBe(200);
      expect(second.body.contests).toHaveLength(2);

      const stored = await prisma.contest.findMany({ where: { userId: user.id } });
      expect(stored).toHaveLength(2);
    });

    it('returns 500 when the Codeforces API fails', async () => {
      await loginUser('quinn@example.com', 'Quinn');

      nock(CODEFORCES_BASE)
        .get('/user.rating')
        .query({ handle: 'unknown' })
        .reply(200, { status: 'FAILED', comment: 'handle not found' });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'quinn@example.com',
        password: 'securePass123'
      });
      const accessToken = loginRes.body.accessToken as string;

      const res = await request(app)
        .post('/api/contests/import/codeforces')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ handle: 'unknown' });

      expect(res.status).toBe(500);
    });
  });
});
