interface StatCardProps {
  label: string;
  value: string | number | null;
  isLoading?: boolean;
}

export default function StatCard({ label, value, isLoading = false }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="h-8 w-16 animate-pulse rounded bg-[var(--muted)]" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="text-3xl font-semibold text-[var(--foreground)]">
        {value ?? '-'}
      </div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
