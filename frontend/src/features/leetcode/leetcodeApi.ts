import { api } from '../../lib/api';
import type { LeetCodeStatsResponse } from './leetcodeTypes';

export async function getLeetCodeStats(username: string): Promise<LeetCodeStatsResponse> {
  const response = await api.get<{ stats: LeetCodeStatsResponse }>(`/leetcode/${username}/stats`);
  return response.data.stats;
}

export async function syncLeetCode(username: string): Promise<LeetCodeStatsResponse> {
  const response = await api.post<{ stats: LeetCodeStatsResponse }>(`/leetcode/${username}/sync`);
  return response.data.stats;
}
