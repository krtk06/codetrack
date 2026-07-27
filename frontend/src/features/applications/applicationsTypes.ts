export type ApplicationStatus = 'APPLIED' | 'OA' | 'INTERVIEW' | 'REJECTED' | 'SELECTED';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'OA',
  'INTERVIEW',
  'REJECTED',
  'SELECTED'
];

export interface Application {
  id: string;
  company: string;
  role: string;
  location: string | null;
  appliedDate: string;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  location?: string | null;
  appliedDate: string;
  status?: ApplicationStatus;
  notes?: string | null;
}
