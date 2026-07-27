import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AICoach from './AICoach';
import * as api from '../features/ai-coach/aiCoachApi';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/ai-coach/aiCoachApi', () => ({
  analyzeFailure: vi.fn()
}));

const analysis = {
  weakAreas: ['Trees', 'System Design', 'Behavioral Questions'],
  recommendedPlan: [
    { activity: 'Tree Problems', count: 10 },
    { activity: 'System Design Reading', count: 3 },
    { activity: 'Mock Behavioral Interviews', count: 5 }
  ]
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } }
  });
  return (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AICoach page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the description and shows the analysis', async () => {
    vi.mocked(api.analyzeFailure).mockResolvedValue(analysis);

    render(<AICoach />, { wrapper: Wrapper });

    const textarea = screen.getByPlaceholderText(/I failed my Amazon interview/i);
    await userEvent.type(textarea, 'I failed my Amazon interview due to weak tree problems.');

    await userEvent.click(screen.getByRole('button', { name: /get analysis/i }));

    await waitFor(() => expect(api.analyzeFailure).toHaveBeenCalled());
    expect(await screen.findByText('Trees')).toBeInTheDocument();
    expect(screen.getByText('System Design Reading')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast for very short descriptions', async () => {
    render(<AICoach />, { wrapper: Wrapper });

    await userEvent.type(screen.getByPlaceholderText(/I failed my Amazon interview/i), 'hi');
    await userEvent.click(screen.getByRole('button', { name: /get analysis/i }));

    expect(toast.error).toHaveBeenCalled();
    expect(api.analyzeFailure).not.toHaveBeenCalled();
  });
});
