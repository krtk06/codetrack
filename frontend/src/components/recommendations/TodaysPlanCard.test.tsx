import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodaysPlanCard from './TodaysPlanCard';
import * as recommendationsApi from '../../features/recommendations/recommendationsApi';
import type { Recommendations } from '../../features/recommendations/recommendationsTypes';

vi.mock('../../features/recommendations/recommendationsApi', () => ({
  getRecommendations: vi.fn()
}));

const recommendations: Recommendations = {
  weakTopics: ['Arrays', 'Trees'],
  dailyPlan: [
    { topic: 'Arrays', count: 5 },
    { topic: 'Trees', count: 3 }
  ],
  learningPath: [{ phase: 'Focus', topics: ['Arrays', 'Trees'] }],
  generatedAt: '2026-01-01T00:00:00.000Z'
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('TodaysPlanCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders plan items with counts', async () => {
    vi.mocked(recommendationsApi.getRecommendations).mockResolvedValue(recommendations);

    render(<TodaysPlanCard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('5 Arrays Problems')).toBeInTheDocument());
    expect(screen.getByText('3 Trees Problems')).toBeInTheDocument();
  });

  it('shows an empty state when no plan', async () => {
    vi.mocked(recommendationsApi.getRecommendations).mockResolvedValue({
      ...recommendations,
      dailyPlan: []
    });

    render(<TodaysPlanCard />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(screen.getByText(/No plan yet/i)).toBeInTheDocument()
    );
  });

  it('toggles an item as done and persists to localStorage', async () => {
    vi.mocked(recommendationsApi.getRecommendations).mockResolvedValue(recommendations);

    render(<TodaysPlanCard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('5 Arrays Problems')).toBeInTheDocument());

    const toggle = screen.getByRole('button', { name: /Mark Arrays as done/i });
    await userEvent.click(toggle);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Mark Arrays as not done/i })).toBeInTheDocument()
    );

    const stored = window.localStorage.getItem('todays-plan:2026-07-27');
    expect(stored).toContain('Arrays');
  });

  it('resets the plan when the reset button is clicked', async () => {
    vi.mocked(recommendationsApi.getRecommendations).mockResolvedValue(recommendations);

    render(<TodaysPlanCard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('5 Arrays Problems')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Mark Arrays as done/i }));
    await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    await waitFor(() => expect(screen.queryByText('Done')).not.toBeInTheDocument());
  });
});
