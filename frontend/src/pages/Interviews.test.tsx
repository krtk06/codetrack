import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Interviews from './Interviews';
import * as interviewsApi from '../features/interviews/interviewsApi';
import type { Interview } from '../features/interviews/interviewsTypes';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/interviews/interviewsApi', () => ({
  getInterviews: vi.fn(),
  getUpcomingInterviews: vi.fn(),
  createInterview: vi.fn(),
  updateInterview: vi.fn(),
  deleteInterview: vi.fn()
}));

const interviews: Interview[] = [
  {
    id: 'i1',
    company: 'Acme',
    round: 'Technical',
    date: '2026-08-01T00:00:00.000Z',
    time: '10:00',
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

describe('Interviews page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing interviews', async () => {
    vi.mocked(interviewsApi.getInterviews).mockResolvedValue(interviews);

    render(<Interviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getByText(/Technical/)).toBeInTheDocument();
  });

  it('submits a new interview', async () => {
    vi.mocked(interviewsApi.getInterviews).mockResolvedValue([]);
    vi.mocked(interviewsApi.createInterview).mockResolvedValue(interviews[0]);

    render(<Interviews />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText('Company'), 'NewCo');
    await userEvent.type(screen.getByLabelText('Round'), 'HR');
    await userEvent.click(screen.getByRole('button', { name: /schedule interview/i }));

    await waitFor(() =>
      expect(interviewsApi.createInterview).toHaveBeenCalledWith(
        expect.objectContaining({ company: 'NewCo', round: 'HR' })
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('updates interview status', async () => {
    vi.mocked(interviewsApi.getInterviews).mockResolvedValue(interviews);
    vi.mocked(interviewsApi.updateInterview).mockResolvedValue({ ...interviews[0], status: 'COMPLETED' });

    render(<Interviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());

    const select = screen.getByDisplayValue('SCHEDULED');
    await userEvent.selectOptions(select, 'COMPLETED');

    await waitFor(() =>
      expect(interviewsApi.updateInterview).toHaveBeenCalledWith('i1', { status: 'COMPLETED' })
    );
  });

  it('deletes an interview', async () => {
    vi.mocked(interviewsApi.getInterviews).mockResolvedValue(interviews);
    vi.mocked(interviewsApi.deleteInterview).mockResolvedValue(undefined);

    render(<Interviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(interviewsApi.deleteInterview).toHaveBeenCalledWith('i1'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error state when loading fails', async () => {
    vi.mocked(interviewsApi.getInterviews).mockRejectedValue(new Error('boom'));

    render(<Interviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load interviews/i)).toBeInTheDocument());
  });
});
