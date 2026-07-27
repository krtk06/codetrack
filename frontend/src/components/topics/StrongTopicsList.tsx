import TopicList from './TopicList';
import type { TopicPerformance } from '../../features/topics/topicsTypes';

interface StrongTopicsListProps {
  topics: TopicPerformance[];
  isLoading?: boolean;
}

export default function StrongTopicsList({ topics, isLoading = false }: StrongTopicsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--muted)]" />
        <div className="mt-3 h-4 w-32 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  const strong = topics.filter((topic) => topic.successRate >= 70 && topic.attempted > 0);

  return (
    <TopicList
      title="Strong Topics"
      topics={strong}
      emptyText="Solve more problems to see your strengths."
      variant="strong"
    />
  );
}
