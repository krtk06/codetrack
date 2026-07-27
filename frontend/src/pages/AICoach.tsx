import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAnalyzeFailure } from '../features/ai-coach/useAiCoach';

export default function AICoach() {
  const [description, setDescription] = useState('');
  const analyze = useAnalyzeFailure();
  const result = analyze.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      toast.error('Please describe your failure (at least 5 characters)');
      return;
    }
    try {
      await analyze.mutateAsync(description);
      toast.success('Analysis ready');
    } catch {
      toast.error('Failed to generate analysis');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">AI Interview Coach</h1>
        <p className="text-[var(--muted-foreground)]">
          Describe a recent interview failure to get a personalised improvement plan.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Your Story</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="I failed my Amazon interview because I couldn't solve the tree problems and struggled with system design questions..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)]"
        />
        <button
          type="submit"
          disabled={analyze.isPending}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50 md:w-auto"
        >
          {analyze.isPending ? 'Analyzing...' : 'Get Analysis'}
        </button>
      </form>

      {analyze.error && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
          Failed to generate analysis. Please try again.
        </div>
      )}

      {result && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Your Analysis</h2>
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Weak Areas</h3>
            <ul className="flex flex-wrap gap-2">
              {result.weakAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-full bg-rose-100 px-3 py-0.5 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Recommended Plan</h3>
            <ul className="space-y-2">
              {result.recommendedPlan.map((item, index) => (
                <li
                  key={`${item.activity}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-[var(--foreground)]">{item.activity}</span>
                  {typeof item.count === 'number' && (
                    <span className="text-[var(--muted-foreground)]">{item.count} times</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
