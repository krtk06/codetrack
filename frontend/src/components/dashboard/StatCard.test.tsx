import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Problems Solved" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Problems Solved')).toBeInTheDocument();
  });

  it('renders dash for null value', () => {
    render(<StatCard label="Rating" value={null} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows skeletons when loading', () => {
    const { container } = render(<StatCard label="" value={null} isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
