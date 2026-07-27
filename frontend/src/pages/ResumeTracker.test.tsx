import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ResumeTracker from './ResumeTracker';
import * as api from '../features/resumes/resumesApi';
import type { Resume, ResumeStats } from '../features/resumes/resumesTypes';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/resumes/resumesApi', () => ({
  getResumes: vi.fn(),
  createResume: vi.fn(),
  deleteResume: vi.fn(),
  getResumeStats: vi.fn()
}));

const mockResume: Resume = {
  id: 'r1',
  label: 'Resume V1',
  url: 'https://example.com/r1.pdf',
  cloudinaryPublicId: 'local-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const mockStats: ResumeStats = {
  applications: 50,
  interviews: 5,
  offers: 2,
  rejections: 35,
  pending: 10
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

describe('ResumeTracker page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing resumes', async () => {
    vi.mocked(api.getResumes).mockResolvedValue([mockResume]);

    render(<ResumeTracker />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Resume V1')).toBeInTheDocument());
  });

  it('uploads a new resume', async () => {
    vi.mocked(api.getResumes).mockResolvedValue([]);
    vi.mocked(api.createResume).mockResolvedValue(mockResume);

    render(<ResumeTracker />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText('Label'), 'Resume V1');
    const file = new File(['pdf'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('Upload Resume') as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await userEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() =>
      expect(api.createResume).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Resume V1', filename: 'resume.pdf' })
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows the funnel chart for a selected resume', async () => {
    vi.mocked(api.getResumes).mockResolvedValue([mockResume]);
    vi.mocked(api.getResumeStats).mockResolvedValue(mockStats);

    render(<ResumeTracker />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Resume V1')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Resume V1'));

    await waitFor(() => expect(api.getResumeStats).toHaveBeenCalledWith('r1'));
  });
});
