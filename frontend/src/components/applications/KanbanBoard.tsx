import { useState } from 'react';
import type { Application, ApplicationStatus } from '../../features/applications/applicationsTypes';
import { APPLICATION_STATUSES } from '../../features/applications/applicationsTypes';

interface KanbanBoardProps {
  applications: Application[];
  onMove: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-blue-100 dark:bg-blue-900/30',
  OA: 'bg-amber-100 dark:bg-amber-900/30',
  INTERVIEW: 'bg-violet-100 dark:bg-violet-900/30',
  REJECTED: 'bg-rose-100 dark:bg-rose-900/30',
  SELECTED: 'bg-emerald-100 dark:bg-emerald-900/30'
};

export default function KanbanBoard({
  applications,
  onMove,
  onDelete,
  isLoading = false,
  error = null
}: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="h-64 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load applications.
      </div>
    );
  }

  const grouped = APPLICATION_STATUSES.reduce<Record<ApplicationStatus, Application[]>>(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status);
      return acc;
    },
    {
      APPLIED: [],
      OA: [],
      INTERVIEW: [],
      REJECTED: [],
      SELECTED: []
    }
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (status: ApplicationStatus) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedId) {
      onMove(draggedId, status);
      setDraggedId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {APPLICATION_STATUSES.map((status) => (
        <div
          key={status}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
          onDragOver={handleDragOver}
          onDrop={handleDrop(status)}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{status}</h3>
            <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
              {grouped[status].length}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[status].map((application) => {
              const currentIndex = APPLICATION_STATUSES.indexOf(application.status);
              return (
                <div
                  key={application.id}
                  draggable
                  onDragStart={() => setDraggedId(application.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={`rounded-lg border border-[var(--border)] p-3 text-sm shadow-sm ${STATUS_COLORS[application.status]}`}
                >
                  <p className="font-semibold text-[var(--foreground)]">{application.company}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{application.role}</p>
                  {application.location && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{application.location}</p>
                  )}
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Applied {new Date(application.appliedDate).toLocaleDateString()}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => onMove(application.id, APPLICATION_STATUSES[Math.max(0, currentIndex - 1)])}
                      disabled={currentIndex === 0}
                      className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs disabled:opacity-50"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        onMove(
                          application.id,
                          APPLICATION_STATUSES[Math.min(APPLICATION_STATUSES.length - 1, currentIndex + 1)]
                        )
                      }
                      disabled={currentIndex === APPLICATION_STATUSES.length - 1}
                      className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs disabled:opacity-50"
                    >
                      →
                    </button>
                    <button
                      onClick={() => onDelete(application.id)}
                      className="ml-auto rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {grouped[status].length === 0 && (
              <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-center text-xs text-[var(--muted-foreground)]">
                No applications
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
