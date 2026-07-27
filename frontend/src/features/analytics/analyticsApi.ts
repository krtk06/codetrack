import { api } from '../../lib/api';
import type { GrowthData, GrowthPeriod, AnalyticsSummary } from './analyticsTypes';

export async function getGrowth(period: GrowthPeriod): Promise<GrowthData> {
  const response = await api.get<GrowthData>('/analytics/growth', { params: { period } });
  return response.data;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await api.get<AnalyticsSummary>('/analytics/summary');
  return response.data;
}
