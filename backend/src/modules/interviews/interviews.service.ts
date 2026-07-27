import { prisma } from '../../config/database.js';
import { notFound } from '../../common/errors.js';
import type {
  CreateInterviewInput,
  InterviewResponse,
  InterviewStatus,
  UpdateInterviewInput
} from './interviews.types.js';

function toInterviewResponse(interview: {
  id: string;
  company: string;
  round: string;
  date: Date;
  time: string;
  location: string | null;
  meetingLink: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): InterviewResponse {
  return {
    id: interview.id,
    company: interview.company,
    round: interview.round,
    date: interview.date.toISOString(),
    time: interview.time,
    location: interview.location,
    meetingLink: interview.meetingLink,
    status: interview.status as InterviewStatus,
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString()
  };
}

export async function createInterview(
  userId: string,
  input: CreateInterviewInput
): Promise<InterviewResponse> {
  const interview = await prisma.interview.create({
    data: {
      userId,
      company: input.company,
      round: input.round,
      date: new Date(input.date),
      time: input.time,
      location: input.location ?? null,
      meetingLink: input.meetingLink ?? null,
      status: input.status ?? 'SCHEDULED'
    }
  });

  return toInterviewResponse(interview);
}

export async function getInterviews(userId: string): Promise<InterviewResponse[]> {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: [{ date: 'asc' }, { time: 'asc' }]
  });
  return interviews.map(toInterviewResponse);
}

export async function getUpcomingInterviews(userId: string): Promise<InterviewResponse[]> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      status: { in: ['SCHEDULED'] },
      date: { gte: startOfToday }
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    take: 5
  });
  return interviews.map(toInterviewResponse);
}

export async function updateInterview(
  userId: string,
  id: string,
  input: UpdateInterviewInput
): Promise<InterviewResponse> {
  const existing = await prisma.interview.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Interview not found');
  }

  const interview = await prisma.interview.update({
    where: { id },
    data: {
      company: input.company,
      round: input.round,
      date: input.date ? new Date(input.date) : undefined,
      time: input.time,
      location: input.location ?? undefined,
      meetingLink: input.meetingLink ?? undefined,
      status: input.status
    }
  });

  return toInterviewResponse(interview);
}

export async function deleteInterview(userId: string, id: string): Promise<void> {
  const existing = await prisma.interview.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw notFound('Interview not found');
  }
  await prisma.interview.delete({ where: { id } });
}
