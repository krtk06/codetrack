export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface InterviewResponse {
  id: string;
  company: string;
  round: string;
  date: string;
  time: string;
  location: string | null;
  meetingLink: string | null;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewInput {
  company: string;
  round: string;
  date: string;
  time: string;
  location?: string | null;
  meetingLink?: string | null;
  status?: InterviewStatus;
}

export interface UpdateInterviewInput {
  company?: string;
  round?: string;
  date?: string;
  time?: string;
  location?: string | null;
  meetingLink?: string | null;
  status?: InterviewStatus;
}
