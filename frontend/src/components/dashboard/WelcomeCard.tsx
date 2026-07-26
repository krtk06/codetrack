interface WelcomeCardProps {
  name: string;
  goal: string;
  progress: string;
  isLoading?: boolean;
}

export default function WelcomeCard({ name, goal, progress, isLoading = false }: WelcomeCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--muted)]" />
        <div className="mt-4 h-3 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Welcome back, {name}
      </h1>
      <p className="mt-1 text-[var(--muted-foreground)]">
        {goal} — <span className="font-medium text-[var(--foreground)]">{progress}</span>
      </p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          role="progressbar"
          aria-valuenow={progressValue(progress)}
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: progressPercent(progress) }}
        />
      </div>
    </div>
  );
}

function parseProgress(progress: string): { current: number; total: number } {
  const match = progress.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (!match) return { current: 0, total: 0 };
  return { current: parseInt(match[1], 10), total: parseInt(match[2], 10) };
}

function progressPercent(progress: string): string {
  const { current, total } = parseProgress(progress);
  if (!total) return '0%';
  const percent = Math.min(100, Math.max(0, (current / total) * 100));
  return `${percent}%`;
}

function progressValue(progress: string): number {
  const { current, total } = parseProgress(progress);
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}
