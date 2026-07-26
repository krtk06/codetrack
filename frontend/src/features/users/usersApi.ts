import { api } from '../../lib/api';
import type { ProfileForm, ProfileUser } from './usersSchemas';

export async function getCurrentUser(): Promise<{ user: ProfileUser }> {
  const response = await api.get<{ user: ProfileUser }>('/users/me');
  return response.data;
}

export async function updateCurrentUser(
  data: Omit<ProfileForm, 'graduationYear'> & { graduationYear?: number | string }
): Promise<{ user: ProfileUser }> {
  const response = await api.patch<{ user: ProfileUser }>('/users/me', data);
  return response.data;
}
