import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '../features/auth/authSlice';

interface TopbarProps {
  onMenuClick: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Topbar({ onMenuClick, isDark, onToggleTheme }: TopbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-lg font-semibold text-[var(--foreground)] lg:hidden">CodeTrack</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-[var(--destructive)] px-3 py-1.5 text-sm font-medium text-[var(--destructive-foreground)] hover:opacity-90"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
