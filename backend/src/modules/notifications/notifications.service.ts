import { prisma } from '../../config/database.js';
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesInput
} from './notifications.types.js';

function toResponse(prefs: {
  dailyReminders: boolean;
  goalCompletionAlerts: boolean;
  interviewNotifications: boolean;
  contestNotifications: boolean;
}): NotificationPreferencesResponse {
  return {
    dailyReminders: prefs.dailyReminders,
    goalCompletionAlerts: prefs.goalCompletionAlerts,
    interviewNotifications: prefs.interviewNotifications,
    contestNotifications: prefs.contestNotifications
  };
}

export async function getPreferences(
  userId: string
): Promise<NotificationPreferencesResponse> {
  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });
  return toResponse(prefs);
}

export async function updatePreferences(
  userId: string,
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferencesResponse> {
  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      dailyReminders: input.dailyReminders,
      goalCompletionAlerts: input.goalCompletionAlerts,
      interviewNotifications: input.interviewNotifications,
      contestNotifications: input.contestNotifications
    },
    create: {
      userId,
      dailyReminders: input.dailyReminders ?? true,
      goalCompletionAlerts: input.goalCompletionAlerts ?? true,
      interviewNotifications: input.interviewNotifications ?? true,
      contestNotifications: input.contestNotifications ?? true
    }
  });
  return toResponse(prefs);
}

export interface ScheduledJobSummary {
  dailyReminderJob: string;
  goalCompletionJob: string;
  interviewReminderJob: string;
  contestAlertJob: string;
}

export function getScheduledJobs(): ScheduledJobSummary {
  return {
    dailyReminderJob: '0 9 * * *',
    goalCompletionJob: '0 10 * * *',
    interviewReminderJob: '0 8 * * *',
    contestAlertJob: '0 12 * * *'
  };
}
