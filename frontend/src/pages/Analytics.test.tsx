import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from './Analytics';
import * as analyticsApi from '../features/analytics/analyticsApi';

vi.mock('../features/analytics/analyticsApi', () => ({
  getGrowth: vi.fn(),
  getAnalyticsSummary: vi.fn()
}));

vi.mock('../components/charts/TrendChart', () => ({
  default: ({ title }: { title: string }) => <div data-testid="trend-chart">{title}</div>
}));

const summary = {
  dailyGrowth: 3,
  weeklyGrowth: 21,
  monthlyGrowth: 90,
  problemsPerDay: 4.5,
  successRate: 65,
  codingConsistency: 80,
  streakAnalysis: { current: 5, longest: 12 }
};

const growth = {
  labels: ['Mon', 'Tue', 'Wed'],
  data: [10, 20, 30]
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Analytics page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary cards and chart titles', async () => {
    vi.mocked(analyticsApi.getAnalyticsSummary).mockResolvedValue(summary);
    vi.mocked(analyticsApi.getGrowth).mockResolvedValue(growth);

    render(<Analytics />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    const charts = screen.getAllByTestId('trend-chart');
    expect(charts).toHaveLength(3);
    expect(charts[0]).toHaveTextContent('Weekly Trend');
    expect(charts[1]).toHaveTextContent('Monthly Trend');
    expect(charts[2]).toHaveTextContent('Yearly Trend');
  });

  it('shows an error state when summary fails', async () => {
    vi.mocked(analyticsApi.getAnalyticsSummary).mockRejectedValue(new Error('boom'));
    vi.mocked(analyticsApi.getGrowth).mockResolvedValue(growth);

    render(<Analytics />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load analytics summary/i)).toBeInTheDocument());
  });
});
