import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TopicAnalysis from './TopicAnalysis';
import * as topicsApi from '../features/topics/topicsApi';

vi.mock('../features/topics/topicsApi', () => ({
  getTopicPerformance: vi.fn()
}));

vi.mock('../components/charts/TopicRadarChart', () => ({
  default: () => <div data-testid="radar-chart" />
}));

const performance = [
  { topicId: '1', name: 'Arrays', solved: 20, attempted: 25, successRate: 80 },
  { topicId: '2', name: 'DP', solved: 2, attempted: 10, successRate: 20 }
];

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('TopicAnalysis page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders radar chart and topic lists', async () => {
    vi.mocked(topicsApi.getTopicPerformance).mockResolvedValue(performance);

    render(<TopicAnalysis />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Arrays')).toBeInTheDocument());
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByText('DP')).toBeInTheDocument();
  });

  it('shows an error state when fetching fails', async () => {
    vi.mocked(topicsApi.getTopicPerformance).mockRejectedValue(new Error('boom'));

    render(<TopicAnalysis />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load topic performance/i)).toBeInTheDocument());
  });
});
