import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopicRadarChart from './TopicRadarChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 300, height: 300 }}>{children}</div>
    )
  };
});

const data = [
  { topicId: '1', name: 'Arrays', solved: 17, attempted: 25, successRate: 68 },
  { topicId: '2', name: 'DP', solved: 10, attempted: 15, successRate: 66 }
];

describe('TopicRadarChart', () => {
  it('renders title and chart when data is present', () => {
    const { container } = render(<TopicRadarChart data={data} />);
    expect(screen.getByText('Topic Strength')).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });

  it('shows an empty state when no topics have solved problems', () => {
    const empty = [{ topicId: '1', name: 'Arrays', solved: 0, attempted: 0, successRate: 0 }];
    render(<TopicRadarChart data={empty} />);
    expect(screen.getByText(/No topic data available yet/i)).toBeInTheDocument();
  });

  it('shows a loading skeleton', () => {
    const { container } = render(<TopicRadarChart data={[]} isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows an error state', () => {
    render(<TopicRadarChart data={[]} error={new Error('boom')} />);
    expect(screen.getByText(/Failed to load topic data/i)).toBeInTheDocument();
  });
});
