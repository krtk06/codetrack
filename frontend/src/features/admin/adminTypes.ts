export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  snapshotsToday: number;
}

export interface AdminRecommendation {
  userId: string;
  userEmail: string;
  weakTopics: string[];
  dailyPlanCount: number;
  generatedAt: string;
}

export interface AdminUsage {
  apiCalls: number;
  errors: number;
}
