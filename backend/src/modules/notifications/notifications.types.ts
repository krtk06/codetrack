export interface NotificationPreferencesResponse {
  dailyReminders: boolean;
  goalCompletionAlerts: boolean;
  interviewNotifications: boolean;
  contestNotifications: boolean;
}

export interface UpdateNotificationPreferencesInput {
  dailyReminders?: boolean;
  goalCompletionAlerts?: boolean;
  interviewNotifications?: boolean;
  contestNotifications?: boolean;
}
