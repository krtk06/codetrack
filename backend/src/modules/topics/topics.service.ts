import { prisma } from '../../config/database.js';
import type { TopicResponse, TopicPerformanceResponse } from './topics.types.js';

const TOPIC_WEIGHTS: Record<string, number> = {
  Arrays: 0.17,
  Strings: 0.11,
  'Linked Lists': 0.10,
  Stacks: 0.05,
  Queues: 0.05,
  Trees: 0.11,
  Graphs: 0.07,
  'Dynamic Programming': 0.10,
  Greedy: 0.05,
  Backtracking: 0.05,
  'Sliding Window': 0.05,
  'Binary Search': 0.03,
  Heap: 0.04,
  Trie: 0.02
};

export async function getTopics(): Promise<TopicResponse[]> {
  const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' } });
  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    order: topic.order
  }));
}

export async function refreshTopicPerformance(userId: string): Promise<void> {
  const topics = await prisma.topic.findMany({ orderBy: { order: 'asc' } });
  const problemStats = await prisma.problemStats.findUnique({ where: { userId } });

  const totalSolved = problemStats?.totalSolved ?? 0;
  const successRatePercent = problemStats?.acceptanceRate
    ? Math.round(problemStats.acceptanceRate * 100)
    : 0;

  let distributed = 0;
  const updates = topics.map((topic, index) => {
    const weight = TOPIC_WEIGHTS[topic.name] ?? 0;
    let solved: number;
    if (index === topics.length - 1) {
      solved = Math.max(0, totalSolved - distributed);
    } else {
      solved = Math.floor(totalSolved * weight);
    }
    distributed += solved;

    const attempted =
      successRatePercent > 0
        ? Math.max(solved, Math.round(solved / (successRatePercent / 100)))
        : solved;

    return prisma.topicPerformance.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      update: { solved, attempted, successRate: successRatePercent },
      create: {
        userId,
        topicId: topic.id,
        solved,
        attempted,
        successRate: successRatePercent
      }
    });
  });

  await prisma.$transaction(updates);
}

export async function getTopicPerformance(
  userId: string
): Promise<TopicPerformanceResponse[]> {
  await refreshTopicPerformance(userId);

  const performances = await prisma.topicPerformance.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { topic: { order: 'asc' } }
  });

  return performances.map((performance) => ({
    topicId: performance.topicId,
    name: performance.topic.name,
    solved: performance.solved,
    attempted: performance.attempted,
    successRate: performance.successRate
  }));
}
