export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  date: string;
  count: number;
  level: HeatmapLevel;
}

export interface HeatmapSummary {
  consistency: number;
  activeDays: number;
  missedDays: number;
  longestStreak: number;
}

export interface HeatmapResponse {
  days: HeatmapDay[];
  summary: HeatmapSummary;
}
