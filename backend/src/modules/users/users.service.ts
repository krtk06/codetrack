import bcrypt from 'bcrypt';
import { prisma } from '../../config/database.js';
import type { CreateUserInput, UpdateUserInput, UserResponse } from './users.types.js';

export const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function toUserResponse(user: { id: string; email: string; name: string; role: string; createdAt: Date }): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role ?? 'USER'
    }
  });

  return toUserResponse(user);
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input
  });

  return toUserResponse(user);
}
