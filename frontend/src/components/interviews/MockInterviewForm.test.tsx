import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockInterviewForm from './MockInterviewForm';
import * as api from '../../features/mock-interviews/mockInterviewsApi';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../../features/mock-interviews/mockInterviewsApi', () => ({
  createMockInterview: vi.fn(),
  getMockInterviews: vi.fn(),
  getMockInterviewPerformance: vi.fn(),
  updateMockInterview: vi.fn(),
  deleteMockInterview: vi.fn()
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('MockInterviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the form with the entered values', async () => {
    vi.mocked(api.createMockInterview).mockResolvedValue({} as any);

    render(<MockInterviewForm />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText('Interviewer'), 'Alice');
    await userEvent.type(screen.getByLabelText('Topic'), 'DSA');
    await userEvent.click(screen.getByRole('button', { name: /log interview/i }));

    await waitFor(() =>
      expect(api.createMockInterview).toHaveBeenCalledWith(
        expect.objectContaining({ interviewer: 'Alice', topic: 'DSA' })
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });
});
