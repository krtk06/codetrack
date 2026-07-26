export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  contestRating: number | null;
  globalRanking: number | null;
}

export interface LeetCodeStatsResponse extends LeetCodeStats {
  lastUpdated: string;
  isStale: boolean;
}
