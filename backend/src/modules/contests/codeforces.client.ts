import axios from 'axios';

export interface CodeforcesRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface CodeforcesResponse<T> {
  status: 'OK' | 'FAILED';
  comment?: string;
  result?: T;
}

const BASE_URL = process.env.CODEFORCES_API_URL ?? 'https://codeforces.com/api';

export async function fetchCodeforcesRatingHistory(handle: string): Promise<CodeforcesRatingChange[]> {
  const response = await axios.get<CodeforcesResponse<CodeforcesRatingChange[]>>(
    `${BASE_URL}/user.rating`,
    { params: { handle } }
  );

  if (response.data.status !== 'OK') {
    throw new Error(`Codeforces API error: ${response.data.comment ?? 'Unknown error'}`);
  }

  return response.data.result ?? [];
}
