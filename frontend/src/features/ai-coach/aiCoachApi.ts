import { api } from '../../lib/api';
import type { AICoachAnalysis } from './aiCoachTypes';

export async function analyzeFailure(failureDescription: string): Promise<AICoachAnalysis> {
  const response = await api.post<AICoachAnalysis>('/ai-coach/analyze', { failureDescription });
  return response.data;
}
