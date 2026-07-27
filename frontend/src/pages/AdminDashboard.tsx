import {
  useAdminRecommendations,
  useAdminStats,
  useAdminUsage,
  useAdminUsers
} from '../features/admin/useAdmin';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="text-3xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const stats = useAdminStats();
  const usage = useAdminUsage();
  const users = useAdminUsers();
  const recommendations = useAdminRecommendations();

  if (stats.error || usage.error || users.error || recommendations.error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--destructive)]">
        Failed to load admin data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">Platform metrics and user management.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total Users" value={stats.data?.totalUsers ?? '-'} />
        <Stat label="Active Users (7d)" value={stats.data?.activeUsers ?? '-'} />
        <Stat label="Snapshots Today" value={stats.data?.snapshotsToday ?? '-'} />
        <Stat label="API Calls" value={usage.data?.apiCalls ?? '-'} />
        <Stat label="Errors" value={usage.data?.errors ?? '-'} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Users</h2>
        {users.isLoading ? (
          <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(users.data ?? []).map((user) => (
                  <tr key={user.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3 font-medium text-[var(--foreground)]">{user.name}</td>
                    <td className="py-2 pr-3">{user.email}</td>
                    <td className="py-2 pr-3">{user.role}</td>
                    <td className="py-2 pr-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recommendations</h2>
        {recommendations.isLoading ? (
          <div className="h-24 w-full animate-pulse rounded bg-[var(--muted)]" />
        ) : (recommendations.data ?? []).length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No recommendations yet.</p>
        ) : (
          <ul className="space-y-2">
            {(recommendations.data ?? []).map((rec) => (
              <li
                key={rec.userId}
                className="rounded-lg bg-[var(--background)] p-3 text-sm"
              >
                <p className="font-medium text-[var(--foreground)]">{rec.userEmail || rec.userId}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Weak topics: {rec.weakTopics.join(', ') || 'None'} • Plan items: {rec.dailyPlanCount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
