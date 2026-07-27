import { z } from 'zod';

export const aiCoachResponseSchema = z.object({
  weakAreas: z.array(z.string()).min(1),
  recommendedPlan: z
    .array(
      z.object({
        activity: z.string().min(1),
        count: z.number().int().nonnegative().optional()
      })
    )
    .min(1)
});

export const SYSTEM_PROMPT = `You are an expert interview coach. Analyze a candidate's description of a failed interview and produce a JSON object with:
- "weakAreas": array of specific weak areas (topics, skills, or categories).
- "recommendedPlan": array of { activity: string, count?: number } describing concrete next steps.

Return only valid JSON matching the schema. Do not include any other text.`;

export function buildUserPrompt(failureDescription: string): string {
  return `Here is a description of my interview failure:\n\n${failureDescription}\n\nProvide a JSON object with weakAreas and recommendedPlan.`;
}
