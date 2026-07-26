import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useDarkMode } from '../hooks/useDarkMode';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          onToggleTheme={toggle}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
