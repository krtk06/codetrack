import { prisma } from '../../config/database.js';
import { notFound } from '../../common/errors.js';

const DEFAULT_GOAL_TITLE = 'Solve 500 Problems';
const DEFAULT_GOAL_TARGET = 500;

export interface DashboardData {
  user: {
    name: string;
    goal: string;
    progress: string;
  };
  stats: {
    totalProblemsSolved: number;
    currentStreak: number;
    longestStreak: number;
    contestRating: number | null;
    monthlyGrowth: number;
    applicationsSubmitted: number;
  };
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / (1000 * 60 * 60 * 24));
}

function computeStreaks(dates: Date[]): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDayTimestamps = [
    ...new Set(dates.map((date) => startOfDay(date).getTime()))
  ].sort((a, b) => a - b);

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDayTimestamps.length; i++) {
    const diff = (uniqueDayTimestamps[i] - uniqueDayTimestamps[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = startOfDay(new Date()).getTime();
  const lastDay = uniqueDayTimestamps[uniqueDayTimestamps.length - 1];
  const currentStreak = daysBetween(new Date(lastDay), new Date(today)) <= 1 ? currentRun : 0;

  return { currentStreak, longestStreak };
}

function computeMonthlyGrowth(snapshots: { totalSolved: number; snapshotDate: Date }[]): number {
  if (snapshots.length === 0) {
    return 0;
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
  );

  const current = sorted[sorted.length - 1].totalSolved;
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const previous = sorted
    .filter((s) => new Date(s.snapshotDate).getTime() <= oneMonthAgo.getTime())
    .pop();

  if (!previous) {
    return current;
  }

  return current - previous.totalSolved;
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw notFound('User not found');
  }

  const [problemStats, goal, snapshots] = await Promise.all([
    prisma.problemStats.findUnique({ where: { userId } }),
    prisma.goal.findUnique({ where: { userId } }),
    prisma.dailySnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
      take: 90,
      select: { totalSolved: true, snapshotDate: true }
    })
  ]);

  const totalSolved = problemStats?.totalSolved ?? 0;
  const goalTitle = goal?.title ?? DEFAULT_GOAL_TITLE;
  const goalTarget = goal?.target ?? DEFAULT_GOAL_TARGET;
  const goalCurrent = goal?.current ?? totalSolved;

  const { currentStreak, longestStreak } = computeStreaks(
    snapshots.map((s) => new Date(s.snapshotDate))
  );

  const monthlyGrowth = computeMonthlyGrowth(snapshots);

  return {
    user: {
      name: user.name,
      goal: goalTitle,
      progress: `${goalCurrent} / ${goalTarget}`
    },
    stats: {
      totalProblemsSolved: totalSolved,
      currentStreak,
      longestStreak,
      contestRating: problemStats?.contestRating ?? null,
      monthlyGrowth,
      applicationsSubmitted: 0 // stub until Applications feature is implemented
    }
  };
}
