import { useRecommendations } from '../../features/recommendations/useRecommendations';

const PHASE_COLORS: Record<string, string> = {
  Focus: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  Reinforce: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Explore: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
};

export default function RecommendationsCard() {
  const { data, isLoading, error } = useRecommendations();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recommendations</h2>
        <div className="h-32 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load recommendations.
      </div>
    );
  }

  const recommendations = data;
  if (!recommendations) {
    return null;
  }

  const { dailyPlan, learningPath } = recommendations;
  const hasContent = dailyPlan.length > 0 || learningPath.length > 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recommendations</h2>
      {!hasContent ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Sync your LeetCode stats to see personalised recommendations.
        </p>
      ) : (
        <div className="space-y-4">
          {dailyPlan.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Today's Plan</h3>
              <ul className="space-y-1 text-sm">
                {dailyPlan.map((item) => (
                  <li
                    key={item.topic}
                    className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-1.5"
                  >
                    <span className="font-medium text-[var(--foreground)]">{item.topic}</span>
                    <span className="text-[var(--muted-foreground)]">{item.count} problems</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {learningPath.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Learning Path</h3>
              <div className="flex flex-wrap gap-2">
                {learningPath.map((phase) => (
                  <div
                    key={phase.phase}
                    className="flex-1 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PHASE_COLORS[phase.phase] ?? 'bg-[var(--muted)]'}`}
                    >
                      {phase.phase}
                    </span>
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      {phase.topics.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
