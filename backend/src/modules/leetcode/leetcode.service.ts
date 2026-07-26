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

export async function upsertProblemStats(userId: string, stats: LeetCodeStats) {
  return prisma.problemStats.upsert({
    where: { userId },
    create: {
      userId,
      totalSolved: stats.totalSolved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      acceptanceRate: stats.acceptanceRate,
      contestRating: stats.contestRating,
      globalRanking: stats.globalRanking
    },
    update: {
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

export async function getStatsByUsername(username: string) {
  const user = await prisma.user.findFirst({
    where: { leetcodeUsername: username },
    include: { problemStats: true }
  });

  if (!user || !user.problemStats) {
    return null;
  }

  const stats = user.problemStats;
  const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();
  const lastUpdated = stats.lastUpdated.getTime();
  const isStale = now - lastUpdated > STALE_THRESHOLD_MS;

  return {
    totalSolved: stats.totalSolved,
    easySolved: stats.easySolved,
    mediumSolved: stats.mediumSolved,
    hardSolved: stats.hardSolved,
    acceptanceRate: stats.acceptanceRate,
    contestRating: stats.contestRating,
    globalRanking: stats.globalRanking,
    lastUpdated: stats.lastUpdated,
    isStale
  };
}

export async function syncLeetCodeForUser(userId: string, username: string) {
  const stats = await fetchLeetCodeStats(username);
  const snapshot = await createSnapshot(userId, stats);
  await upsertProblemStats(userId, stats);
  return { stats, snapshot };
}

export { fetchLeetCodeStats };
