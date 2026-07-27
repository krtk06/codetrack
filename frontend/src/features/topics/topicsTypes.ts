export interface Topic {
  id: string;
  name: string;
  order: number;
}

export interface TopicPerformance {
  topicId: string;
  name: string;
  solved: number;
  attempted: number;
  successRate: number;
}
