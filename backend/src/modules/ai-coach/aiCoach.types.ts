export interface RecommendedPlanItem {
  activity: string;
  count?: number;
}

export interface AICoachAnalysis {
  weakAreas: string[];
  recommendedPlan: RecommendedPlanItem[];
}
