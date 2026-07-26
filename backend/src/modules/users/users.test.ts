import { createUser, findUserByEmail, comparePassword, updateUser, hashPassword } from './users.service.js';
import { prisma } from '../../config/database.js';

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

    const found = await findUserByEmail('bob@example.com');
    expect(found?.college).toBe('MIT');
    expect(found?.graduationYear).toBe(2025);
  });
});
