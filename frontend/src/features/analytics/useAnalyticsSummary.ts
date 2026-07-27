import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary } from './analyticsApi';
import type { AnalyticsSummary } from './analyticsTypes';

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummary,
    staleTime: 5 * 60 * 1000
  });
}
