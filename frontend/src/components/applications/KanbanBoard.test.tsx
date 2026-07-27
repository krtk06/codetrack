import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanBoard from './KanbanBoard';
import type { Application } from '../../features/applications/applicationsTypes';

const applications: Application[] = [
  {
    id: 'a1',
    company: 'Acme',
    role: 'SWE',
    location: 'Remote',
    appliedDate: '2026-01-15T00:00:00.000Z',
    status: 'APPLIED',
    notes: null,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z'
  }
];

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders columns with applications', () => {
    render(<KanbanBoard applications={applications} onMove={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('APPLIED')).toBeInTheDocument();
    expect(screen.getByText('OA')).toBeInTheDocument();
    expect(screen.getByText('INTERVIEW')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
    expect(screen.getByText('SELECTED')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    const { container } = render(
      <KanbanBoard applications={[]} onMove={vi.fn()} onDelete={vi.fn()} isLoading />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows error state', () => {
    render(
      <KanbanBoard
        applications={[]}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        error={new Error('boom')}
      />
    );
    expect(screen.getByText(/Failed to load applications/i)).toBeInTheDocument();
  });

  it('calls onMove when arrow button is clicked', async () => {
    const onMove = vi.fn();
    render(<KanbanBoard applications={applications} onMove={onMove} onDelete={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '→' }));
    expect(onMove).toHaveBeenCalledWith('a1', 'OA');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<KanbanBoard applications={applications} onMove={vi.fn()} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('a1');
  });
});
