import request from 'supertest';
import { app } from '../../app.js';
import { createUser, findUserByEmail, comparePassword, updateUser, hashPassword } from './users.service.js';
import { prisma } from '../../config/database.js';

async function loginAndGetToken(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.accessToken;
}

describe('users service', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('hashes a password and verifies it', async () => {
    const hash = await hashPassword('plain-password');
    const isValid = await comparePassword('plain-password', hash);
    expect(isValid).toBe(true);
  });

  it('creates a user with hashed password', async () => {
    const user = await createUser({
      email: 'alice@example.com',
      password: 'secret123',
      name: 'Alice'
    });

    expect(user.email).toBe('alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.role).toBe('USER');

    const found = await findUserByEmail('alice@example.com');
    expect(found).toBeDefined();
    expect(await comparePassword('secret123', found!.password)).toBe(true);
  });

  it('updates user profile fields', async () => {
    const user = await createUser({
      email: 'bob@example.com',
      password: 'secret123',
      name: 'Bob'
    });

    const updated = await updateUser(user.id, {
      college: 'MIT',
      graduationYear: 2025,
      targetCompany: 'Google',
      targetRole: 'SDE Intern',
      leetcodeUsername: 'bob_lc',
      githubUsername: 'bob_gh'
    });

    expect(updated.name).toBe('Bob');
    expect(updated.college).toBe('MIT');
    expect(updated.graduationYear).toBe(2025);
    expect(updated.leetcodeUsername).toBe('bob_lc');

    const found = await findUserByEmail('bob@example.com');
    expect(found?.college).toBe('MIT');
    expect(found?.graduationYear).toBe(2025);
  });
});

describe('Users API', () => {
  const user = {
    email: 'carol@example.com',
    password: 'secret123',
    name: 'Carol'
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await request(app).post('/api/auth/register').send(user);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/users/me', () => {
    it('returns the authenticated user profile', async () => {
      const token = await loginAndGetToken(user.email, user.password);
      const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        email: user.email,
        name: user.name,
        role: 'USER'
      });
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.leetcodeUsername).toBeNull();
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('updates allowed profile fields', async () => {
      const token = await loginAndGetToken(user.email, user.password);
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Carol Updated',
          college: 'Stanford',
          graduationYear: 2026,
          leetcodeUsername: 'carol_lc',
          githubUsername: 'carol_gh'
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Carol Updated',
        college: 'Stanford',
        graduationYear: 2026,
        leetcodeUsername: 'carol_lc',
        githubUsername: 'carol_gh'
      });
    });

    it('rejects updates to protected fields', async () => {
      const token = await loginAndGetToken(user.email, user.password);
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'hacked@example.com', role: 'ADMIN' });

      expect(res.status).toBe(400);
      const found = await findUserByEmail(user.email);
      expect(found?.email).toBe(user.email);
      expect(found?.role).toBe('USER');
    });
  });
});
