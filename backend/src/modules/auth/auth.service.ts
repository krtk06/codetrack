import crypto from 'node:crypto';
import { comparePassword, hashPassword } from '../users/users.service.js';
import { findUserByEmail, findUserById } from '../users/users.service.js';
import { prisma } from '../../config/database.js';
import { signAccessToken } from '../../common/jwt.js';
import { badRequest, conflict, unauthorized } from '../../common/errors.js';
import { sendEmail } from '../email/email.service.js';
import type { UserResponse } from '../users/users.types.js';

export const SALT_ROUNDS = 12;
export const REFRESH_TOKEN_BYTES = 32;
export const VERIFICATION_TOKEN_BYTES = 32;
export const RESET_TOKEN_BYTES = 32;

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateOpaqueToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

function generateVerificationToken(): string {
  return crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString('hex');
}

function generateResetToken(): string {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
}

function addHours(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function toUserResponse(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your CodeTrack Pro email',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    text: `Verify your email: ${verificationUrl}`
  });
}

async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your CodeTrack Pro password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    text: `Reset your password: ${resetUrl}`
  });
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface TokensResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export async function register(input: RegisterInput): Promise<TokensResponse> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw conflict('An account with this email already exists');
  }

  const hashedPassword = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: 'USER'
    }
  });

  const verificationToken = generateVerificationToken();
  await prisma.emailVerificationToken.create({
    data: {
      tokenHash: hashToken(verificationToken),
      userId: user.id,
      expiresAt: addHours(24)
    }
  });
  await sendVerificationEmail(user.email, verificationToken);

  const refreshToken = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: addDays(7)
    }
  });

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken
  };
}

interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<TokensResponse> {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw unauthorized('Invalid email or password');
  }

  const refreshToken = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: addDays(7)
    }
  });

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(refreshToken) }
  });
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenHash = hashToken(refreshToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!existing || existing.expiresAt < new Date()) {
    throw unauthorized('Invalid or expired refresh token');
  }

  const newRefreshToken = generateOpaqueToken();
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: existing.id } }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: existing.user.id,
        expiresAt: addDays(7)
      }
    })
  ]);

  const accessToken = signAccessToken({
    userId: existing.user.id,
    email: existing.user.email,
    role: existing.user.role
  });

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
}

export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.expiresAt < new Date()) {
    throw badRequest('Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { isEmailVerified: true }
    }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } })
  ]);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await findUserByEmail(email);

  if (!user) {
    // Always return success to avoid email enumeration
    return;
  }

  const token = generateResetToken();
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: addHours(1)
    }
  });

  await sendPasswordResetEmail(user.email, token);
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(input.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.expiresAt < new Date() || record.usedAt) {
    throw badRequest('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { password: hashedPassword }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    })
  ]);
}

interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const user = await findUserById(input.userId);
  if (!user) {
    throw unauthorized('User not found');
  }

  const isPasswordValid = await comparePassword(input.oldPassword, user.password);
  if (!isPasswordValid) {
    throw unauthorized('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
}

export { findUserById, findUserByEmail };
