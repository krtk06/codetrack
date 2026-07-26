import { prisma } from '../../config/database.js';
import { fetchLeetCodeStats } from './leetcode.client.js';
import type { LeetCodeStats } from './leetcode.types.js';

export async function createSnapshot(userId: string, stats: LeetCodeStats) {
  return prisma.dailySnapshot.create({
    data: {
      userId,
      totalSolved: stats.totalSolved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      acceptanceRate: stats.acceptanceRate,
      contestRating: stats.contestRating,
      globalRanking: stats.globalRanking
    }
  });
}

export async function syncLeetCodeForUser(userId: string, username: string) {
  const stats = await fetchLeetCodeStats(username);
  const snapshot = await createSnapshot(userId, stats);
  return { stats, snapshot };
}

export { fetchLeetCodeStats };
