import { api } from '../../lib/api';
import type {
  NotificationPreferences,
  ScheduledJobs
} from './notificationsTypes';

export async function getPreferences(): Promise<NotificationPreferences> {
  const response = await api.get<NotificationPreferences>('/notifications/preferences');
  return response.data;
}

export async function updatePreferences(
  input: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await api.patch<NotificationPreferences>('/notifications/preferences', input);
  return response.data;
}

export async function getScheduledJobs(): Promise<ScheduledJobs> {
  const response = await api.get<ScheduledJobs>('/notifications/jobs');
  return response.data;
}
