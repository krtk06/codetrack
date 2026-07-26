export interface DashboardResponse {
  user: {
    name: string;
    goal: string;
    progress: string;
  };
  stats: {
    totalProblemsSolved: number;
    currentStreak: number;
    longestStreak: number;
    contestRating: number | null;
    monthlyGrowth: number;
    applicationsSubmitted: number;
  };
}
