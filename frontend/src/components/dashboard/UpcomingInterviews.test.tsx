import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UpcomingInterviews from './UpcomingInterviews';
import * as interviewsApi from '../../features/interviews/interviewsApi';
import type { Interview } from '../../features/interviews/interviewsTypes';

vi.mock('../../features/interviews/interviewsApi', () => ({
  getUpcomingInterviews: vi.fn()
}));

const interview: Interview = {
  id: 'i1',
  company: 'FutureCo',
  round: 'Onsite',
  date: '2026-09-01T00:00:00.000Z',
  time: '14:00',
  location: null,
  meetingLink: 'https://meet.example.com/abc',
  status: 'SCHEDULED',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z'
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('UpcomingInterviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty state when there are no upcoming interviews', async () => {
    vi.mocked(interviewsApi.getUpcomingInterviews).mockResolvedValue([]);

    render(<UpcomingInterviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/No upcoming interviews scheduled/i)).toBeInTheDocument());
  });

  it('renders upcoming interviews with a join link', async () => {
    vi.mocked(interviewsApi.getUpcomingInterviews).mockResolvedValue([interview]);

    render(<UpcomingInterviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('FutureCo')).toBeInTheDocument());
    expect(screen.getByText(/Onsite/)).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
  });

  it('shows an error state when loading fails', async () => {
    vi.mocked(interviewsApi.getUpcomingInterviews).mockRejectedValue(new Error('boom'));

    render(<UpcomingInterviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load upcoming interviews/i)).toBeInTheDocument());
  });
});
