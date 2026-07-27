export interface CompanyPrepResponse {
  company: string;
  frequentTopics: string[];
  roadmap: {
    phase: string;
    topics: string[];
    suggestedProblems: number;
  }[];
  weakTopicFocus: string[];
}
