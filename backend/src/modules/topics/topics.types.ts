export interface TopicResponse {
  id: string;
  name: string;
  order: number;
}

export interface TopicPerformanceResponse {
  topicId: string;
  name: string;
  solved: number;
  attempted: number;
  successRate: number;
}
