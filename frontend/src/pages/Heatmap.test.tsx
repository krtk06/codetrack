import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Heatmap from './Heatmap';
import * as heatmapApi from '../features/heatmap/heatmapApi';
import type { HeatmapResponse } from '../features/heatmap/heatmapTypes';

vi.mock('../features/heatmap/heatmapApi', () => ({
  getHeatmap: vi.fn()
}));

const response: HeatmapResponse = {
  days: [
    { date: '2026-01-01', count: 5, level: 3 },
    { date: '2026-01-02', count: 0, level: 0 }
  ],
  summary: {
    consistency: 50,
    activeDays: 1,
    missedDays: 1,
    longestStreak: 1
  }
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Heatmap page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary stats and calendar', async () => {
    vi.mocked(heatmapApi.getHeatmap).mockResolvedValue(response);

    render(<Heatmap />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('50%')).toBeInTheDocument());
    expect(screen.getByText('Active Days')).toBeInTheDocument();
    expect(screen.getByText('Missed Days')).toBeInTheDocument();
    expect(screen.getByText('Longest Streak')).toBeInTheDocument();
    expect(screen.getByLabelText('2026-01-01: 5 problems')).toBeInTheDocument();
  });

  it('shows an error state when fetching fails', async () => {
    vi.mocked(heatmapApi.getHeatmap).mockRejectedValue(new Error('boom'));

    render(<Heatmap />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load heatmap/i)).toBeInTheDocument());
  });
});
