import { prisma } from '../../config/database.js';
import type {
  AdminRecommendation,
  AdminStats,
  AdminUsage,
  AdminUser
} from './admin.types.js';

export async function getAllUsers(): Promise<AdminUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  }));
}

export async function getStats(): Promise<AdminStats> {
  const [totalUsers, activeUsers, startOfToday] = await Promise.all([
    prisma.user.count(),
    prisma.dailySnapshot.groupBy({
      by: ['userId'],
      where: {
        snapshotDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    }).then((rows) => rows.length),
    new Date(new Date().setHours(0, 0, 0, 0))
  ]);

  const snapshotsToday = await prisma.dailySnapshot.count({
    where: { snapshotDate: { gte: startOfToday } }
  });

  return {
    totalUsers,
    activeUsers,
    snapshotsToday
  };
}

export async function getAllRecommendations(): Promise<AdminRecommendation[]> {
  const records = await prisma.recommendation.findMany({
    include: { user: { select: { email: true } } }
  });

  return records.map((record) => {
    const payload = record.payload as {
      weakTopics?: string[];
      dailyPlan?: { topic: string }[];
      generatedAt?: string;
    };
    return {
      userId: record.userId,
      userEmail: record.user?.email ?? '',
      weakTopics: payload.weakTopics ?? [],
      dailyPlanCount: payload.dailyPlan?.length ?? 0,
      generatedAt: payload.generatedAt ?? record.updatedAt.toISOString()
    };
  });
}

export function getUsage(): AdminUsage {
  return {
    apiCalls: 0,
    errors: 0
  };
}
