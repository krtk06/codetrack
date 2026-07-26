import { useQuery } from '@tanstack/react-query';
import { getDashboard } from './dashboardApi';
import type { DashboardResponse } from './dashboardTypes';

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 5 * 60 * 1000
  });
}
