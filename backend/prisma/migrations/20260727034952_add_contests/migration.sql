-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LEETCODE', 'CODEFORCES', 'CODECHEF');

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "externalContestId" TEXT,
    "contestName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER NOT NULL,
    "solved" INTEGER NOT NULL DEFAULT 0,
    "ratingBefore" INTEGER,
    "ratingAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contest_userId_date_idx" ON "Contest"("userId", "date");

-- CreateIndex
CREATE INDEX "Contest_userId_platform_idx" ON "Contest"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_userId_platform_externalContestId_key" ON "Contest"("userId", "platform", "externalContestId");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
