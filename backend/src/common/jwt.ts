import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshPayload {
  userId: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: getAccessExpiry()
  } as SignOptions);
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: getRefreshExpiry()
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getAccessSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, getRefreshSecret()) as RefreshPayload;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return secret;
}

function getAccessExpiry(): string {
  return process.env.JWT_ACCESS_EXPIRY ?? '15m';
}

function getRefreshExpiry(): string {
  return process.env.JWT_REFRESH_EXPIRY ?? '7d';
}
