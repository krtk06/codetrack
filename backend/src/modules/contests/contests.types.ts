export type Platform = 'LEETCODE' | 'CODEFORCES' | 'CODECHEF';

export interface ContestRecord {
  platform: Platform;
  externalContestId: string | null;
  contestName: string;
  date: Date;
  rank: number;
  solved: number;
  ratingBefore: number | null;
  ratingAfter: number | null;
}

export interface ContestResponse {
  id: string;
  platform: Platform;
  externalContestId: string | null;
  contestName: string;
  date: Date;
  rank: number;
  solved: number;
  ratingBefore: number | null;
  ratingAfter: number | null;
}

export interface CreateContestInput {
  platform: Platform;
  externalContestId?: string | null;
  contestName: string;
  date: Date | string;
  rank: number;
  solved?: number;
  ratingBefore?: number | null;
  ratingAfter?: number | null;
}
