import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Applications from './Applications';
import * as api from '../features/applications/applicationsApi';
import type { Application } from '../features/applications/applicationsTypes';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../features/applications/applicationsApi', () => ({
  getApplications: vi.fn(),
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn()
}));

const mockApplication: Application = {
  id: 'a1',
  company: 'Acme',
  role: 'SWE',
  location: 'Remote',
  appliedDate: '2026-01-15T00:00:00.000Z',
  status: 'APPLIED',
  notes: null,
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

describe('Applications page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a new application', async () => {
    vi.mocked(api.getApplications).mockResolvedValue([]);
    vi.mocked(api.createApplication).mockResolvedValue(mockApplication);

    render(<Applications />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText('Company'), 'Acme');
    await userEvent.type(screen.getByLabelText('Role'), 'SWE');
    await userEvent.click(screen.getByRole('button', { name: /add application/i }));

    await waitFor(() =>
      expect(api.createApplication).toHaveBeenCalledWith(
        expect.objectContaining({ company: 'Acme', role: 'SWE' })
      )
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('renders applications from the API', async () => {
    vi.mocked(api.getApplications).mockResolvedValue([mockApplication]);

    render(<Applications />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getByText('SWE')).toBeInTheDocument();
  });

  it('calls onDelete when delete is clicked', async () => {
    vi.mocked(api.getApplications).mockResolvedValue([mockApplication]);
    vi.mocked(api.deleteApplication).mockResolvedValue(undefined);

    render(<Applications />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(api.deleteApplication).toHaveBeenCalledWith('a1'));
    expect(toast.success).toHaveBeenCalled();
  });
});
