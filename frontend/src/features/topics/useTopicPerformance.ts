import { useQuery } from '@tanstack/react-query';
import { getTopicPerformance } from './topicsApi';
import type { TopicPerformance } from './topicsTypes';

export function useTopicPerformance() {
  return useQuery<TopicPerformance[]>({
    queryKey: ['topics', 'performance'],
    queryFn: getTopicPerformance,
    staleTime: 5 * 60 * 1000
  });
}
