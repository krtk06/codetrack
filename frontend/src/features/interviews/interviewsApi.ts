import { api } from '../../lib/api';
import type { CreateInterviewInput, Interview } from './interviewsTypes';

export async function getInterviews(): Promise<Interview[]> {
  const response = await api.get<{ interviews: Interview[] }>('/interviews');
  return response.data.interviews;
}

export async function getUpcomingInterviews(): Promise<Interview[]> {
  const response = await api.get<{ interviews: Interview[] }>('/interviews/upcoming');
  return response.data.interviews;
}

export async function createInterview(input: CreateInterviewInput): Promise<Interview> {
  const response = await api.post<{ interview: Interview }>('/interviews', input);
  return response.data.interview;
}

export async function updateInterview(
  id: string,
  input: Partial<CreateInterviewInput>
): Promise<Interview> {
  const response = await api.patch<{ interview: Interview }>(`/interviews/${id}`, input);
  return response.data.interview;
}

export async function deleteInterview(id: string): Promise<void> {
  await api.delete(`/interviews/${id}`);
}
