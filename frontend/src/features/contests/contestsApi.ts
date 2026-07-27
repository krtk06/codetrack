import { api } from '../../lib/api';
import type { Contest, ContestAnalysis, CreateContestInput } from './contestsTypes';

export async function getContests(): Promise<Contest[]> {
  const response = await api.get<{ contests: Contest[] }>('/contests');
  return response.data.contests;
}

export async function getContestAnalysis(): Promise<ContestAnalysis> {
  const response = await api.get<ContestAnalysis>('/contests/analysis');
  return response.data;
}

export async function createContest(input: CreateContestInput): Promise<Contest> {
  const response = await api.post<{ contest: Contest }>('/contests', input);
  return response.data.contest;
}

export async function importCodeforces(handle: string): Promise<Contest[]> {
  const response = await api.post<{ contests: Contest[] }>('/contests/import/codeforces', { handle });
  return response.data.contests;
}

export async function importCodechefCsv(csv: string): Promise<Contest[]> {
  const response = await api.post<{ contests: Contest[] }>('/contests/import/codechef/csv', { csv });
  return response.data.contests;
}
