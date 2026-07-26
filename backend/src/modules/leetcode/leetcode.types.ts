export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  contestRating: number | null;
  globalRanking: number | null;
}

export interface LeetCodeGraphQLResponse {
  data?: {
    matchedUser?: {
      submitStatsGlobal?: {
        acSubmissionNum?: Array<{
          difficulty: string;
          count: number;
          submissions: number;
        }>;
      };
    };
    userContestRanking?: {
      rating: number | null;
      globalRanking: number | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
}
