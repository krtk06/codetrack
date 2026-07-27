import { useState } from 'react';
import { toast } from 'react-toastify';
import KanbanBoard from '../components/applications/KanbanBoard';
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  useUpdateApplication
} from '../features/applications/useApplications';
import type {
  ApplicationStatus,
  CreateApplicationInput
} from '../features/applications/applicationsTypes';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Applications() {
  const { data, isLoading, error } = useApplications();
  const create = useCreateApplication();
  const update = useUpdateApplication();
  const remove = useDeleteApplication();

  const [form, setForm] = useState<CreateApplicationInput>({
    company: '',
    role: '',
    location: '',
    appliedDate: todayIsoDate(),
    status: 'APPLIED',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        ...form,
        appliedDate: new Date(form.appliedDate).toISOString(),
        location: form.location || null,
        notes: form.notes || null
      });
      toast.success('Application added');
      setForm({
        company: '',
        role: '',
        location: '',
        appliedDate: todayIsoDate(),
        status: 'APPLIED',
        notes: ''
      });
    } catch {
      toast.error('Failed to add application');
    }
  };

  const handleMove = async (id: string, status: ApplicationStatus) => {
    try {
      await update.mutateAsync({ id, input: { status } });
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Application removed');
    } catch {
      toast.error('Failed to remove application');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Applications</h1>
        <p className="text-[var(--muted-foreground)]">Track your job applications across the pipeline.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Add Application</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
            <span className="text-[var(--muted-foreground)]">Role</span>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Location</span>
            <input
              value={form.location ?? ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Applied Date</span>
            <input
              type="date"
              value={form.appliedDate}
              onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            >
              <option value="APPLIED">APPLIED</option>
              <option value="OA">OA</option>
              <option value="INTERVIEW">INTERVIEW</option>
              <option value="REJECTED">REJECTED</option>
              <option value="SELECTED">SELECTED</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Notes</span>
            <input
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50 md:w-auto"
        >
          {create.isPending ? 'Saving...' : 'Add Application'}
        </button>
      </form>

      <KanbanBoard
        applications={data ?? []}
        onMove={handleMove}
        onDelete={handleDelete}
        isLoading={isLoading}
        error={error ?? null}
      />
    </div>
  );
}
