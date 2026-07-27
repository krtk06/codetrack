import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Contests from './Contests';
import * as contestsApi from '../features/contests/contestsApi';
import type { Contest } from '../features/contests/contestsTypes';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/contests/contestsApi', () => ({
  getContests: vi.fn(),
  createContest: vi.fn(),
  importCodeforces: vi.fn(),
  importCodechefCsv: vi.fn()
}));

const contests: Contest[] = [
  {
    id: 'c1',
    platform: 'LEETCODE',
    externalContestId: null,
    contestName: 'Weekly Contest 360',
    date: '2026-05-01T15:00:00.000Z',
    rank: 100,
    solved: 3,
    ratingBefore: 1500,
    ratingAfter: 1520
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

describe('Contests page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the contest list and import controls', async () => {
    vi.mocked(contestsApi.getContests).mockResolvedValue(contests);

    render(<Contests />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Weekly Contest 360')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Add Contest' })).toBeInTheDocument();
    expect(screen.getByText('Import from Codeforces')).toBeInTheDocument();
    expect(screen.getByText('Upload CodeChef CSV')).toBeInTheDocument();
  });

  it('submits a new contest via the form', async () => {
    vi.mocked(contestsApi.getContests).mockResolvedValue(contests);
    vi.mocked(contestsApi.createContest).mockResolvedValue(contests[0]);

    render(<Contests />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Weekly Contest 360')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Contest name'), 'New Contest');
    await userEvent.click(screen.getByRole('button', { name: /add contest/i }));

    await waitFor(() =>
      expect(contestsApi.createContest).toHaveBeenCalledWith(
        expect.objectContaining({ contestName: 'New Contest' })
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('imports Codeforces contests when handle is provided', async () => {
    vi.mocked(contestsApi.getContests).mockResolvedValue([]);
    vi.mocked(contestsApi.importCodeforces).mockResolvedValue(contests);

    render(<Contests />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Add Contest' })).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('tourist'), 'tourist');
    await userEvent.click(screen.getByRole('button', { name: /import/i }));

    await waitFor(() =>
      expect(contestsApi.importCodeforces).toHaveBeenCalledWith('tourist')
    );
  });

  it('uploads a CSV file', async () => {
    vi.mocked(contestsApi.getContests).mockResolvedValue([]);
    vi.mocked(contestsApi.importCodechefCsv).mockResolvedValue(contests);

    const file = new File(['contestName,date,rank\nTest,2026-01-01,1'], 'test.csv', { type: 'text/csv' });

    render(<Contests />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Add Contest' })).toBeInTheDocument());

    const input = screen.getByLabelText('Upload CodeChef CSV') as HTMLInputElement;
    await userEvent.upload(input, file);

    await waitFor(() =>
      expect(contestsApi.importCodechefCsv).toHaveBeenCalledWith(expect.stringContaining('Test'))
    );
  });

  it('shows an error state when loading fails', async () => {
    vi.mocked(contestsApi.getContests).mockRejectedValue(new Error('boom'));

    render(<Contests />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load contests/i)).toBeInTheDocument());
  });
});
