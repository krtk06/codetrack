import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  college: z.string().optional(),
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal('')),
  targetCompany: z.string().optional(),
  targetRole: z.string().optional(),
  leetcodeUsername: z.string().optional(),
  githubUsername: z.string().optional()
}).strict();
