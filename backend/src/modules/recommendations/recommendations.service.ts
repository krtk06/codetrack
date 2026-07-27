import { prisma } from '../../config/database.js';
import type {
  DailyPlanItem,
  LearningPathPhase,
  RecommendationsResponse
} from './recommendations.types.js';

const WEAK_THRESHOLD = 50;
const DAILY_PLAN_BASE = 3;

function planCountForRank(rank: number): number {
  return DAILY_PLAN_BASE + rank;
}

export async function generateRecommendations(userId: string): Promise<RecommendationsResponse> {
  const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' } });
  const performances = await prisma.topicPerformance.findMany({
    where: { userId, topicId: { in: topics.map((t) => t.id) } },
    select: { topicId: true, successRate: true }
  });

  const performanceByTopic = new Map<string, number>();
  for (const perf of performances) {
    performanceByTopic.set(perf.topicId, perf.successRate);
  }

  const hasAnyPerformance = performances.length > 0;

  const topicPerformance = topics
    .map((topic) => {
      const rate = performanceByTopic.get(topic.id);
      return {
        topic,
        successRate: rate ?? null,
        hasData: rate !== undefined
      };
    })
    .sort((a, b) => {
      const aRate = a.successRate ?? 100;
      const bRate = b.successRate ?? 100;
      return aRate - bRate;
    });

  const weakEntries = topicPerformance
    .filter((entry) => entry.hasData && (entry.successRate ?? 0) < WEAK_THRESHOLD)
    .map((entry) => entry.topic.name);

  const strongEntries = topicPerformance
    .filter((entry) => entry.hasData && (entry.successRate ?? 0) >= WEAK_THRESHOLD)
    .map((entry) => entry.topic.name);

  const unknownEntries = topicPerformance
    .filter((entry) => !entry.hasData)
    .map((entry) => entry.topic.name);

  const dailyPlan: DailyPlanItem[] = topicPerformance
    .filter((entry) => entry.hasData && (entry.successRate ?? 0) < WEAK_THRESHOLD)
    .map((entry, index) => ({
      topic: entry.topic.name,
      count: planCountForRank(index)
    }));

  const learningPath: LearningPathPhase[] = [];
  if (weakEntries.length > 0) {
    learningPath.push({ phase: 'Focus', topics: weakEntries });
  }
  if (strongEntries.length > 0) {
    learningPath.push({ phase: 'Reinforce', topics: strongEntries });
  }
  if (!hasAnyPerformance) {
    learningPath.push({ phase: 'Explore', topics: topics.map((t) => t.name) });
  } else if (unknownEntries.length > 0) {
    learningPath.push({ phase: 'Explore', topics: unknownEntries });
  }

  const response: RecommendationsResponse = {
    weakTopics: weakEntries,
    dailyPlan,
    learningPath,
    generatedAt: new Date().toISOString()
  };

  await prisma.recommendation.upsert({
    where: { userId },
    update: { payload: response as any },
    create: { userId, payload: response as any }
  });

  return response;
}
