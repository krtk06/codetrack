import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useLeetCodeStats } from './useLeetCodeStats';

interface LeetCodeStatsCardProps {
  username: string | undefined;
}

export default function LeetCodeStatsCard({ username }: LeetCodeStatsCardProps) {
  const { stats, isLoading, isError, sync, isSyncing } = useLeetCodeStats(username);

  if (!username) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted-foreground)]">
        Add your LeetCode username in Settings to see live stats.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--muted)]" />
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        <p>Could not load LeetCode stats for {username}.</p>
        <button
          type="button"
          onClick={() => sync(username)}
          disabled={isSyncing}
          className="mt-4 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>
    );
  }

  const items = [
    { label: 'Solved', value: stats.totalSolved },
    { label: 'Easy', value: stats.easySolved },
    { label: 'Medium', value: stats.mediumSolved },
    { label: 'Hard', value: stats.hardSolved }
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">LeetCode Stats</h2>
        <button
          type="button"
          onClick={() => sync(username)}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {stats.isStale && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <AlertTriangle size={16} />
          Data is older than 48 hours. Click sync to refresh.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-[var(--muted)] p-4 text-center">
            <div className="text-2xl font-semibold text-[var(--foreground)]">{value}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-[var(--muted-foreground)] md:grid-cols-3">
        <div>Acceptance: {(stats.acceptanceRate * 100).toFixed(1)}%</div>
        <div>Contest Rating: {stats.contestRating ?? '—'}</div>
        <div>Global Ranking: {stats.globalRanking ?? '—'}</div>
      </div>
    </div>
  );
}
