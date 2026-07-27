import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication
} from './applicationsApi';
import type {
  ApplicationStatus,
  CreateApplicationInput
} from './applicationsTypes';

export function useApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: ['applications', status ?? 'all'],
    queryFn: () => getApplications(status),
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) => createApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateApplicationInput> }) =>
      updateApplication(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
}
