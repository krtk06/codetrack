import CalendarHeatmap from '../components/heatmap/CalendarHeatmap';
import { useHeatmap } from '../features/heatmap/useHeatmap';

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="text-3xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}

export default function Heatmap() {
  const year = new Date().getFullYear();
  const { data, isLoading, error } = useHeatmap(year);

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load heatmap.
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Coding Heatmap</h1>
        <p className="text-[var(--muted-foreground)]">Your daily coding activity for {year}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat
          label="Consistency"
          value={summary ? `${summary.consistency}%` : '-'}
        />
        <SummaryStat
          label="Active Days"
          value={summary?.activeDays ?? '-'}
        />
        <SummaryStat
          label="Missed Days"
          value={summary?.missedDays ?? '-'}
        />
        <SummaryStat
          label="Longest Streak"
          value={summary?.longestStreak ?? '-'}
        />
      </div>

      <CalendarHeatmap days={data?.days ?? []} isLoading={isLoading} />
    </div>
  );
}
