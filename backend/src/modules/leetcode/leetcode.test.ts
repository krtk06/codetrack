import nock from 'nock';
import { prisma } from '../../config/database.js';
import { fetchLeetCodeStats, createSnapshot } from './leetcode.service.js';

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

describe('LeetCode client', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.dailySnapshot.deleteMany();
    await prisma.user.deleteMany();
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

  it('creates a daily snapshot from stats', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'snapshot@example.com',
        password: 'hash',
        name: 'Snapshot User'
      }
    });

    const snapshot = await createSnapshot(user.id, {
      totalSolved: 100,
      easySolved: 30,
      mediumSolved: 50,
      hardSolved: 20,
      acceptanceRate: 0.45,
      contestRating: 1500,
      globalRanking: 50000
    });

    expect(snapshot.userId).toBe(user.id);
    expect(snapshot.totalSolved).toBe(100);
    expect(snapshot.acceptanceRate).toBe(0.45);
  });
});
