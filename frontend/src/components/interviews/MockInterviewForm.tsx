import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateMockInterview } from '../../features/mock-interviews/useMockInterviews';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MockInterviewForm() {
  const create = useCreateMockInterview();

  const [form, setForm] = useState({
    date: todayIsoDate(),
    interviewer: '',
    topic: '',
    score: 7,
    scoreOutOf: 10,
    feedback: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        date: new Date(form.date).toISOString(),
        interviewer: form.interviewer,
        topic: form.topic,
        score: form.score,
        scoreOutOf: form.scoreOutOf,
        feedback: form.feedback || null
      });
      toast.success('Mock interview logged');
      setForm({
        date: todayIsoDate(),
        interviewer: '',
        topic: '',
        score: 7,
        scoreOutOf: 10,
        feedback: ''
      });
    } catch {
      toast.error('Failed to log mock interview');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Log Mock Interview</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          <span className="text-[var(--muted-foreground)]">Interviewer</span>
          <input
            value={form.interviewer}
            onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted-foreground)]">Topic</span>
          <input
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            required
            placeholder="DSA"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Score</span>
            <input
              type="number"
              min={0}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Out of</span>
            <input
              type="number"
              min={1}
              value={form.scoreOutOf}
              onChange={(e) => setForm({ ...form, scoreOutOf: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
        </div>
        <label className="block text-sm md:col-span-2">
          <span className="text-[var(--muted-foreground)]">Feedback</span>
          <textarea
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            rows={3}
            placeholder="Need graph practice"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={create.isPending}
        className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50 md:w-auto"
      >
        {create.isPending ? 'Saving...' : 'Log Interview'}
      </button>
    </form>
  );
}
