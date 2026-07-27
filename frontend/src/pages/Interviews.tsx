import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useInterviews,
  useCreateInterview,
  useUpdateInterview,
  useDeleteInterview
} from '../features/interviews/useInterviews';
import type { Interview, InterviewStatus } from '../features/interviews/interviewsTypes';

const STATUS_OPTIONS: InterviewStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function statusColor(status: InterviewStatus): string {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
  }
}

export default function Interviews() {
  const { data, isLoading, error } = useInterviews();
  const create = useCreateInterview();
  const update = useUpdateInterview();
  const remove = useDeleteInterview();

  const [form, setForm] = useState({
    company: '',
    round: '',
    date: todayIsoDate(),
    time: '10:00',
    location: '',
    meetingLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        company: form.company,
        round: form.round,
        date: new Date(form.date).toISOString(),
        time: form.time,
        location: form.location || null,
        meetingLink: form.meetingLink || null
      });
      toast.success('Interview scheduled');
      setForm({
        company: '',
        round: '',
        date: todayIsoDate(),
        time: '10:00',
        location: '',
        meetingLink: ''
      });
    } catch {
      toast.error('Failed to schedule interview');
    }
  };

  const handleStatusChange = async (interview: Interview, status: InterviewStatus) => {
    try {
      await update.mutateAsync({ id: interview.id, input: { status } });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Interview removed');
    } catch {
      toast.error('Failed to remove interview');
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load interviews.
      </div>
    );
  }

  const interviews = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Interviews</h1>
        <p className="text-[var(--muted-foreground)]">Schedule and track your upcoming interviews.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Schedule Interview</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Company</span>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Round</span>
            <input
              value={form.round}
              onChange={(e) => setForm({ ...form, round: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Time</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Location</span>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Meeting link</span>
            <input
              type="url"
              value={form.meetingLink}
              onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
              placeholder="https://meet.example.com/abc"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50 md:w-auto"
        >
          {create.isPending ? 'Saving...' : 'Schedule Interview'}
        </button>
      </form>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">All Interviews</h2>
        {isLoading ? (
          <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : interviews.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No interviews scheduled.</p>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{interview.company}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {interview.round} • {new Date(interview.date).toLocaleDateString()} • {interview.time}
                  </p>
                  {interview.location && (
                    <p className="text-xs text-[var(--muted-foreground)]">{interview.location}</p>
                  )}
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--primary)] underline"
                    >
                      Meeting link
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={interview.status}
                    onChange={(e) => handleStatusChange(interview, e.target.value as InterviewStatus)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(interview.id)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
