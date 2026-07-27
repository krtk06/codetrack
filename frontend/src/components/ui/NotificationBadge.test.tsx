import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import NotificationBadge from './NotificationBadge';
import * as api from '../../features/interviews/interviewsApi';
import type { Interview } from '../../features/interviews/interviewsTypes';

vi.mock('../../features/interviews/interviewsApi', () => ({
  getUpcomingInterviews: vi.fn(),
  getInterviews: vi.fn(),
  createInterview: vi.fn(),
  updateInterview: vi.fn(),
  deleteInterview: vi.fn()
}));

const interviews: Interview[] = [
  {
    id: 'i1',
    company: 'Acme',
    round: 'Tech',
    date: '2026-08-01T00:00:00.000Z',
    time: '10:00',
    location: null,
    meetingLink: null,
    status: 'SCHEDULED',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z'
  },
  {
    id: 'i2',
    company: 'Globex',
    round: 'Onsite',
    date: '2026-08-05T00:00:00.000Z',
    time: '14:00',
    location: null,
    meetingLink: null,
    status: 'SCHEDULED',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z'
  }
];

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('NotificationBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without a count when there are no upcoming interviews', async () => {
    vi.mocked(api.getUpcomingInterviews).mockResolvedValue([]);

    render(<NotificationBadge />, { wrapper: Wrapper });

    await waitFor(() => expect(api.getUpcomingInterviews).toHaveBeenCalled());
    expect(screen.queryByTestId('notification-count')).not.toBeInTheDocument();
  });

  it('shows the count and opens a dropdown with upcoming interviews', async () => {
    vi.mocked(api.getUpcomingInterviews).mockResolvedValue(interviews);

    render(<NotificationBadge />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByTestId('notification-count')).toHaveTextContent('2'));

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('View all')).toBeInTheDocument();
  });
});
