import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface RatingTrendChartProps {
  data: number[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function RatingTrendChart({
  data,
  isLoading = false,
  error = null
}: RatingTrendChartProps) {
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
        Failed to load rating trend.
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Rating Trend</h3>
        <div className="flex h-64 items-center justify-center text-sm text-[var(--muted-foreground)]">
          No rating data yet.
        </div>
      </div>
    );
  }

  const chartData = data.map((value, index) => ({
    index: index + 1,
    label: `#${index + 1}`,
    rating: value
  }));

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Rating Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="index"
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              domain={['dataMin - 50', 'dataMax + 50']}
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
              dataKey="rating"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
