import { api } from '../../lib/api';
import type { Topic, TopicPerformance } from './topicsTypes';

export async function getTopics(): Promise<Topic[]> {
  const response = await api.get<{ topics: Topic[] }>('/topics');
  return response.data.topics;
}

export async function getTopicPerformance(): Promise<TopicPerformance[]> {
  const response = await api.get<{ performance: TopicPerformance[] }>('/topics/performance');
  return response.data.performance;
}
