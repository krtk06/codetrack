import { useMutation } from '@tanstack/react-query';
import { analyzeFailure } from './aiCoachApi';
import type { AICoachAnalysis } from './aiCoachTypes';

export function useAnalyzeFailure() {
  return useMutation<AICoachAnalysis, Error, string>({
    mutationFn: (failureDescription: string) => analyzeFailure(failureDescription)
  });
}
