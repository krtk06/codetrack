import { toast } from 'react-toastify';
import MockInterviewForm from '../components/interviews/MockInterviewForm';
import MockInterviewTrendChart from '../components/interviews/MockInterviewTrendChart';
import {
  useDeleteMockInterview,
  useMockInterviewPerformance,
  useMockInterviews,
  useUpdateMockInterview
} from '../features/mock-interviews/useMockInterviews';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="text-3xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}

export default function MockInterviews() {
  const { data, isLoading, error } = useMockInterviews();
  const { data: perf, isLoading: perfLoading } = useMockInterviewPerformance();
  const remove = useDeleteMockInterview();
  const update = useUpdateMockInterview();

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Entry removed');
    } catch {
      toast.error('Failed to remove entry');
    }
  };

  const handleFeedback = async (id: string, feedback: string) => {
    try {
      await update.mutateAsync({ id, input: { feedback } });
      toast.success('Feedback updated');
    } catch {
      toast.error('Failed to update feedback');
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load mock interviews.
      </div>
    );
  }

  const mockInterviews = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Mock Interviews</h1>
        <p className="text-[var(--muted-foreground)]">Track your performance over time.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MockInterviewForm />

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Performance Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Total Interviews" value={perf?.totalInterviews ?? 0} />
            <Stat label="Average Score" value={`${perf?.averageScore ?? 0}%`} />
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">By Topic</h3>
            {perf?.topicBreakdown.length ? (
              <ul className="space-y-1 text-sm">
                {perf.topicBreakdown.map((topic) => (
                  <li
                    key={topic.topic}
                    className="flex items-center justify-between rounded-md bg-[var(--muted)] px-2 py-1"
                  >
                    <span className="font-medium text-[var(--foreground)]">{topic.topic}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {topic.averageScore}% ({topic.count})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No topic data yet.</p>
            )}
          </div>
        </div>
      </div>

      <MockInterviewTrendChart data={perf?.scoreTrend ?? []} isLoading={perfLoading} />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">All Mock Interviews</h2>
        {isLoading ? (
          <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : mockInterviews.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No mock interviews logged yet.</p>
        ) : (
          <div className="space-y-3">
            {mockInterviews.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{m.topic}</h3>
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium">
                      {m.score}/{m.scoreOutOf}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {new Date(m.date).toLocaleDateString()} • {m.interviewer}
                  </p>
                  <textarea
                    defaultValue={m.feedback ?? ''}
                    onBlur={(e) => {
                      if (e.target.value !== (m.feedback ?? '')) {
                        handleFeedback(m.id, e.target.value);
                      }
                    }}
                    rows={2}
                    placeholder="Add feedback"
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-sm"
                  />
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
