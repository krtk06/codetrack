import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface GrowthChartProps {
  title: string;
  labels: string[];
  data: number[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function GrowthChart({
  title,
  labels,
  data,
  isLoading = false,
  error = null
}: GrowthChartProps) {
  const chartData = labels.map((label, index) => ({
    label,
    value: data[index] ?? 0
  }));

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-64 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        {title}: Failed to load chart.
      </div>
    );
  }

  const allZero = data.length === 0 || data.every((v) => v === 0);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {allZero ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--muted-foreground)]">
          No data available yet.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
