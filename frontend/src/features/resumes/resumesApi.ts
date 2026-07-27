import { api } from '../../lib/api';
import type { Resume, ResumeStats } from './resumesTypes';

export async function getResumes(): Promise<Resume[]> {
  const response = await api.get<{ resumes: Resume[] }>('/resumes');
  return response.data.resumes;
}

export async function createResume(input: {
  label: string;
  fileBase64: string;
  filename: string;
}): Promise<Resume> {
  const response = await api.post<{ resume: Resume }>('/resumes', input);
  return response.data.resume;
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/resumes/${id}`);
}

export async function getResumeStats(id: string): Promise<ResumeStats> {
  const response = await api.get<ResumeStats>(`/resumes/${id}/stats`);
  return response.data;
}
