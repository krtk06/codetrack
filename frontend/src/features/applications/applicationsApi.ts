import { api } from '../../lib/api';
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput
} from './applicationsTypes';

export async function getApplications(status?: ApplicationStatus): Promise<Application[]> {
  const response = await api.get<{ applications: Application[] }>('/applications', {
    params: status ? { status } : {}
  });
  return response.data.applications;
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const response = await api.post<{ application: Application }>('/applications', input);
  return response.data.application;
}

export async function updateApplication(
  id: string,
  input: Partial<CreateApplicationInput>
): Promise<Application> {
  const response = await api.patch<{ application: Application }>(`/applications/${id}`, input);
  return response.data.application;
}

export async function deleteApplication(id: string): Promise<void> {
  await api.delete(`/applications/${id}`);
}
