import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NeedImprovementList from './NeedImprovementList';

const topics = [
  { topicId: '1', name: 'Arrays', solved: 20, attempted: 25, successRate: 80 },
  { topicId: '2', name: 'DP', solved: 2, attempted: 10, successRate: 20 },
  { topicId: '3', name: 'Graphs', solved: 3, attempted: 10, successRate: 30 },
  { topicId: '4', name: 'Trie', solved: 0, attempted: 0, successRate: 0 }
];

describe('NeedImprovementList', () => {
  it('shows topics with success rate < 50', () => {
    render(<NeedImprovementList topics={topics} />);
    expect(screen.getByText('DP')).toBeInTheDocument();
    expect(screen.getByText('Graphs')).toBeInTheDocument();
    expect(screen.queryByText('Arrays')).not.toBeInTheDocument();
  });

  it('shows empty state when no topics qualify', () => {
    render(<NeedImprovementList topics={[]} />);
    expect(screen.getByText(/No weak topics detected/i)).toBeInTheDocument();
  });
});
