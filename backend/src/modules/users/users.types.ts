export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN';
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  college?: string | null;
  graduationYear?: number | null;
  targetCompany?: string | null;
  targetRole?: string | null;
  leetcodeUsername?: string | null;
  githubUsername?: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  college?: string;
  graduationYear?: number;
  targetCompany?: string;
  targetRole?: string;
  leetcodeUsername?: string;
  githubUsername?: string;
}
