import TopicList from './TopicList';
import type { TopicPerformance } from '../../features/topics/topicsTypes';

interface NeedImprovementListProps {
  topics: TopicPerformance[];
  isLoading?: boolean;
}

export default function NeedImprovementList({ topics, isLoading = false }: NeedImprovementListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--muted)]" />
        <div className="mt-3 h-4 w-32 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  const needsImprovement = topics.filter((topic) => topic.successRate < 50 && topic.attempted > 0);

  return (
    <TopicList
      title="Needs Improvement"
      topics={needsImprovement}
      emptyText="No weak topics detected. Keep it up!"
      variant="improvement"
    />
  );
}
