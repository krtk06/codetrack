import { prisma } from '../../config/database.js';
import { notFound } from '../../common/errors.js';
import type {
  CreateMockInterviewInput,
  MockInterviewPerformance,
  MockInterviewResponse,
  UpdateMockInterviewInput
} from './mockInterviews.types.js';

function toMockInterviewResponse(item: {
  id: string;
  date: Date;
  interviewer: string;
  topic: string;
  score: number;
  scoreOutOf: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MockInterviewResponse {
  return {
    id: item.id,
    date: item.date.toISOString(),
    interviewer: item.interviewer,
    topic: item.topic,
    score: item.score,
    scoreOutOf: item.scoreOutOf,
    feedback: item.feedback,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

export async function createMockInterview(
  userId: string,
  input: CreateMockInterviewInput
): Promise<MockInterviewResponse> {
  const mock = await prisma.mockInterview.create({
    data: {
      userId,
      date: new Date(input.date),
      interviewer: input.interviewer,
      topic: input.topic,
      score: input.score,
      scoreOutOf: input.scoreOutOf ?? 10,
      feedback: input.feedback ?? null
    }
  });

  return toMockInterviewResponse(mock);
}

export async function getMockInterviews(userId: string): Promise<MockInterviewResponse[]> {
  const items = await prisma.mockInterview.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });
  return items.map(toMockInterviewResponse);
}

export async function updateMockInterview(
  userId: string,
  id: string,
  input: UpdateMockInterviewInput
): Promise<MockInterviewResponse> {
  const existing = await prisma.mockInterview.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Mock interview not found');
  }

  const updated = await prisma.mockInterview.update({
    where: { id },
    data: {
      date: input.date ? new Date(input.date) : undefined,
      interviewer: input.interviewer,
      topic: input.topic,
      score: input.score,
      scoreOutOf: input.scoreOutOf,
      feedback: input.feedback ?? undefined
    }
  });

  return toMockInterviewResponse(updated);
}

export async function deleteMockInterview(userId: string, id: string): Promise<void> {
  const existing = await prisma.mockInterview.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Mock interview not found');
  }
  await prisma.mockInterview.delete({ where: { id } });
}

export async function getMockInterviewPerformance(
  userId: string
): Promise<MockInterviewPerformance> {
  const items = await prisma.mockInterview.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });

  if (items.length === 0) {
    return {
      averageScore: 0,
      totalInterviews: 0,
      topicBreakdown: [],
      scoreTrend: []
    };
  }

  const totalPercentage = items.reduce(
    (sum, item) => sum + (item.scoreOutOf > 0 ? (item.score / item.scoreOutOf) * 100 : 0),
    0
  );
  const averageScore = Math.round((totalPercentage / items.length) * 10) / 10;

  const topicMap = new Map<string, { total: number; count: number }>();
  for (const item of items) {
    const percentage = item.scoreOutOf > 0 ? (item.score / item.scoreOutOf) * 100 : 0;
    const entry = topicMap.get(item.topic) ?? { total: 0, count: 0 };
    entry.total += percentage;
    entry.count += 1;
    topicMap.set(item.topic, entry);
  }

  const topicBreakdown = Array.from(topicMap.entries()).map(([topic, { total, count }]) => ({
    topic,
    averageScore: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
    count
  }));

  const scoreTrend = items.map((item) => ({
    date: item.date.toISOString().slice(0, 10),
    percentage: item.scoreOutOf > 0 ? Math.round((item.score / item.scoreOutOf) * 1000) / 10 : 0
  }));

  return {
    averageScore,
    totalInterviews: items.length,
    topicBreakdown,
    scoreTrend
  };
}
