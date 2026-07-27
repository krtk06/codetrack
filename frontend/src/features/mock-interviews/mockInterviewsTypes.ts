export interface MockInterview {
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

export interface MockInterviewTopicPerformance {
  topic: string;
  averageScore: number;
  count: number;
}

export interface MockInterviewPerformance {
  averageScore: number;
  totalInterviews: number;
  topicBreakdown: MockInterviewTopicPerformance[];
  scoreTrend: { date: string; percentage: number }[];
}
