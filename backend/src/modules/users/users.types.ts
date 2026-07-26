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
