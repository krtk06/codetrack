import { prisma } from '../../config/database.js';
import type { GrowthPeriod, GrowthData, AnalyticsSummary } from './analytics.types.js';

export type { GrowthPeriod } from './analytics.types.js';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function getLastNSnapshotsBefore(
  snapshots: { totalSolved: number; snapshotDate: Date }[],
  date: Date
): number {
  const target = startOfDay(date).getTime();
  let last = 0;
  for (const snapshot of snapshots) {
    if (new Date(snapshot.snapshotDate).getTime() <= target + 24 * 60 * 60 * 1000 - 1) {
      last = snapshot.totalSolved;
    } else {
      break;
    }
  }
  return last;
}

function buildWeeklyGrowth(
  snapshots: { totalSolved: number; snapshotDate: Date }[]
): GrowthData {
  const labels: string[] = [];
  const data: number[] = [];
  const today = startOfDay(new Date());

  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    labels.push(formatDay(date));
    data.push(getLastNSnapshotsBefore(snapshots, date));
  }

  return { labels, data };
}

function buildMonthlyGrowth(
  snapshots: { totalSolved: number; snapshotDate: Date }[]
): GrowthData {
  const labels: string[] = [];
  const data: number[] = [];
  const today = startOfDay(new Date());

  for (let i = 29; i >= 0; i--) {
    const date = addDays(today, -i);
    labels.push(formatShortDate(date));
    data.push(getLastNSnapshotsBefore(snapshots, date));
  }

  return { labels, data };
}

function buildYearlyGrowth(
  snapshots: { totalSolved: number; snapshotDate: Date }[]
): GrowthData {
  const labels: string[] = [];
  const data: number[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const monthDate = addMonths(now, -i);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
    labels.push(formatMonth(monthDate));
    data.push(getLastNSnapshotsBefore(snapshots, endOfMonth));
  }

  return { labels, data };
}

function getSnapshotAtOrBefore(
  snapshots: { totalSolved: number; snapshotDate: Date }[],
  date: Date
): number | null {
  const target = startOfDay(date).getTime();
  let found: number | null = null;
  for (const snapshot of snapshots) {
    if (new Date(snapshot.snapshotDate).getTime() <= target + 24 * 60 * 60 * 1000 - 1) {
      found = snapshot.totalSolved;
    } else {
      break;
    }
  }
  return found;
}

function computeStreaks(
  dates: Date[]
): { current: number; longest: number } {
  if (dates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const uniqueDayTimestamps = [
    ...new Set(dates.map((date) => startOfDay(date).getTime()))
  ].sort((a, b) => a - b);

  let longest = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDayTimestamps.length; i++) {
    const diff = (uniqueDayTimestamps[i] - uniqueDayTimestamps[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentRun++;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = startOfDay(new Date()).getTime();
  const lastDay = uniqueDayTimestamps[uniqueDayTimestamps.length - 1];
  const current = (today - lastDay) / (1000 * 60 * 60 * 24) <= 1 ? currentRun : 0;

  return { current, longest };
}

function computeSummary(snapshots: { totalSolved: number; acceptanceRate: number; snapshotDate: Date }[]): AnalyticsSummary {
  if (snapshots.length === 0) {
    return {
      dailyGrowth: 0,
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      problemsPerDay: 0,
      successRate: 0,
      codingConsistency: 0,
      streakAnalysis: { current: 0, longest: 0 }
    };
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
  );
  const latest = sorted[sorted.length - 1];
  const latestTotal = latest.totalSolved;
  const today = startOfDay(new Date());

  const yesterday = getSnapshotAtOrBefore(sorted, addDays(today, -1)) ?? latestTotal;
  const lastWeek = getSnapshotAtOrBefore(sorted, addDays(today, -7)) ?? sorted[0].totalSolved;
  const lastMonth = getSnapshotAtOrBefore(sorted, addDays(today, -30)) ?? sorted[0].totalSolved;

  const firstDate = startOfDay(new Date(sorted[0].snapshotDate));
  const daysSinceFirst = Math.max(1, daysBetween(firstDate, today));
  const problemsPerDay = Math.round((latestTotal / daysSinceFirst) * 100) / 100;

  const averageSuccessRate =
    Math.round(
      (sorted.reduce((sum, s) => sum + s.acceptanceRate, 0) / sorted.length) * 100
    );

  const last30Days = new Set<number>();
  for (let i = 0; i < 30; i++) {
    const day = addDays(today, -i).getTime();
    if (sorted.some((s) => startOfDay(new Date(s.snapshotDate)).getTime() === day)) {
      last30Days.add(day);
    }
  }
  const codingConsistency = Math.round((last30Days.size / 30) * 100);

  const streakAnalysis = computeStreaks(sorted.map((s) => new Date(s.snapshotDate)));

  return {
    dailyGrowth: latestTotal - yesterday,
    weeklyGrowth: latestTotal - lastWeek,
    monthlyGrowth: latestTotal - lastMonth,
    problemsPerDay,
    successRate: averageSuccessRate,
    codingConsistency,
    streakAnalysis
  };
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / (1000 * 60 * 60 * 24));
}

export async function getGrowthData(
  userId: string,
  period: GrowthPeriod
): Promise<GrowthData> {
  const snapshots = await prisma.dailySnapshot.findMany({
    where: { userId },
    orderBy: { snapshotDate: 'asc' },
    select: { totalSolved: true, snapshotDate: true }
  });

  switch (period) {
    case 'weekly':
      return buildWeeklyGrowth(snapshots);
    case 'monthly':
      return buildMonthlyGrowth(snapshots);
    case 'yearly':
      return buildYearlyGrowth(snapshots);
    default:
      throw new Error(`Unsupported period: ${period}`);
  }
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const snapshots = await prisma.dailySnapshot.findMany({
    where: { userId },
    orderBy: { snapshotDate: 'asc' },
    select: { totalSolved: true, acceptanceRate: true, snapshotDate: true }
  });

  return computeSummary(snapshots);
}
