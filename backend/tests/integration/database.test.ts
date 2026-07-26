import { prisma } from '../../src/config/database.js';

describe('Prisma database connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and retrieves a user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'db-test@example.com',
        password: 'hashed-password',
        name: 'DB Test'
      }
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('db-test@example.com');
    expect(user.role).toBe('USER');

    const found = await prisma.user.findUnique({
      where: { id: user.id }
    });

    expect(found?.name).toBe('DB Test');

    await prisma.user.delete({ where: { id: user.id } });
  });
});
