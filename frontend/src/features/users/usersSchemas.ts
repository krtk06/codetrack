import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  college: z.string().optional(),
  graduationYear: z.string().optional(),
  targetCompany: z.string().optional(),
  targetRole: z.string().optional(),
  leetcodeUsername: z.string().optional(),
  githubUsername: z.string().optional()
});

export type ProfileForm = z.infer<typeof profileSchema>;

export interface ProfileUser {
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
}
