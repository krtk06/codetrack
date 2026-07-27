import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalendarHeatmap from './CalendarHeatmap';
import type { HeatmapDay } from '../../features/heatmap/heatmapTypes';

const days: HeatmapDay[] = [
  { date: '2026-01-01', count: 1, level: 1 },
  { date: '2026-01-02', count: 3, level: 2 },
  { date: '2026-01-03', count: 7, level: 4 },
  { date: '2026-01-04', count: 0, level: 0 }
];

describe('CalendarHeatmap', () => {
  it('renders one cell per day with proper tooltips', () => {
    const { container } = render(<CalendarHeatmap days={days} />);
    const cells = container.querySelectorAll('[aria-label]');
    expect(cells).toHaveLength(days.length);
    expect(screen.getByLabelText('2026-01-01: 1 problems')).toBeInTheDocument();
    expect(screen.getByLabelText('2026-01-03: 7 problems')).toBeInTheDocument();
  });

  it('renders a legend with level swatches', () => {
    render(<CalendarHeatmap days={days} />);
    expect(screen.getByText(/Less/i)).toBeInTheDocument();
    expect(screen.getByText(/More/i)).toBeInTheDocument();
  });

  it('shows a loading skeleton', () => {
    const { container } = render(<CalendarHeatmap days={[]} isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows an error state', () => {
    render(<CalendarHeatmap days={[]} error={new Error('boom')} />);
    expect(screen.getByText(/Failed to load heatmap/i)).toBeInTheDocument();
  });

  it('shows empty state when no days', () => {
    render(<CalendarHeatmap days={[]} />);
    expect(screen.getByText(/No activity yet/i)).toBeInTheDocument();
  });
});
