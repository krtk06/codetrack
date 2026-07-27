export type GrowthPeriod = 'weekly' | 'monthly' | 'yearly';

export interface GrowthData {
  labels: string[];
  data: number[];
}
