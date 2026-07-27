export type GrowthPeriod = 'weekly' | 'monthly' | 'yearly';

export interface GrowthData {
  labels: string[];
  data: number[];
}

export interface StreakAnalysis {
  current: number;
  longest: number;
}

export interface AnalyticsSummary {
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  problemsPerDay: number;
  successRate: number;
  codingConsistency: number;
  streakAnalysis: StreakAnalysis;
}
