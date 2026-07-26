import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../config/database.js';
import * as emailService from '../../modules/email/email.service.js';

let lastEmail: emailService.EmailMessage | null = null;

function extractTokenFromLastEmail(): string | null {
  if (!lastEmail) return null;
  const match = lastEmail.text?.match(/token=([a-f0-9]+)/);
  return match ? match[1] : null;
}

describe('Auth API', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
    lastEmail = null;
    jest.spyOn(emailService, 'sendEmail').mockImplementation(async (message) => {
      lastEmail = message;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const validUser = {
    email: 'alice@example.com',
    password: 'securePass123',
    name: 'Alice'
  };

  describe('POST /api/auth/register', () => {
    it('creates a new user and returns tokens', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        email: validUser.email,
        name: validUser.name,
        role: 'USER'
      });
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(409);
    });

    it('rejects invalid input', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'short',
        name: ''
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns tokens for valid credentials', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: validUser.password
      });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('rejects invalid credentials', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
    });

    it('rejects non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'missing@example.com',
        password: 'somepass123'
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('rotates refresh tokens', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(validUser);
      const { refreshToken } = registerRes.body;

      const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.refreshToken).not.toBe(refreshToken);

      const oldToken = await prisma.refreshToken.findUnique({
        where: { tokenHash: res.body.refreshToken }
      });
      expect(oldToken).toBeNull();
    });

    it('rejects invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'invalid-token' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('deletes the refresh token', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(validUser);
      const { refreshToken } = registerRes.body;

      const res = await request(app).post('/api/auth/logout').send({ refreshToken });
      expect(res.status).toBe(204);

      const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash: refreshToken }
      });
      expect(stored).toBeNull();
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('verifies email and redirects', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const token = extractTokenFromLastEmail();
      if (!token) {
        throw new Error('Verification token not found');
      }

      const res = await request(app).get(`/api/auth/verify-email/${token}`).redirects(0);
      expect(res.status).toBe(302);

      const user = await prisma.user.findUnique({ where: { email: validUser.email } });
      expect(user?.isEmailVerified).toBe(true);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('creates a reset token for existing user', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: validUser.email
      });
      expect(res.status).toBe(202);

      const token = await prisma.passwordResetToken.findFirst({
        where: { user: { email: validUser.email } }
      });
      expect(token).not.toBeNull();
    });

    it('returns 202 for unknown email', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'unknown@example.com'
      });
      expect(res.status).toBe(202);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('resets password using valid token', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });
      const token = extractTokenFromLastEmail();
      if (!token) {
        throw new Error('Reset token not found');
      }

      const res = await request(app).post('/api/auth/reset-password').send({
        token,
        password: 'newSecurePass123'
      });
      expect(res.status).toBe(204);

      const loginRes = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'newSecurePass123'
      });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('changes password when authenticated', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(validUser);
      const { accessToken } = registerRes.body;

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: validUser.password,
          newPassword: 'changedPass123'
        });
      expect(res.status).toBe(204);

      const loginRes = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'changedPass123'
      });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user payload', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(validUser);
      const { accessToken } = registerRes.body;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(validUser.email);
    });
  });
});
