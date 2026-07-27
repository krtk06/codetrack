import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StrongTopicsList from './StrongTopicsList';

const topics = [
  { topicId: '1', name: 'Arrays', solved: 20, attempted: 25, successRate: 80 },
  { topicId: '2', name: 'Strings', solved: 15, attempted: 20, successRate: 75 },
  { topicId: '3', name: 'DP', solved: 2, attempted: 10, successRate: 20 },
  { topicId: '4', name: 'Trie', solved: 0, attempted: 0, successRate: 0 }
];

describe('StrongTopicsList', () => {
  it('shows topics with success rate >= 70', () => {
    render(<StrongTopicsList topics={topics} />);
    expect(screen.getByText('Arrays')).toBeInTheDocument();
    expect(screen.getByText('Strings')).toBeInTheDocument();
    expect(screen.queryByText('DP')).not.toBeInTheDocument();
  });

  it('shows empty state when no topics qualify', () => {
    render(<StrongTopicsList topics={[]} />);
    expect(screen.getByText(/Solve more problems to see your strengths/i)).toBeInTheDocument();
  });
});
