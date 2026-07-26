import jwt from 'jsonwebtoken';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../../src/common/jwt.js';

describe('JWT utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('signs and verifies an access token', () => {
    const payload = { userId: 'u1', email: 'a@b.com', role: 'USER' };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('u1');
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBe('USER');
  });

  it('signs and verifies a refresh token', () => {
    const payload = { userId: 'u1' };
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe('u1');
  });

  it('throws on invalid access token', () => {
    expect(() => verifyAccessToken('invalid-token')).toThrow(jwt.JsonWebTokenError);
  });
});
