import { prisma } from '../../config/database.js';
import { badRequest } from '../../common/errors.js';
import {
  fetchCodeforcesRatingHistory,
  type CodeforcesRatingChange
} from './codeforces.client.js';
import type { ContestRecord, ContestResponse, CreateContestInput } from './contests.types.js';

function toContestResponse(contest: {
  id: string;
  platform: string;
  externalContestId: string | null;
  contestName: string;
  date: Date;
  rank: number;
  solved: number;
  ratingBefore: number | null;
  ratingAfter: number | null;
}): ContestResponse {
  return {
    id: contest.id,
    platform: contest.platform as ContestResponse['platform'],
    externalContestId: contest.externalContestId,
    contestName: contest.contestName,
    date: contest.date,
    rank: contest.rank,
    solved: contest.solved,
    ratingBefore: contest.ratingBefore,
    ratingAfter: contest.ratingAfter
  };
}

function ratingChangeToRecord(change: CodeforcesRatingChange): Omit<ContestRecord, 'externalContestId'> & { externalContestId: string } {
  return {
    platform: 'CODEFORCES',
    externalContestId: String(change.contestId),
    contestName: change.contestName,
    date: new Date(change.ratingUpdateTimeSeconds * 1000),
    rank: change.rank,
    solved: 0,
    ratingBefore: change.oldRating,
    ratingAfter: change.newRating
  };
}

export async function importCodeforcesContests(
  userId: string,
  handle: string
): Promise<ContestResponse[]> {
  if (!handle) {
    throw badRequest('Codeforces handle is required');
  }

  const history = await fetchCodeforcesRatingHistory(handle);
  const records = history.map(ratingChangeToRecord);

  const upserts = records.map((record) =>
    prisma.contest.upsert({
      where: {
        userId_platform_externalContestId: {
          userId,
          platform: record.platform,
          externalContestId: record.externalContestId
        }
      },
      update: {
        contestName: record.contestName,
        date: record.date,
        rank: record.rank,
        ratingBefore: record.ratingBefore,
        ratingAfter: record.ratingAfter
      },
      create: {
        userId,
        platform: record.platform,
        externalContestId: record.externalContestId,
        contestName: record.contestName,
        date: record.date,
        rank: record.rank,
        solved: record.solved,
        ratingBefore: record.ratingBefore,
        ratingAfter: record.ratingAfter
      }
    })
  );

  const contests = await prisma.$transaction(upserts);
  return contests.map(toContestResponse);
}

export async function createContest(
  userId: string,
  input: CreateContestInput
): Promise<ContestResponse> {
  const contest = await prisma.contest.create({
    data: {
      userId,
      platform: input.platform,
      externalContestId: input.externalContestId ?? null,
      contestName: input.contestName,
      date: new Date(input.date),
      rank: input.rank,
      solved: input.solved ?? 0,
      ratingBefore: input.ratingBefore ?? null,
      ratingAfter: input.ratingAfter ?? null
    }
  });

  return toContestResponse(contest);
}

export async function getContests(userId: string): Promise<ContestResponse[]> {
  const contests = await prisma.contest.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });
  return contests.map(toContestResponse);
}
