import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeetCodeStats, syncLeetCode } from './leetcodeApi';
import type { LeetCodeStatsResponse } from './leetcodeTypes';

export function useLeetCodeStats(username: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<LeetCodeStatsResponse, Error>({
    queryKey: ['leetcode', username],
    queryFn: () => getLeetCodeStats(username!),
    enabled: Boolean(username)
  });

  const mutation = useMutation<LeetCodeStatsResponse, Error, string>({
    mutationFn: syncLeetCode,
    onSuccess: (_data, syncedUsername) => {
      queryClient.invalidateQueries({ queryKey: ['leetcode', syncedUsername] });
    }
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    sync: mutation.mutate,
    isSyncing: mutation.isPending
  };
}
