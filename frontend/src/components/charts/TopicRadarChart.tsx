import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import type { TopicPerformance } from '../../features/topics/topicsTypes';

interface TopicRadarChartProps {
  data: TopicPerformance[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function TopicRadarChart({
  data,
  isLoading = false,
  error = null
}: TopicRadarChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-80 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load topic data.
      </div>
    );
  }

  const hasData = data.some((topic) => topic.solved > 0);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Topic Strength</h3>
      {hasData ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="75%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'auto']}
                stroke="var(--border)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Radar
                name="Solved"
                dataKey="solved"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center text-sm text-[var(--muted-foreground)]">
          No topic data available yet.
        </div>
      )}
    </div>
  );
}
