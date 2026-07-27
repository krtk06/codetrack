import { prisma } from '../../src/config/database.js';

const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Sliding Window',
  'Binary Search',
  'Heap',
  'Trie'
];

async function main() {
  await prisma.$transaction(
    TOPICS.map((name, index) =>
      prisma.topic.upsert({
        where: { name },
        update: { order: index },
        create: { name, order: index }
      })
    )
  );

  console.log(`Seeded ${TOPICS.length} topics`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
