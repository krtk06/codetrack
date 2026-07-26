import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('codetrack-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('codetrack-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('codetrack-theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((s) => !s) } as const;
}
