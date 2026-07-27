export type Platform = 'LEETCODE' | 'CODEFORCES' | 'CODECHEF';

export interface Contest {
  id: string;
  platform: Platform;
  externalContestId: string | null;
  contestName: string;
  date: string;
  rank: number;
  solved: number;
  ratingBefore: number | null;
  ratingAfter: number | null;
}

export interface CreateContestInput {
  platform: Platform;
  externalContestId?: string | null;
  contestName: string;
  date: string;
  rank: number;
  solved?: number;
  ratingBefore?: number | null;
  ratingAfter?: number | null;
}
