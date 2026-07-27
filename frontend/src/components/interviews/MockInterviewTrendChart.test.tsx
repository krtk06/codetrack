import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MockInterviewTrendChart from './MockInterviewTrendChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 300, height: 300 }}>{children}</div>
    )
  };
});

describe('MockInterviewTrendChart', () => {
  it('renders title and chart when data is present', () => {
    const { container } = render(
      <MockInterviewTrendChart
        data={[
          { date: '2026-01-01', percentage: 70 },
          { date: '2026-01-02', percentage: 80 }
        ]}
      />
    );
    expect(screen.getByText('Mock Interview Performance')).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('shows an empty state when no data', () => {
    render(<MockInterviewTrendChart data={[]} />);
    expect(screen.getByText(/No mock interviews yet/i)).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    const { container } = render(<MockInterviewTrendChart data={[]} isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows error state', () => {
    render(<MockInterviewTrendChart data={[]} error={new Error('boom')} />);
    expect(screen.getByText(/Failed to load mock interview trend/i)).toBeInTheDocument();
  });
});
