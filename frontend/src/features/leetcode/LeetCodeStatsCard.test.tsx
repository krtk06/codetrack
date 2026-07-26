import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeetCodeStatsCard from './LeetCodeStatsCard';
import * as leetcodeApi from './leetcodeApi';

vi.mock('./leetcodeApi', () => ({
  getLeetCodeStats: vi.fn(),
  syncLeetCode: vi.fn()
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const stats = {
  totalSolved: 100,
  easySolved: 30,
  mediumSolved: 50,
  hardSolved: 20,
  acceptanceRate: 0.5,
  contestRating: 1500,
  globalRanking: 10000,
  lastUpdated: new Date().toISOString(),
  isStale: false
};

describe('LeetCodeStatsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prompts to add a username when none is provided', () => {
    render(<LeetCodeStatsCard username={undefined} />, { wrapper: Wrapper });
    expect(screen.getByText(/add your leetcode username/i)).toBeInTheDocument();
  });

  it('renders stats and sync button', async () => {
    vi.mocked(leetcodeApi.getLeetCodeStats).mockResolvedValue(stats);
    render(<LeetCodeStatsCard username="alice_lc" />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument());
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
  });

  it('syncs when the sync button is clicked', async () => {
    vi.mocked(leetcodeApi.getLeetCodeStats).mockResolvedValue(stats);
    vi.mocked(leetcodeApi.syncLeetCode).mockResolvedValue(stats);

    render(<LeetCodeStatsCard username="alice_lc" />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /sync/i }));
    await waitFor(() =>
      expect(leetcodeApi.syncLeetCode).toHaveBeenCalledWith('alice_lc', expect.any(Object))
    );
  });

  it('shows a stale warning when data is stale', async () => {
    vi.mocked(leetcodeApi.getLeetCodeStats).mockResolvedValue({ ...stats, isStale: true });
    render(<LeetCodeStatsCard username="alice_lc" />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/older than 48 hours/i)).toBeInTheDocument());
  });
});
