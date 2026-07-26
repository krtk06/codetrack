import request from 'supertest';
import nock from 'nock';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';
import { fetchLeetCodeStats, createSnapshot, upsertProblemStats, getStatsByUsername } from './leetcode.service.js';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com';

function buildGraphQLResponse(stats: {
  easy?: number;
  medium?: number;
  hard?: number;
  easySubmissions?: number;
  mediumSubmissions?: number;
  hardSubmissions?: number;
  rating?: number | null;
  globalRanking?: number | null;
}) {
  return {
    data: {
      matchedUser: {
        submitStatsGlobal: {
          acSubmissionNum: [
            { difficulty: 'Easy', count: stats.easy ?? 0, submissions: stats.easySubmissions ?? 0 },
            { difficulty: 'Medium', count: stats.medium ?? 0, submissions: stats.mediumSubmissions ?? 0 },
            { difficulty: 'Hard', count: stats.hard ?? 0, submissions: stats.hardSubmissions ?? 0 }
          ]
        }
      },
      userContestRanking: {
        rating: stats.rating ?? null,
        globalRanking: stats.globalRanking ?? null
      }
    }
  };
}

const sampleStats = {
  totalSolved: 370,
  easySolved: 120,
  mediumSolved: 200,
  hardSolved: 50,
  acceptanceRate: 0.7,
  contestRating: 1850,
  globalRanking: 12345
};

describe('LeetCode client', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    nock.cleanAll();
  });

  it('fetches and maps LeetCode stats', async () => {
    const scope = nock(LEETCODE_GRAPHQL_URL)
      .post('/graphql')
      .reply(200, buildGraphQLResponse({
        easy: 120,
        medium: 200,
        hard: 50,
        easySubmissions: 150,
        mediumSubmissions: 300,
        hardSubmissions: 80,
        rating: 1850,
        globalRanking: 12345
      }));

    const stats = await fetchLeetCodeStats('alice_lc');

    expect(stats.totalSolved).toBe(370);
    expect(stats.easySolved).toBe(120);
    expect(stats.mediumSolved).toBe(200);
    expect(stats.hardSolved).toBe(50);
    expect(stats.contestRating).toBe(1850);
    expect(stats.globalRanking).toBe(12345);
    expect(scope.isDone()).toBe(true);
  });

  it('retries on rate limit and then succeeds', async () => {
    const scope = nock(LEETCODE_GRAPHQL_URL)
      .post('/graphql')
      .reply(429, 'Too Many Requests')
      .post('/graphql')
      .reply(200, buildGraphQLResponse({ easy: 10, medium: 20, hard: 5 }));

    const stats = await fetchLeetCodeStats('bob_lc');

    expect(stats.totalSolved).toBe(35);
    expect(scope.isDone()).toBe(true);
  });

  it('throws when LeetCode returns GraphQL errors', async () => {
    nock(LEETCODE_GRAPHQL_URL)
      .post('/graphql')
      .reply(200, { errors: [{ message: 'User not found' }] });

    await expect(fetchLeetCodeStats('unknown')).rejects.toThrow('User not found');
  });
});

describe('LeetCode service', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    nock.cleanAll();
  });

  it('creates a daily snapshot from stats', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'snapshot@example.com',
        password: 'hash',
        name: 'Snapshot User'
      }
    });

    const snapshot = await createSnapshot(user.id, sampleStats);

    expect(snapshot.userId).toBe(user.id);
    expect(snapshot.totalSolved).toBe(370);
    expect(snapshot.acceptanceRate).toBe(0.7);
  });

  it('upserts problem stats for a user', async () => {
    const user = await prisma.user.create({
      data: { email: 'upsert@example.com', password: 'hash', name: 'Upsert User', leetcodeUsername: 'upsert_lc' }
    });

    await upsertProblemStats(user.id, sampleStats);
    const first = await getStatsByUsername('upsert_lc');
    expect(first).toMatchObject({ totalSolved: 370, isStale: false });

    await upsertProblemStats(user.id, { ...sampleStats, totalSolved: 400 });
    const second = await getStatsByUsername('upsert_lc');
    expect(second?.totalSolved).toBe(400);
  });
});

describe('LeetCode API', () => {
  const credentials = { email: 'stats@example.com', password: 'secret123', name: 'Stats User' };
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const register = await request(app).post('/api/auth/register').send(credentials);
    accessToken = register.body.accessToken;
    userId = register.body.user.id;
  });

  it('GET /api/leetcode/:username/stats returns problem stats with stale flag', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { leetcodeUsername: 'stats_lc' }
    });
    await upsertProblemStats(userId, sampleStats);

    const res = await request(app)
      .get('/api/leetcode/stats_lc/stats')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.totalSolved).toBe(370);
    expect(res.body.stats.isStale).toBe(false);
    expect(res.body.stats.lastUpdated).toBeDefined();
  });

  it('GET /api/leetcode/:username/stats returns 404 when stats are missing', async () => {
    const res = await request(app)
      .get('/api/leetcode/missing_lc/stats')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/leetcode/:username/sync fetches and stores stats', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { leetcodeUsername: 'sync_lc' }
    });

    nock(LEETCODE_GRAPHQL_URL)
      .post('/graphql')
      .reply(200, buildGraphQLResponse({ easy: 5, medium: 10, hard: 2 }));

    const res = await request(app)
      .post('/api/leetcode/sync_lc/sync')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.totalSolved).toBe(17);

    const stored = await getStatsByUsername('sync_lc');
    expect(stored?.totalSolved).toBe(17);
  });
});
