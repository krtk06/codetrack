import { api } from '../../lib/api';
import type { GrowthData, GrowthPeriod } from './analyticsTypes';

export async function getGrowth(period: GrowthPeriod): Promise<GrowthData> {
  const response = await api.get<GrowthData>('/analytics/growth', { params: { period } });
  return response.data;
}
