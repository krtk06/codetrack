import { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useRecommendations } from '../../features/recommendations/useRecommendations';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(): string {
  return `todays-plan:${todayKey()}`;
}

function readDone(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((entry): entry is string => typeof entry === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

function writeDone(done: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(), JSON.stringify(done));
}

export default function TodaysPlanCard() {
  const { data, isLoading, error } = useRecommendations();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(readDone());
  }, []);

  const toggle = (topic: string) => {
    setDone((prev) => {
      const next = prev.includes(topic)
        ? prev.filter((entry) => entry !== topic)
        : [...prev, topic];
      writeDone(next);
      return next;
    });
  };

  const reset = () => {
    setDone([]);
    writeDone([]);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Today's Plan</h2>
        <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load today's plan.
      </div>
    );
  }

  const plan = data?.dailyPlan ?? [];
  const completed = plan.filter((item) => done.includes(item.topic)).length;
  const total = plan.reduce((sum, item) => sum + item.count, 0);
  const completedCount = plan
    .filter((item) => done.includes(item.topic))
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Today's Plan</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {plan.length === 0
              ? 'No plan yet. Sync LeetCode stats to generate one.'
              : `${completed}/${plan.length} topics complete • ${completedCount}/${total} problems`}
          </p>
        </div>
        {plan.length > 0 && (
          <button
            onClick={reset}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
          >
            Reset
          </button>
        )}
      </div>
      {plan.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Once your recommendations are ready, your daily plan will appear here.
        </p>
      ) : (
        <ul className="space-y-2">
          {plan.map((item) => {
            const isDone = done.includes(item.topic);
            return (
              <li
                key={item.topic}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  isDone
                    ? 'bg-emerald-50 text-emerald-700 line-through dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'bg-[var(--muted)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(item.topic)}
                    aria-label={isDone ? `Mark ${item.topic} as not done` : `Mark ${item.topic} as done`}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <span className="font-medium text-[var(--foreground)]">
                    {item.count} {item.topic} {item.count === 1 ? 'Problem' : 'Problems'}
                  </span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {isDone ? 'Done' : 'Pending'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
