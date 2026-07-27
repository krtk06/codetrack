import RatingTrendChart from '../components/charts/RatingTrendChart';
import { useContestAnalysis } from '../features/contests/useContests';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="text-3xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}

export default function ContestAnalysis() {
  const { data, isLoading, error } = useContestAnalysis();

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load contest analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Contest Analysis</h1>
        <p className="text-[var(--muted-foreground)]">Your performance trends across platforms.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Best Rank" value={data?.bestRank ?? '-'} />
        <Stat label="Worst Rank" value={data?.worstRank ?? '-'} />
        <Stat label="Average Rank" value={data?.averageRank ?? '-'} />
        <Stat
          label="Rating Growth"
          value={data ? (data.ratingGrowth >= 0 ? `+${data.ratingGrowth}` : `${data.ratingGrowth}`) : '-'}
        />
        <Stat
          label="Participation / Month"
          value={data?.participationFrequency ?? '-'}
        />
      </div>

      <RatingTrendChart data={data?.ratingTrend ?? []} isLoading={isLoading} />
    </div>
  );
}
