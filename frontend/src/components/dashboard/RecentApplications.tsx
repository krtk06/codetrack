import { useApplications } from '../../features/applications/useApplications';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  OA: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  INTERVIEW: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  SELECTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
};

export default function RecentApplications() {
  const { data, isLoading, error } = useApplications();
  const applications = (data ?? []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recent Applications</h2>
        <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load recent applications.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recent Applications</h2>
      {applications.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No applications yet. Add one to get started.</p>
      ) : (
        <ul className="space-y-2">
          {applications.map((application) => (
            <li
              key={application.id}
              className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">{application.company}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {application.role} • {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[application.status] ?? 'bg-[var(--muted)]'}`}
              >
                {application.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
