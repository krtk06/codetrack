import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{title}</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">{footer}</div>}
      </div>
    </div>
  );
}
