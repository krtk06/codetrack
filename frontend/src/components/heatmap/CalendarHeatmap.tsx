import type { HeatmapDay } from '../../features/heatmap/heatmapTypes';

interface CalendarHeatmapProps {
  days: HeatmapDay[];
  isLoading?: boolean;
  error?: Error | null;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-[var(--muted)]',
  1: 'bg-emerald-200 dark:bg-emerald-900/60',
  2: 'bg-emerald-400 dark:bg-emerald-700',
  3: 'bg-emerald-500 dark:bg-emerald-500',
  4: 'bg-emerald-700 dark:bg-emerald-400'
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['Mon', 'Wed', 'Fri'];

export default function CalendarHeatmap({ days, isLoading = false, error = null }: CalendarHeatmapProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="h-64 w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)] shadow-sm">
        Failed to load heatmap.
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted-foreground)] shadow-sm">
        No activity yet.
      </div>
    );
  }

  // Group days by month (1-based). Determine the weekday of the first day.
  const firstDate = new Date(days[0].date);
  const startWeekday = (firstDate.getDay() + 6) % 7; // Monday=0

  const cells: Array<{ day: HeatmapDay | null; monthIndex: number }> = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: null, monthIndex: -1 });
  }

  let currentMonth = -1;
  for (const day of days) {
    const monthIndex = new Date(day.date).getMonth();
    if (monthIndex !== currentMonth) {
      currentMonth = monthIndex;
    }
    cells.push({ day, monthIndex });
  }

  const columns: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  const monthMarkers: Array<{ column: number; label: string }> = [];
  let lastMonthSeen = -1;
  columns.forEach((column, columnIndex) => {
    const monthInColumn = column.find((cell) => cell.monthIndex !== -1)?.monthIndex ?? -1;
    if (monthInColumn !== -1 && monthInColumn !== lastMonthSeen) {
      monthMarkers.push({ column: columnIndex, label: MONTH_LABELS[monthInColumn] });
      lastMonthSeen = monthInColumn;
    }
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-2">
          <div className="ml-8 flex text-xs text-[var(--muted-foreground)]">
            {monthMarkers.map((marker) => (
              <span
                key={`${marker.column}-${marker.label}`}
                style={{ width: `${(marker.column - (monthMarkers[monthMarkers.indexOf(marker) - 1]?.column ?? 0)) * 14}px`, marginLeft: 0 }}
                className="absolute"
              />
            ))}
            <div className="flex">
              {monthMarkers.map((marker) => (
                <span
                  key={`${marker.column}-${marker.label}`}
                  style={{ marginLeft: marker.column === 0 ? 0 : '24px' }}
                >
                  {marker.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-2 text-xs text-[var(--muted-foreground)]">
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={label}
                  className="h-3"
                  style={{ visibility: index % 2 === 0 ? 'visible' : 'hidden' }}
                >
                  {label}
                </span>
              ))}
            </div>

            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const cell = column[dayIndex];
                  if (!cell || !cell.day) {
                    return <span key={dayIndex} className="h-3 w-3" />;
                  }
                  const { day } = cell;
                  return (
                    <span
                      key={day.date}
                      className={`h-3 w-3 rounded-sm ${LEVEL_CLASSES[day.level] ?? LEVEL_CLASSES[0]}`}
                      title={`${day.date}: ${day.count} problems`}
                      aria-label={`${day.date}: ${day.count} problems`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-3 w-3 rounded-sm ${LEVEL_CLASSES[level]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
