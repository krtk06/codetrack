import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContests, getContestAnalysis, createContest, importCodeforces, importCodechefCsv } from './contestsApi';
import type { CreateContestInput } from './contestsTypes';

export function useContests() {
  return useQuery({
    queryKey: ['contests'],
    queryFn: getContests,
    staleTime: 5 * 60 * 1000
  });
}

export function useContestAnalysis() {
  return useQuery({
    queryKey: ['contests', 'analysis'],
    queryFn: getContestAnalysis,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContestInput) => createContest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    }
  });
}

export function useImportCodeforces() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (handle: string) => importCodeforces(handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    }
  });
}

export function useImportCodechefCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) => importCodechefCsv(csv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    }
  });
}
