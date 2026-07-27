import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createResume,
  deleteResume,
  getResumes,
  getResumeStats
} from './resumesApi';

export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: getResumes,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { label: string; fileBase64: string; filename: string }) =>
      createResume(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    }
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    }
  });
}

export function useResumeStats(id: string | null) {
  return useQuery({
    queryKey: ['resumes', id, 'stats'],
    queryFn: () => getResumeStats(id as string),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000
  });
}
