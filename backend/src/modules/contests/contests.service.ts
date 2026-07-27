import { prisma } from '../../config/database.js';
import { badRequest } from '../../common/errors.js';
import {
  fetchCodeforcesRatingHistory,
  type CodeforcesRatingChange
} from './codeforces.client.js';
import { parseCodechefCsv } from './codechef.parser.js';
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

export async function createContests(
  userId: string,
  records: CreateContestInput[]
): Promise<ContestResponse[]> {
  if (records.length === 0) {
    return [];
  }

  const contests = await prisma.$transaction(
    records.map((record) =>
      prisma.contest.create({
        data: {
          userId,
          platform: record.platform,
          externalContestId: record.externalContestId ?? null,
          contestName: record.contestName,
          date: new Date(record.date),
          rank: record.rank,
          solved: record.solved ?? 0,
          ratingBefore: record.ratingBefore ?? null,
          ratingAfter: record.ratingAfter ?? null
        }
      })
    )
  );

  return contests.map(toContestResponse);
}

export async function importCodechefCsv(
  userId: string,
  csv: string
): Promise<ContestResponse[]> {
  const records: ContestRecord[] = parseCodechefCsv(csv);
  if (records.length === 0) {
    return [];
  }

  const contests = await prisma.$transaction(
    records.map((record) =>
      prisma.contest.create({
        data: {
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
    )
  );

  return contests.map(toContestResponse);
}

export interface ContestAnalysis {
  bestRank: number;
  worstRank: number;
  averageRank: number;
  ratingGrowth: number;
  participationFrequency: number;
  ratingTrend: number[];
}

export async function getContestAnalysis(userId: string): Promise<ContestAnalysis> {
  const contests = await prisma.contest.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });

  if (contests.length === 0) {
    return {
      bestRank: 0,
      worstRank: 0,
      averageRank: 0,
      ratingGrowth: 0,
      participationFrequency: 0,
      ratingTrend: []
    };
  }

  const ranks = contests.map((c) => c.rank).filter((rank) => rank > 0);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
  const worstRank = ranks.length > 0 ? Math.max(...ranks) : 0;
  const averageRank =
    ranks.length > 0
      ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length)
      : 0;

  const ratings = contests
    .filter((c) => c.ratingAfter !== null && c.ratingAfter !== undefined)
    .map((c) => c.ratingAfter as number);

  const ratingTrend = ratings;
  let ratingGrowth = 0;
  if (contests.length >= 2) {
    const first = contests[0];
    const last = contests[contests.length - 1];
    const startRating = first.ratingBefore ?? first.ratingAfter;
    const endRating = last.ratingAfter ?? last.ratingBefore;
    if (startRating !== null && startRating !== undefined && endRating !== null && endRating !== undefined) {
      ratingGrowth = endRating - startRating;
    }
  }

  const firstDate = new Date(contests[0].date);
  const lastDate = new Date(contests[contests.length - 1].date);
  const daysSpan = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
  const participationFrequency = Math.round((contests.length / daysSpan) * 30 * 100) / 100;

  return {
    bestRank,
    worstRank,
    averageRank,
    ratingGrowth,
    participationFrequency,
    ratingTrend
  };
}
