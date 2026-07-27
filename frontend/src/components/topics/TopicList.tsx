import type { TopicPerformance } from '../../features/topics/topicsTypes';

interface TopicListProps {
  title: string;
  topics: TopicPerformance[];
  emptyText: string;
  variant: 'strong' | 'improvement';
}

export default function TopicList({ title, topics, emptyText, variant }: TopicListProps) {
  const accent =
    variant === 'strong'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {topics.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li
              key={topic.topicId}
              className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2 text-sm"
            >
              <span className="font-medium text-[var(--foreground)]">{topic.name}</span>
              <span className={`font-semibold ${accent}`}>{topic.successRate}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
