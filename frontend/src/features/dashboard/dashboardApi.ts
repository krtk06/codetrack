import { api } from '../../lib/api';
import type { DashboardResponse } from './dashboardTypes';

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/dashboard');
  return response.data;
}
