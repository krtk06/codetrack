import { useEffect, useState } from 'react';
import { useCompanyPrep, useSupportedCompanies } from '../features/companies/useCompanies';

export default function CompanyPrep() {
  const { data: companies, isLoading: companiesLoading, error: companiesError } = useSupportedCompanies();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected && companies && companies.length > 0) {
      setSelected(companies[0]);
    }
  }, [companies, selected]);

  const { data: prep, isLoading: prepLoading, error: prepError } = useCompanyPrep(selected);

  if (companiesError) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load companies.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Company Preparation</h1>
        <p className="text-[var(--muted-foreground)]">
          Choose a company to see frequent topics and a suggested roadmap.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {companiesLoading ? (
          <div className="h-9 w-48 animate-pulse rounded bg-[var(--muted)]" />
        ) : (
          (companies ?? []).map((company) => (
            <button
              key={company}
              onClick={() => setSelected(company)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                selected === company
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {company}
            </button>
          ))
        )}
      </div>

      {prepError && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
          Failed to load preparation data.
        </div>
      )}

      {prepLoading && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="h-40 w-full animate-pulse rounded bg-[var(--muted)]" />
        </div>
      )}

      {prep && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">{prep.company}</h2>
          {prep.weakTopicFocus.length > 0 && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
              <p className="font-medium">Focus on your weak topics for this company:</p>
              <p className="mt-1">{prep.weakTopicFocus.join(', ')}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Frequent Topics</h3>
            <div className="flex flex-wrap gap-2">
              {prep.frequentTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">Roadmap</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {prep.roadmap.map((phase) => (
              <div
                key={phase.phase}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <h4 className="font-semibold text-[var(--foreground)]">{phase.phase}</h4>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {phase.suggestedProblems} suggested problems
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-[var(--muted-foreground)]">
                  {phase.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
