import OpenAI from 'openai';

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export const isOpenAIConfigured = Boolean(API_KEY);

let client: OpenAI | null = null;
if (isOpenAIConfigured) {
  client = new OpenAI({ apiKey: API_KEY as string });
}

export async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!client) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY.');
  }
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }
  return content;
}
