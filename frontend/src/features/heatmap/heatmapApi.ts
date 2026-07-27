import { api } from '../../lib/api';
import type { HeatmapResponse } from './heatmapTypes';

export async function getHeatmap(year: number): Promise<HeatmapResponse> {
  const response = await api.get<HeatmapResponse>('/heatmap', { params: { year } });
  return response.data;
}
