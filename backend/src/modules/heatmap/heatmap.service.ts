import { prisma } from '../../config/database.js';

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapSummary {
  consistency: number;
  activeDays: number;
  missedDays: number;
  longestStreak: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function levelForCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export async function getHeatmap(userId: string, year: number): Promise<HeatmapDay[]> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  const snapshots = await prisma.dailySnapshot.findMany({
    where: {
      userId,
      snapshotDate: { gte: start, lte: end }
    },
    orderBy: { snapshotDate: 'asc' },
    select: { totalSolved: true, snapshotDate: true }
  });

  const countsByDate = new Map<string, number>();
  let previousTotal = 0;

  // Determine base total from latest snapshot before the year (if any)
  const priorSnapshot = await prisma.dailySnapshot.findFirst({
    where: { userId, snapshotDate: { lt: start } },
    orderBy: { snapshotDate: 'desc' },
    select: { totalSolved: true }
  });
  if (priorSnapshot) {
    previousTotal = priorSnapshot.totalSolved;
  }

  for (const snapshot of snapshots) {
    const dateKey = toIsoDate(new Date(snapshot.snapshotDate));
    const delta = Math.max(0, snapshot.totalSolved - previousTotal);
    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + delta);
    previousTotal = snapshot.totalSolved;
  }

  const days: HeatmapDay[] = [];
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = toIsoDate(date);
      const count = countsByDate.get(key) ?? 0;
      days.push({
        date: key,
        count,
        level: levelForCount(count)
      });
    }
  }

  return days;
}

export function summarizeHeatmap(days: HeatmapDay[]): HeatmapSummary {
  const totalDays = days.length;
  const activeDays = days.filter((d) => d.count > 0).length;
  const missedDays = totalDays - activeDays;
  const consistency = totalDays === 0 ? 0 : Math.round((activeDays / totalDays) * 100);

  let longestStreak = 0;
  let currentRun = 0;
  for (const day of days) {
    if (day.count > 0) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 0;
    }
  }

  return { consistency, activeDays, missedDays, longestStreak };
}
