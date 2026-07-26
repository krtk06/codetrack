import axios from 'axios';
import type { LeetCodeStats, LeetCodeGraphQLResponse } from './leetcode.types.js';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const LEETCODE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
    }
  }
`;

interface LeetCodeRequest {
  query: string;
  variables: { username: string };
  operationName: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchLeetCodeStats(username: string, retries = 3): Promise<LeetCodeStats> {
  const payload: LeetCodeRequest = {
    query: LEETCODE_QUERY,
    variables: { username },
    operationName: 'userProfile'
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post<LeetCodeGraphQLResponse>(LEETCODE_GRAPHQL_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com'
        },
        timeout: 10000
      });

      if (response.data.errors && response.data.errors.length > 0) {
        throw new Error(response.data.errors[0].message);
      }

      return mapResponseToStats(response.data);
    } catch (error) {
      if (error instanceof Error && !axios.isAxiosError(error)) {
        // GraphQL/logical errors should not be retried
        throw error;
      }

      lastError = error instanceof Error ? error : new Error('Unknown LeetCode error');
      if (attempt < retries) {
        await sleep(1000 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch LeetCode stats');
}

function mapResponseToStats(response: LeetCodeGraphQLResponse): LeetCodeStats {
  const submissions = response.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];

  let totalSolved = 0;
  let totalSubmissions = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  for (const item of submissions) {
    totalSolved += item.count;
    totalSubmissions += item.submissions;

    if (item.difficulty === 'Easy') easySolved = item.count;
    if (item.difficulty === 'Medium') mediumSolved = item.count;
    if (item.difficulty === 'Hard') hardSolved = item.count;
  }

  const acceptanceRate = totalSubmissions > 0 ? totalSolved / totalSubmissions : 0;
  const contestRanking = response.data?.userContestRanking;

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    acceptanceRate: Number(acceptanceRate.toFixed(4)),
    contestRating: contestRanking?.rating ?? null,
    globalRanking: contestRanking?.globalRanking ?? null
  };
}
