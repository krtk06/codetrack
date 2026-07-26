import { prisma } from '../config/database.js';
import { runSnapshotJob } from './snapshot.job.js';
import * as leetcodeService from '../modules/leetcode/leetcode.service.js';

const syncSpy = jest.spyOn(leetcodeService, 'syncLeetCodeForUser').mockImplementation(async () => ({
  stats: {
    totalSolved: 1,
    easySolved: 1,
    mediumSolved: 0,
    hardSolved: 0,
    acceptanceRate: 1,
    contestRating: null,
    globalRanking: null
  },
  snapshot: {
    id: 'snap-1',
    userId: 'u1',
    totalSolved: 1,
    easySolved: 1,
    mediumSolved: 0,
    hardSolved: 0,
    acceptanceRate: 1,
    contestRating: null,
    globalRanking: null,
    snapshotDate: new Date(),
    createdAt: new Date()
  }
}));

describe('snapshot job', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    syncSpy.mockClear();
  });

  afterAll(() => {
    syncSpy.mockRestore();
  });

  it('syncs users with a leetcodeUsername and skips users without one', async () => {
    const withLc = await prisma.user.create({
      data: { email: 'a@example.com', password: 'hash', name: 'A', leetcodeUsername: 'a_lc' }
    });
    await prisma.user.create({
      data: { email: 'b@example.com', password: 'hash', name: 'B' }
    });

    await runSnapshotJob();

    expect(syncSpy).toHaveBeenCalledTimes(1);
    expect(syncSpy).toHaveBeenCalledWith(withLc.id, 'a_lc');
  });

  it('continues when one sync fails', async () => {
    const first = await prisma.user.create({
      data: { email: 'c@example.com', password: 'hash', name: 'C', leetcodeUsername: 'c_lc' }
    });
    const second = await prisma.user.create({
      data: { email: 'd@example.com', password: 'hash', name: 'D', leetcodeUsername: 'd_lc' }
    });

    syncSpy.mockImplementation(async (userId: string) => {
      if (userId === first.id) {
        throw new Error('boom');
      }
      return {
        stats: {
          totalSolved: 1,
          easySolved: 1,
          mediumSolved: 0,
          hardSolved: 0,
          acceptanceRate: 1,
          contestRating: null,
          globalRanking: null
        },
        snapshot: {
          id: 'snap-2',
          userId,
          totalSolved: 1,
          easySolved: 1,
          mediumSolved: 0,
          hardSolved: 0,
          acceptanceRate: 1,
          contestRating: null,
          globalRanking: null,
          snapshotDate: new Date(),
          createdAt: new Date()
        }
      };
    });

    await runSnapshotJob();

    expect(syncSpy).toHaveBeenCalledWith(first.id, 'c_lc');
    expect(syncSpy).toHaveBeenCalledWith(second.id, 'd_lc');
  });
});
