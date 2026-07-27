import { toast } from 'react-toastify';
import {
  useNotificationPreferences,
  useScheduledJobs,
  useUpdateNotificationPreferences
} from '../features/notifications/useNotifications';
import type { NotificationPreferences } from '../features/notifications/notificationsTypes';

const TOGGLES: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: 'dailyReminders',
    label: 'Daily Reminders',
    description: 'Receive a daily summary of your coding activity.'
  },
  {
    key: 'goalCompletionAlerts',
    label: 'Goal Completion Alerts',
    description: 'Get notified when you hit a goal.'
  },
  {
    key: 'interviewNotifications',
    label: 'Interview Notifications',
    description: 'Reminders for upcoming scheduled interviews.'
  },
  {
    key: 'contestNotifications',
    label: 'Contest Notifications',
    description: 'Alerts for upcoming contest registrations.'
  }
];

export default function Notifications() {
  const { data, isLoading, error } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const { data: jobs, isLoading: jobsLoading } = useScheduledJobs();

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    update.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success('Preferences updated'),
        onError: () => toast.error('Failed to update preferences')
      }
    );
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load notification preferences.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Notifications</h1>
        <p className="text-[var(--muted-foreground)]">Control which notifications you receive.</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : (
          <ul className="space-y-4">
            {TOGGLES.map(({ key, label, description }) => {
              const value = data?.[key] ?? false;
              return (
                <li
                  key={key}
                  className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key, !value)}
                    disabled={update.isPending}
                    aria-label={`Toggle ${label}`}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      value ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        value ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Scheduled Jobs</h2>
        {jobsLoading ? (
          <div className="h-16 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : jobs ? (
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2">
              <span className="text-[var(--foreground)]">Daily Reminder</span>
              <code className="text-xs text-[var(--muted-foreground)]">{jobs.dailyReminderJob}</code>
            </li>
            <li className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2">
              <span className="text-[var(--foreground)]">Goal Completion Check</span>
              <code className="text-xs text-[var(--muted-foreground)]">{jobs.goalCompletionJob}</code>
            </li>
            <li className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2">
              <span className="text-[var(--foreground)]">Interview Reminder</span>
              <code className="text-xs text-[var(--muted-foreground)]">{jobs.interviewReminderJob}</code>
            </li>
            <li className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2">
              <span className="text-[var(--foreground)]">Contest Alert</span>
              <code className="text-xs text-[var(--muted-foreground)]">{jobs.contestAlertJob}</code>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">No jobs scheduled.</p>
        )}
      </div>
    </div>
  );
}
