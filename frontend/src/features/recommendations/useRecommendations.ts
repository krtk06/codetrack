import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from './recommendationsApi';
import type { Recommendations } from './recommendationsTypes';

export function useRecommendations() {
  return useQuery<Recommendations>({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
    staleTime: 5 * 60 * 1000
  });
}
