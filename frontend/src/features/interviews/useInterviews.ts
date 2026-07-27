import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInterview,
  deleteInterview,
  getInterviews,
  getUpcomingInterviews,
  updateInterview
} from './interviewsApi';
import type { CreateInterviewInput } from './interviewsTypes';

export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: getInterviews,
    staleTime: 5 * 60 * 1000
  });
}

export function useUpcomingInterviews() {
  return useQuery({
    queryKey: ['interviews', 'upcoming'],
    queryFn: getUpcomingInterviews,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInterviewInput) => createInterview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateInterviewInput> }) =>
      updateInterview(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}
