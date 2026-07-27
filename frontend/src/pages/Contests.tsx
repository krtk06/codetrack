import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  useContests,
  useCreateContest,
  useImportCodeforces,
  useImportCodechefCsv
} from '../features/contests/useContests';
import type { CreateContestInput, Platform } from '../features/contests/contestsTypes';

const PLATFORMS: Platform[] = ['LEETCODE', 'CODEFORCES', 'CODECHEF'];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Contests() {
  const { data, isLoading, error } = useContests();
  const createContest = useCreateContest();
  const importCf = useImportCodeforces();
  const importCsv = useImportCodechefCsv();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateContestInput>({
    platform: 'LEETCODE',
    contestName: '',
    date: todayIsoDate(),
    rank: 0,
    solved: 0
  });

  const [cfHandle, setCfHandle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContest.mutateAsync({ ...form, date: new Date(form.date).toISOString() });
      toast.success('Contest added');
      setForm({
        platform: form.platform,
        contestName: '',
        date: todayIsoDate(),
        rank: 0,
        solved: 0
      });
    } catch (err) {
      toast.error('Failed to add contest');
    }
  };

  const handleCfImport = async () => {
    if (!cfHandle) {
      toast.error('Enter a Codeforces handle');
      return;
    }
    try {
      const contests = await importCf.mutateAsync(cfHandle);
      toast.success(`Imported ${contests.length} contests`);
      setCfHandle('');
    } catch {
      toast.error('Failed to import Codeforces contests');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const contests = await importCsv.mutateAsync(text);
      toast.success(`Imported ${contests.length} contests`);
    } catch {
      toast.error('Failed to import CSV');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load contests.
      </div>
    );
  }

  const contests = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Contests</h1>
        <p className="text-[var(--muted-foreground)]">Track your contest performance across platforms.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Add Contest</h2>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-[var(--muted-foreground)]">Platform</span>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted-foreground)]">Contest name</span>
              <input
                value={form.contestName}
                onChange={(e) => setForm({ ...form, contestName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted-foreground)]">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">Rank</span>
                <input
                  type="number"
                  min={0}
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">Solved</span>
                <input
                  type="number"
                  min={0}
                  value={form.solved}
                  onChange={(e) => setForm({ ...form, solved: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">Rating before</span>
                <input
                  type="number"
                  value={form.ratingBefore ?? ''}
                  onChange={(e) => setForm({ ...form, ratingBefore: e.target.value === '' ? null : Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--muted-foreground)]">Rating after</span>
                <input
                  type="number"
                  value={form.ratingAfter ?? ''}
                  onChange={(e) => setForm({ ...form, ratingAfter: e.target.value === '' ? null : Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={createContest.isPending}
              className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {createContest.isPending ? 'Saving...' : 'Add Contest'}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Import from Codeforces</h2>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Handle</span>
            <input
              value={cfHandle}
              onChange={(e) => setCfHandle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
              placeholder="tourist"
            />
          </label>
          <button
            onClick={handleCfImport}
            disabled={importCf.isPending}
            className="mt-3 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {importCf.isPending ? 'Importing...' : 'Import'}
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Upload CodeChef CSV</h2>
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">
            Columns: contestName, date, rank, solved, ratingBefore, ratingAfter
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvUpload}
            aria-label="Upload CodeChef CSV"
            className="block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-[var(--primary-foreground)]"
          />
          {importCsv.isPending && (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Uploading...</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recent Contests</h2>
        {isLoading ? (
          <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : contests.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No contests yet. Add one or import to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3">Platform</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Rank</th>
                  <th className="py-2 pr-3 text-right">Solved</th>
                  <th className="py-2 pr-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((contest) => (
                  <tr key={contest.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3">{contest.platform}</td>
                    <td className="py-2 pr-3 font-medium text-[var(--foreground)]">{contest.contestName}</td>
                    <td className="py-2 pr-3">{new Date(contest.date).toLocaleDateString()}</td>
                    <td className="py-2 pr-3 text-right">{contest.rank}</td>
                    <td className="py-2 pr-3 text-right">{contest.solved}</td>
                    <td className="py-2 pr-3 text-right">
                      {contest.ratingBefore ?? '-'} → {contest.ratingAfter ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
