import { useUpcomingInterviews } from '../../features/interviews/useInterviews';

export default function UpcomingInterviews() {
  const { data, isLoading, error } = useUpcomingInterviews();
  const interviews = data ?? [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Upcoming Interviews</h2>
        <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load upcoming interviews.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Upcoming Interviews</h2>
      {interviews.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No upcoming interviews scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {interviews.map((interview) => (
            <li
              key={interview.id}
              className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">{interview.company}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {interview.round} • {new Date(interview.date).toLocaleDateString()} • {interview.time}
                </p>
              </div>
              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--primary)] underline"
                >
                  Join
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
