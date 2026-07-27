export interface DailyPlanItem {
  topic: string;
  count: number;
}

export interface LearningPathPhase {
  phase: string;
  topics: string[];
}

export interface Recommendations {
  weakTopics: string[];
  dailyPlan: DailyPlanItem[];
  learningPath: LearningPathPhase[];
  generatedAt: string;
}
