import { useQuery } from '@tanstack/react-query';
import { getGrowth } from './analyticsApi';
import type { GrowthData, GrowthPeriod } from './analyticsTypes';

export function useGrowth(period: GrowthPeriod) {
  return useQuery<GrowthData>({
    queryKey: ['growth', period],
    queryFn: () => getGrowth(period),
    staleTime: 5 * 60 * 1000
  });
}
