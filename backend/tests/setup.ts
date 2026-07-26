process.env.DATABASE_URL = 'postgresql://krtk2:codetrack@localhost:5433/codetrack_test';

import { prisma } from '../src/config/database.js';

beforeEach(async () => {
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany()
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
