import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPreferences,
  getScheduledJobs,
  updatePreferences
} from './notificationsApi';
import type { NotificationPreferences } from './notificationsTypes';

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: getPreferences,
    staleTime: 5 * 60 * 1000
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<NotificationPreferences>) => updatePreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    }
  });
}

export function useScheduledJobs() {
  return useQuery({
    queryKey: ['notifications', 'jobs'],
    queryFn: getScheduledJobs,
    staleTime: 5 * 60 * 1000
  });
}
