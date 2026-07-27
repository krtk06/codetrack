export interface MockInterviewResponse {
  id: string;
  date: string;
  interviewer: string;
  topic: string;
  score: number;
  scoreOutOf: number;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMockInterviewInput {
  date: string;
  interviewer: string;
  topic: string;
  score: number;
  scoreOutOf?: number;
  feedback?: string | null;
}

export interface UpdateMockInterviewInput {
  date?: string;
  interviewer?: string;
  topic?: string;
  score?: number;
  scoreOutOf?: number;
  feedback?: string | null;
}

export interface MockInterviewPerformance {
  averageScore: number;
  totalInterviews: number;
  topicBreakdown: { topic: string; averageScore: number; count: number }[];
  scoreTrend: { date: string; percentage: number }[];
}
