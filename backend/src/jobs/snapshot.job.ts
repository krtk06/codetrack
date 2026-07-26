import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { prisma } from '../config/database.js';
import { syncLeetCodeForUser } from '../modules/leetcode/leetcode.service.js';

export async function runSnapshotJob(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { leetcodeUsername: { not: null } }
  });

  for (const user of users) {
    if (!user.leetcodeUsername) continue;
    try {
      await syncLeetCodeForUser(user.id, user.leetcodeUsername);
      console.log(`Snapshot created for ${user.leetcodeUsername}`);
    } catch (error) {
      console.error(`Failed to sync LeetCode for ${user.leetcodeUsername}:`, error);
    }
  }
}

export function startSnapshotJob(): ScheduledTask {
  return cron.schedule('0 0 * * *', async () => {
    console.log('Running daily LeetCode snapshot job...');
    await runSnapshotJob();
  });
}
