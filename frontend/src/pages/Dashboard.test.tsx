import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import * as usersApi from '../features/users/usersApi';
import * as dashboardApi from '../features/dashboard/dashboardApi';

vi.mock('../features/leetcode/LeetCodeStatsCard', () => ({
  default: () => <div data-testid="leetcode-card">LeetCode Stats</div>
}));

vi.mock('../features/users/usersApi', () => ({
  getCurrentUser: vi.fn()
}));

vi.mock('../features/dashboard/dashboardApi', () => ({
  getDashboard: vi.fn()
}));

const mockUser = {
  id: 'u1',
  email: 'alice@example.com',
  name: 'Alice',
  role: 'USER',
  leetcodeUsername: 'alice_lc',
  isEmailVerified: true
};

const mockDashboard = {
  user: {
    name: 'Alice',
    goal: 'Solve 500 Problems',
    progress: '125 / 500'
  },
  stats: {
    totalProblemsSolved: 125,
    currentStreak: 5,
    longestStreak: 10,
    contestRating: 1500,
    monthlyGrowth: 12,
    applicationsSubmitted: 0
  }
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome card, stat cards, and leetcode card', async () => {
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({ user: mockUser as any });
    vi.mocked(dashboardApi.getDashboard).mockResolvedValue(mockDashboard);

    render(<Dashboard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Welcome back, Alice/i)).toBeInTheDocument());
    expect(screen.getByText('125')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByTestId('leetcode-card')).toBeInTheDocument();
  });

  it('shows an error state when dashboard fails to load', async () => {
    vi.mocked(usersApi.getCurrentUser).mockResolvedValue({ user: mockUser as any });
    vi.mocked(dashboardApi.getDashboard).mockRejectedValue(new Error('boom'));

    render(<Dashboard />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText(/Failed to load dashboard/i)).toBeInTheDocument());
  });
});
