import { api } from '../../lib/api';
import type {
  AdminRecommendation,
  AdminStats,
  AdminUsage,
  AdminUser
} from './adminTypes';

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<{ users: AdminUser[] }>('/admin/users');
  return response.data.users;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
}

export async function getAdminRecommendations(): Promise<AdminRecommendation[]> {
  const response = await api.get<{ recommendations: AdminRecommendation[] }>(
    '/admin/recommendations'
  );
  return response.data.recommendations;
}

export async function getAdminUsage(): Promise<AdminUsage> {
  const response = await api.get<AdminUsage>('/admin/usage');
  return response.data;
}
