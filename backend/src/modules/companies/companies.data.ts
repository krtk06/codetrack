export interface CompanyRoadmapPhase {
  phase: string;
  topics: string[];
  suggestedProblems: number;
}

export interface CompanyProfile {
  name: string;
  frequentTopics: string[];
  roadmap: CompanyRoadmapPhase[];
}

export const COMPANIES: Record<string, CompanyProfile> = {
  Google: {
    name: 'Google',
    frequentTopics: ['Graphs', 'Trees', 'Dynamic Programming', 'Heaps', 'Sliding Window'],
    roadmap: [
      {
        phase: 'Foundations',
        topics: ['Arrays', 'Strings', 'Hashing'],
        suggestedProblems: 30
      },
      {
        phase: 'Core DS',
        topics: ['Trees', 'Graphs', 'Heaps'],
        suggestedProblems: 40
      },
      {
        phase: 'Advanced',
        topics: ['Dynamic Programming', 'Sliding Window', 'Backtracking'],
        suggestedProblems: 40
      }
    ]
  },
  Amazon: {
    name: 'Amazon',
    frequentTopics: ['Trees', 'Graphs', 'Dynamic Programming', 'System Design', 'Behavioral Questions'],
    roadmap: [
      {
        phase: 'Foundations',
        topics: ['Arrays', 'Strings', 'Linked Lists'],
        suggestedProblems: 30
      },
      {
        phase: 'Core DS',
        topics: ['Trees', 'Stacks', 'Queues'],
        suggestedProblems: 35
      },
      {
        phase: 'Advanced',
        topics: ['Dynamic Programming', 'Greedy', 'System Design'],
        suggestedProblems: 40
      }
    ]
  },
  Microsoft: {
    name: 'Microsoft',
    frequentTopics: ['Linked Lists', 'Trees', 'Dynamic Programming', 'Strings'],
    roadmap: [
      {
        phase: 'Foundations',
        topics: ['Arrays', 'Strings', 'Hashing'],
        suggestedProblems: 25
      },
      {
        phase: 'Core DS',
        topics: ['Linked Lists', 'Trees', 'Stacks'],
        suggestedProblems: 35
      },
      {
        phase: 'Advanced',
        topics: ['Dynamic Programming', 'Backtracking', 'Binary Search'],
        suggestedProblems: 30
      }
    ]
  },
  Meta: {
    name: 'Meta',
    frequentTopics: ['Graphs', 'Trees', 'Dynamic Programming', 'Heaps', 'System Design'],
    roadmap: [
      {
        phase: 'Foundations',
        topics: ['Arrays', 'Strings', 'Hashing'],
        suggestedProblems: 30
      },
      {
        phase: 'Core DS',
        topics: ['Trees', 'Graphs', 'Heaps'],
        suggestedProblems: 40
      },
      {
        phase: 'Advanced',
        topics: ['Dynamic Programming', 'Sliding Window', 'System Design'],
        suggestedProblems: 40
      }
    ]
  },
  Adobe: {
    name: 'Adobe',
    frequentTopics: ['Arrays', 'Strings', 'Dynamic Programming', 'Trees'],
    roadmap: [
      {
        phase: 'Foundations',
        topics: ['Arrays', 'Strings', 'Hashing'],
        suggestedProblems: 25
      },
      {
        phase: 'Core DS',
        topics: ['Trees', 'Linked Lists', 'Stacks'],
        suggestedProblems: 30
      },
      {
        phase: 'Advanced',
        topics: ['Dynamic Programming', 'Greedy', 'Backtracking'],
        suggestedProblems: 30
      }
    ]
  },
  Atlassian: {
    name: 'Atlassian',
    frequentTopics: ['Arrays', 'Hashing', 'Graphs', 'System Design'],
    roadmap: [
      {
        phase: 'Foundations',
        topics: ['Arrays', 'Strings', 'Hashing'],
        suggestedProblems: 25
      },
      {
        phase: 'Core DS',
        topics: ['Linked Lists', 'Trees', 'Stacks'],
        suggestedProblems: 30
      },
      {
        phase: 'Advanced',
        topics: ['Graphs', 'Dynamic Programming', 'System Design'],
        suggestedProblems: 35
      }
    ]
  }
};

export const SUPPORTED_COMPANIES = Object.keys(COMPANIES);
