import TrendChart from '../components/charts/TrendChart';
import TodaysPlanCard from '../components/recommendations/TodaysPlanCard';
import { useAnalyticsSummary } from '../features/analytics/useAnalyticsSummary';
import { useGrowth } from '../features/analytics/useGrowth';

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="text-3xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useAnalyticsSummary();
  const weekly = useGrowth('weekly');
  const monthly = useGrowth('monthly');
  const yearly = useGrowth('yearly');

  if (summaryError) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load analytics summary.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Analytics</h1>
        <p className="text-[var(--muted-foreground)]">Track your coding progress and consistency.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Daily Growth"
          value={summaryLoading ? '-' : summary?.dailyGrowth ?? 0}
        />
        <SummaryCard
          label="Weekly Growth"
          value={summaryLoading ? '-' : summary?.weeklyGrowth ?? 0}
        />
        <SummaryCard
          label="Monthly Growth"
          value={summaryLoading ? '-' : summary?.monthlyGrowth ?? 0}
        />
        <SummaryCard
          label="Problems / Day"
          value={summaryLoading ? '-' : summary?.problemsPerDay ?? 0}
        />
        <SummaryCard
          label="Success Rate"
          value={summaryLoading ? '-' : `${summary?.successRate ?? 0}%`}
        />
        <SummaryCard
          label="Consistency"
          value={summaryLoading ? '-' : `${summary?.codingConsistency ?? 0}%`}
        />
        <SummaryCard
          label="Current Streak"
          value={summaryLoading ? '-' : summary?.streakAnalysis.current ?? 0}
        />
        <SummaryCard
          label="Longest Streak"
          value={summaryLoading ? '-' : summary?.streakAnalysis.longest ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart
            title="Weekly Trend"
            type="line"
            labels={weekly.data?.labels ?? []}
            data={weekly.data?.data ?? []}
            isLoading={weekly.isLoading}
            error={weekly.error ?? null}
          />
          <TrendChart
            title="Monthly Trend"
            type="bar"
            labels={monthly.data?.labels ?? []}
            data={monthly.data?.data ?? []}
            isLoading={monthly.isLoading}
            error={monthly.error ?? null}
          />
        </div>
        <TodaysPlanCard />
      </div>

      <TrendChart
        title="Yearly Trend"
        type="area"
        labels={yearly.data?.labels ?? []}
        data={yearly.data?.data ?? []}
        isLoading={yearly.isLoading}
        error={yearly.error ?? null}
      />
    </div>
  );
}
