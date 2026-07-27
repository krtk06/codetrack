import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContestAnalysis from './ContestAnalysis';
import * as contestsApi from '../features/contests/contestsApi';
import type { ContestAnalysis as Analysis } from '../features/contests/contestsTypes';

vi.mock('../features/contests/contestsApi', () => ({
  getContestAnalysis: vi.fn()
}));

vi.mock('../components/charts/RatingTrendChart', () => ({
  default: () => <div data-testid="rating-trend" />
}));

const analysis: Analysis = {
  bestRank: 10,
  worstRank: 500,
  averageRank: 120,
  ratingGrowth: 150,
  participationFrequency: 2.5,
  ratingTrend: [1500, 1550, 1600, 1650]
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('ContestAnalysis page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary stats and trend chart', async () => {
    vi.mocked(contestsApi.getContestAnalysis).mockResolvedValue(analysis);

    render(<ContestAnalysis />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('+150')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByTestId('rating-trend')).toBeInTheDocument();
  });

  it('shows an error state when loading fails', async () => {
    vi.mocked(contestsApi.getContestAnalysis).mockRejectedValue(new Error('boom'));

    render(<ContestAnalysis />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load contest analysis/i)).toBeInTheDocument());
  });
});
