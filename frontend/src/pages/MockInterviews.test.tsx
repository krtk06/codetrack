import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import MockInterviews from './MockInterviews';
import * as api from '../features/mock-interviews/mockInterviewsApi';
import type { MockInterview } from '../features/mock-interviews/mockInterviewsTypes';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/mock-interviews/mockInterviewsApi', () => ({
  getMockInterviews: vi.fn(),
  getMockInterviewPerformance: vi.fn(),
  createMockInterview: vi.fn(),
  updateMockInterview: vi.fn(),
  deleteMockInterview: vi.fn()
}));

const mockInterview: MockInterview = {
  id: 'm1',
  date: '2026-01-15T00:00:00.000Z',
  interviewer: 'Alice',
  topic: 'DSA',
  score: 7,
  scoreOutOf: 10,
  feedback: 'Good progress',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z'
};

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

describe('MockInterviews page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mock interviews and performance summary', async () => {
    vi.mocked(api.getMockInterviews).mockResolvedValue([mockInterview]);
    vi.mocked(api.getMockInterviewPerformance).mockResolvedValue({
      averageScore: 70,
      totalInterviews: 1,
      topicBreakdown: [{ topic: 'DSA', averageScore: 70, count: 1 }],
      scoreTrend: [{ date: '2026-01-15', percentage: 70 }]
    });

    render(<MockInterviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getAllByText('DSA').length).toBeGreaterThan(0));
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('deletes an entry when delete is clicked', async () => {
    vi.mocked(api.getMockInterviews).mockResolvedValue([mockInterview]);
    vi.mocked(api.getMockInterviewPerformance).mockResolvedValue({
      averageScore: 70,
      totalInterviews: 1,
      topicBreakdown: [{ topic: 'DSA', averageScore: 70, count: 1 }],
      scoreTrend: [{ date: '2026-01-15', percentage: 70 }]
    });
    vi.mocked(api.deleteMockInterview).mockResolvedValue(undefined);

    render(<MockInterviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getAllByText('DSA').length).toBeGreaterThan(0));

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(api.deleteMockInterview).toHaveBeenCalledWith('m1'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error state when loading fails', async () => {
    vi.mocked(api.getMockInterviews).mockRejectedValue(new Error('boom'));
    vi.mocked(api.getMockInterviewPerformance).mockResolvedValue({
      averageScore: 0,
      totalInterviews: 0,
      topicBreakdown: [],
      scoreTrend: []
    });

    render(<MockInterviews />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load mock interviews/i)).toBeInTheDocument());
  });
});
