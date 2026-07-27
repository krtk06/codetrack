import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import * as api from '../features/admin/adminApi';

vi.mock('../features/admin/adminApi', () => ({
  getAdminUsers: vi.fn(),
  getAdminStats: vi.fn(),
  getAdminRecommendations: vi.fn(),
  getAdminUsage: vi.fn()
}));

const stats = {
  totalUsers: 42,
  activeUsers: 17,
  snapshotsToday: 5
};

const usage = {
  apiCalls: 1234,
  errors: 12
};

const users = [
  {
    id: 'u1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u2',
    email: 'alice@example.com',
    name: 'Alice',
    role: 'USER',
    createdAt: '2026-02-01T00:00:00.000Z'
  }
];

const recommendations = [
  {
    userId: 'u2',
    userEmail: 'alice@example.com',
    weakTopics: ['Trees', 'Graphs'],
    dailyPlanCount: 3,
    generatedAt: '2026-02-15T00:00:00.000Z'
  }
];

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

describe('AdminDashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats, users, recommendations, and usage', async () => {
    vi.mocked(api.getAdminStats).mockResolvedValue(stats);
    vi.mocked(api.getAdminUsage).mockResolvedValue(usage);
    vi.mocked(api.getAdminUsers).mockResolvedValue(users);
    vi.mocked(api.getAdminRecommendations).mockResolvedValue(recommendations);

    render(<AdminDashboard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getAllByText('alice@example.com').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('Trees, Graphs') ?? false).length
    ).toBeGreaterThan(0);
  });

  it('shows an error state when stats fail to load', async () => {
    vi.mocked(api.getAdminStats).mockRejectedValue(new Error('boom'));
    vi.mocked(api.getAdminUsage).mockResolvedValue(usage);
    vi.mocked(api.getAdminUsers).mockResolvedValue([]);
    vi.mocked(api.getAdminRecommendations).mockResolvedValue([]);

    render(<AdminDashboard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load admin data/i)).toBeInTheDocument());
  });
});
