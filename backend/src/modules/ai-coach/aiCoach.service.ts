import { badRequest } from '../../common/errors.js';
import { callOpenAI } from './aiCoach.client.js';
import {
  aiCoachResponseSchema,
  buildUserPrompt,
  SYSTEM_PROMPT
} from './aiCoach.prompt.js';
import type { AICoachAnalysis } from './aiCoach.types.js';

export async function analyzeFailure(failureDescription: string): Promise<AICoachAnalysis> {
  if (!failureDescription || failureDescription.trim().length < 5) {
    throw badRequest('failureDescription must be at least 5 characters');
  }

  const content = await callOpenAI(SYSTEM_PROMPT, buildUserPrompt(failureDescription));

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error('AI coach returned an invalid JSON response');
  }

  const result = aiCoachResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('AI coach response did not match the expected schema');
  }

  return result.data;
}
