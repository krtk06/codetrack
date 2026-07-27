import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LeetCodeStatsCard from '../features/leetcode/LeetCodeStatsCard';
import { useDashboard } from '../features/dashboard/useDashboard';
import { getCurrentUser } from '../features/users/usersApi';
import type { ProfileUser } from '../features/users/usersSchemas';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import StatCard from '../components/dashboard/StatCard';
import WeeklyGrowthChart from '../components/charts/WeeklyGrowthChart';
import MonthlyGrowthChart from '../components/charts/MonthlyGrowthChart';

export default function Dashboard() {
  const { data: dashboard, isLoading: dashboardLoading, error: dashboardError } = useDashboard();
  const [user, setUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { user } = await getCurrentUser();
        if (!cancelled) setUser(user);
      } catch {
        toast.error('Failed to load profile');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (dashboardError) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeCard
        name={dashboard?.user.name ?? 'Coder'}
        goal={dashboard?.user.goal ?? 'Set a goal'}
        progress={dashboard?.user.progress ?? '0 / 0'}
        isLoading={dashboardLoading}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Problems Solved"
          value={dashboard?.stats.totalProblemsSolved ?? null}
          isLoading={dashboardLoading}
        />
        <StatCard
          label="Current Streak"
          value={dashboard?.stats.currentStreak ?? null}
          isLoading={dashboardLoading}
        />
        <StatCard
          label="Longest Streak"
          value={dashboard?.stats.longestStreak ?? null}
          isLoading={dashboardLoading}
        />
        <StatCard
          label="Contest Rating"
          value={dashboard?.stats.contestRating ?? null}
          isLoading={dashboardLoading}
        />
        <StatCard
          label="Monthly Growth"
          value={dashboard?.stats.monthlyGrowth ?? null}
          isLoading={dashboardLoading}
        />
        <StatCard
          label="Applications Submitted"
          value={dashboard?.stats.applicationsSubmitted ?? null}
          isLoading={dashboardLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyGrowthChart />
        <MonthlyGrowthChart />
      </div>

      <LeetCodeStatsCard username={user?.leetcodeUsername ?? undefined} />
    </div>
  );
}
