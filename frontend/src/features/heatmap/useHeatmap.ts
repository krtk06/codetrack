import { useQuery } from '@tanstack/react-query';
import { getHeatmap } from './heatmapApi';
import type { HeatmapResponse } from './heatmapTypes';

export function useHeatmap(year: number) {
  return useQuery<HeatmapResponse>({
    queryKey: ['heatmap', year],
    queryFn: () => getHeatmap(year),
    staleTime: 5 * 60 * 1000
  });
}
