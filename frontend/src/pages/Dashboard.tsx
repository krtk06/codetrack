import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LeetCodeStatsCard from '../features/leetcode/LeetCodeStatsCard';
import { getCurrentUser } from '../features/users/usersApi';
import type { ProfileUser } from '../features/users/usersSchemas';

export default function Dashboard() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { user } = await getCurrentUser();
        if (!cancelled) setUser(user);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Welcome back, {user?.name ?? 'Coder'}
        </h1>
        <p className="text-[var(--muted-foreground)]">Here is your coding progress overview.</p>
      </div>

      <LeetCodeStatsCard username={user?.leetcodeUsername ?? undefined} />
    </div>
  );
}
