import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeCard from './WelcomeCard';

describe('WelcomeCard', () => {
  it('renders name, goal, and progress', () => {
    render(<WelcomeCard name="Alice" goal="Solve 500 Problems" progress="125 / 500" />);
    expect(screen.getByText(/Welcome back, Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/Solve 500 Problems/i)).toBeInTheDocument();
    expect(screen.getByText(/125 \/ 500/i)).toBeInTheDocument();
  });

  it('shows a progress bar reflecting the percentage', () => {
    render(<WelcomeCard name="Alice" goal="Solve 100" progress="25 / 100" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ width: '25%' });
  });

  it('shows skeletons when loading', () => {
    const { container } = render(<WelcomeCard name="" goal="" progress="" isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
