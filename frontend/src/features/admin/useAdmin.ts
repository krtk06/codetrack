import { useQuery } from '@tanstack/react-query';
import {
  getAdminRecommendations,
  getAdminStats,
  getAdminUsage,
  getAdminUsers
} from './adminApi';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
    staleTime: 60 * 1000
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 60 * 1000
  });
}

export function useAdminRecommendations() {
  return useQuery({
    queryKey: ['admin', 'recommendations'],
    queryFn: getAdminRecommendations,
    staleTime: 60 * 1000
  });
}

export function useAdminUsage() {
  return useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: getAdminUsage,
    staleTime: 60 * 1000
  });
}
