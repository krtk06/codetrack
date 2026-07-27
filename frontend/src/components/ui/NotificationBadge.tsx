import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUpcomingInterviews } from '../../features/interviews/useInterviews';

export default function NotificationBadge() {
  const { data, isLoading, error } = useUpcomingInterviews();
  const [open, setOpen] = useState(false);
  const interviews = data ?? [];
  const count = interviews.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative rounded p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
      >
        <Bell size={20} />
        {!isLoading && !error && count > 0 && (
          <span
            data-testid="notification-count"
            className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--destructive)] px-1 text-[10px] font-semibold text-[var(--destructive-foreground)]"
          >
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Upcoming Interviews
          </p>
          {isLoading ? (
            <p className="text-[var(--muted-foreground)]">Loading…</p>
          ) : error ? (
            <p className="text-[var(--destructive)]">Failed to load.</p>
          ) : count === 0 ? (
            <p className="text-[var(--muted-foreground)]">No upcoming interviews.</p>
          ) : (
            <ul className="space-y-2">
              {interviews.map((interview) => (
                <li
                  key={interview.id}
                  className="rounded-md bg-[var(--muted)] px-2 py-1.5"
                >
                  <p className="font-medium text-[var(--foreground)]">{interview.company}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {interview.round} • {new Date(interview.date).toLocaleDateString()} • {interview.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/interviews"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-center text-xs font-medium hover:bg-[var(--muted)]"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
