export interface NotificationPreferences {
  dailyReminders: boolean;
  goalCompletionAlerts: boolean;
  interviewNotifications: boolean;
  contestNotifications: boolean;
}

export interface ScheduledJobs {
  dailyReminderJob: string;
  goalCompletionJob: string;
  interviewReminderJob: string;
  contestAlertJob: string;
}
