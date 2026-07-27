import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Trophy,
  Flame,
  Mic2,
  FileText,
  Briefcase,
  Building2,
  Bot,
  Settings,
  User,
  ShieldAlert,
  X
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/topics', label: 'Topics', icon: PieChart },
  { to: '/contest-analysis', label: 'Contests', icon: Trophy },
  { to: '/heatmap', label: 'Heatmap', icon: Flame },
  { to: '/interviews', label: 'Interviews', icon: Mic2 },
  { to: '/resume-tracker', label: 'Resumes', icon: FileText },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/company-prep', label: 'Company Prep', icon: Building2 },
  { to: '/ai-coach', label: 'AI Coach', icon: Bot },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin', icon: ShieldAlert }
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
    ].join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <span className="text-lg font-semibold text-[var(--foreground)]">CodeTrack</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass} onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
