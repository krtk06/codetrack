import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Notifications from './Notifications';
import * as api from '../features/notifications/notificationsApi';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/notifications/notificationsApi', () => ({
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
  getScheduledJobs: vi.fn()
}));

const preferences = {
  dailyReminders: true,
  goalCompletionAlerts: true,
  interviewNotifications: false,
  contestNotifications: true
};

const jobs = {
  dailyReminderJob: '0 9 * * *',
  goalCompletionJob: '0 10 * * *',
  interviewReminderJob: '0 8 * * *',
  contestAlertJob: '0 12 * * *'
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } }
  });
  return (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('Notifications page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preferences and scheduled jobs', async () => {
    vi.mocked(api.getPreferences).mockResolvedValue(preferences);
    vi.mocked(api.getScheduledJobs).mockResolvedValue(jobs);

    render(<Notifications />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Daily Reminders')).toBeInTheDocument());
    expect(screen.getByText('Goal Completion Alerts')).toBeInTheDocument();
    expect(screen.getByText('Interview Notifications')).toBeInTheDocument();
    expect(screen.getByText('Contest Notifications')).toBeInTheDocument();
    expect(screen.getByText('0 9 * * *')).toBeInTheDocument();
  });

  it('toggles a preference when clicked', async () => {
    vi.mocked(api.getPreferences).mockResolvedValue(preferences);
    vi.mocked(api.updatePreferences).mockResolvedValue({
      ...preferences,
      dailyReminders: false
    });
    vi.mocked(api.getScheduledJobs).mockResolvedValue(jobs);

    render(<Notifications />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Daily Reminders')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Daily Reminders' }));

    await waitFor(() =>
      expect(api.updatePreferences).toHaveBeenCalledWith({ dailyReminders: false })
    );
    expect(toast.success).toHaveBeenCalled();
  });
});
