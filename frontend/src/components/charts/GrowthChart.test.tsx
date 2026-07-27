import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GrowthChart from './GrowthChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 300, height: 300 }}>{children}</div>
    )
  };
});

describe('GrowthChart', () => {
  it('renders title and chart area', () => {
    const { container } = render(
      <GrowthChart
        title="Weekly Growth"
        labels={['Mon', 'Tue', 'Wed']}
        data={[10, 20, 30]}
      />
    );

    expect(screen.getByText('Weekly Growth')).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('shows an empty state when all values are zero', () => {
    render(
      <GrowthChart
        title="Monthly Growth"
        labels={['1', '2', '3']}
        data={[0, 0, 0]}
      />
    );

    expect(screen.getByText(/No data available yet/i)).toBeInTheDocument();
  });

  it('shows a loading skeleton', () => {
    const { container } = render(
      <GrowthChart title="Yearly Growth" labels={[]} data={[]} isLoading />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows an error state', () => {
    render(
      <GrowthChart
        title="Weekly Growth"
        labels={[]}
        data={[]}
        error={new Error('boom')}
      />
    );
    expect(screen.getByText(/Failed to load chart/i)).toBeInTheDocument();
  });
});
