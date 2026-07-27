import { api } from '../../lib/api';
import type { Recommendations } from './recommendationsTypes';

export async function getRecommendations(): Promise<Recommendations> {
  const response = await api.get<Recommendations>('/recommendations');
  return response.data;
}
