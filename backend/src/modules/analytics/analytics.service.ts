import { prisma } from '../../config/database.js';

export type GrowthPeriod = 'weekly' | 'monthly' | 'yearly';

export interface GrowthData {
  labels: string[];
  data: number[];
}

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
