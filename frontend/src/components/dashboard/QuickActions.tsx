import { Link } from 'react-router-dom';
import { CalendarPlus, Briefcase, ListChecks } from 'lucide-react';

const ACTIONS = [
  {
    to: '/interviews',
    label: 'Schedule Interview',
    icon: CalendarPlus
  },
  {
    to: '/mock-interviews',
    label: 'Log Mock Interview',
    icon: ListChecks
  },
  {
    to: '/applications',
    label: 'Add Application',
    icon: Briefcase
  }
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
