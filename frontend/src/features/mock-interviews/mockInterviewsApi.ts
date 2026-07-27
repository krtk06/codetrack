import { api } from '../../lib/api';
import type {
  CreateMockInterviewInput,
  MockInterview,
  MockInterviewPerformance
} from './mockInterviewsTypes';

export async function getMockInterviews(): Promise<MockInterview[]> {
  const response = await api.get<{ mockInterviews: MockInterview[] }>('/mock-interviews');
  return response.data.mockInterviews;
}

export async function createMockInterview(input: CreateMockInterviewInput): Promise<MockInterview> {
  const response = await api.post<{ mockInterview: MockInterview }>('/mock-interviews', input);
  return response.data.mockInterview;
}

export async function updateMockInterview(
  id: string,
  input: Partial<CreateMockInterviewInput>
): Promise<MockInterview> {
  const response = await api.patch<{ mockInterview: MockInterview }>(`/mock-interviews/${id}`, input);
  return response.data.mockInterview;
}

export async function deleteMockInterview(id: string): Promise<void> {
  await api.delete(`/mock-interviews/${id}`);
}

export async function getMockInterviewPerformance(): Promise<MockInterviewPerformance> {
  const response = await api.get<MockInterviewPerformance>('/mock-interviews/performance');
  return response.data;
}
