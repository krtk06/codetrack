import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './authSchemas';

describe('auth schemas', () => {
  it('loginSchema requires email and password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'pass' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'invalid', password: 'pass' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });

  it('registerSchema requires matching passwords', () => {
    expect(
      registerSchema.safeParse({
        name: 'Alice',
        email: 'a@b.com',
        password: 'password123',
        confirmPassword: 'password123'
      }).success
    ).toBe(true);

    expect(
      registerSchema.safeParse({
        name: 'Alice',
        email: 'a@b.com',
        password: 'password123',
        confirmPassword: 'different'
      }).success
    ).toBe(false);

    expect(
      registerSchema.safeParse({
        name: 'Alice',
        email: 'a@b.com',
        password: 'short',
        confirmPassword: 'short'
      }).success
    ).toBe(false);
  });

  it('forgotPasswordSchema requires a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('resetPasswordSchema requires matching passwords', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'password123',
        confirmPassword: 'password123'
      }).success
    ).toBe(true);

    expect(
      resetPasswordSchema.safeParse({
        password: 'password123',
        confirmPassword: 'different'
      }).success
    ).toBe(false);
  });
});
