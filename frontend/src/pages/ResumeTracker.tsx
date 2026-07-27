import { useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import {
  useCreateResume,
  useDeleteResume,
  useResumeStats,
  useResumes
} from '../features/resumes/useResumes';

const FUNNEL_COLORS: Record<string, string> = {
  Applications: 'var(--primary)',
  Interviews: '#8b5cf6',
  Offers: '#10b981',
  Rejections: '#f43f5e',
  Pending: '#f59e0b'
};

export default function ResumeTracker() {
  const { data, isLoading, error } = useResumes();
  const create = useCreateResume();
  const remove = useDeleteResume();

  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useResumeStats(selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a file');
      return;
    }
    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] ?? '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const resume = await create.mutateAsync({
        label: label || file.name,
        fileBase64,
        filename: file.name
      });
      toast.success('Resume uploaded');
      setLabel('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedId(resume.id);
    } catch {
      toast.error('Failed to upload resume');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Resume removed');
      if (selectedId === id) setSelectedId(null);
    } catch {
      toast.error('Failed to remove resume');
    }
  };

  const funnelData = stats.data
    ? [
        { stage: 'Applications', count: stats.data.applications },
        { stage: 'Pending', count: stats.data.pending },
        { stage: 'Interviews', count: stats.data.interviews },
        { stage: 'Offers', count: stats.data.offers },
        { stage: 'Rejections', count: stats.data.rejections }
      ]
    : [];

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load resumes.
      </div>
    );
  }

  const resumes = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Resumes</h1>
        <p className="text-[var(--muted-foreground)]">Track resume versions and their conversion funnel.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Upload Resume</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">Label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Resume V1"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-foreground)]">File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              aria-label="Upload Resume"
              className="mt-1 w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-[var(--primary-foreground)]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] disabled:opacity-50 md:w-auto"
        >
          {create.isPending ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Resume Versions</h2>
          {isLoading ? (
            <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
          ) : resumes.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No resumes yet.</p>
          ) : (
            <ul className="space-y-2">
              {resumes.map((resume) => (
                <li
                  key={resume.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    selectedId === resume.id
                      ? 'border-[var(--primary)] bg-[var(--muted)]'
                      : 'border-[var(--border)] bg-[var(--background)]'
                  }`}
                >
                  <button onClick={() => setSelectedId(resume.id)} className="text-left">
                    <p className="font-medium text-[var(--foreground)]">{resume.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--primary)] underline"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Funnel</h2>
          {!selectedId ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Select a resume to view its funnel.
            </p>
          ) : stats.isLoading ? (
            <div className="h-64 w-full animate-pulse rounded bg-[var(--muted)]" />
          ) : stats.error ? (
            <p className="text-sm text-[var(--destructive)]">Failed to load stats.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 8, right: 16, bottom: 8, left: 24 }}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" stroke="var(--muted-foreground)" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry) => (
                      <Bar key={entry.stage} dataKey="count" fill={FUNNEL_COLORS[entry.stage] ?? 'var(--primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
