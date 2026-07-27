import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMockInterview,
  deleteMockInterview,
  getMockInterviewPerformance,
  getMockInterviews,
  updateMockInterview
} from './mockInterviewsApi';
import type { CreateMockInterviewInput } from './mockInterviewsTypes';

export function useMockInterviews() {
  return useQuery({
    queryKey: ['mock-interviews'],
    queryFn: getMockInterviews,
    staleTime: 5 * 60 * 1000
  });
}

export function useMockInterviewPerformance() {
  return useQuery({
    queryKey: ['mock-interviews', 'performance'],
    queryFn: getMockInterviewPerformance,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateMockInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMockInterviewInput) => createMockInterview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-interviews'] });
    }
  });
}

export function useUpdateMockInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateMockInterviewInput> }) =>
      updateMockInterview(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-interviews'] });
    }
  });
}

export function useDeleteMockInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMockInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-interviews'] });
    }
  });
}
