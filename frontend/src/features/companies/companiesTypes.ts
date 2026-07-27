export interface CompanyRoadmapPhase {
  phase: string;
  topics: string[];
  suggestedProblems: number;
}

export interface CompanyPrep {
  company: string;
  frequentTopics: string[];
  roadmap: CompanyRoadmapPhase[];
  weakTopicFocus: string[];
}
