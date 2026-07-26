-- CreateTable
CREATE TABLE "ProblemStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSolved" INTEGER NOT NULL,
    "easySolved" INTEGER NOT NULL,
    "mediumSolved" INTEGER NOT NULL,
    "hardSolved" INTEGER NOT NULL,
    "acceptanceRate" DOUBLE PRECISION NOT NULL,
    "contestRating" DOUBLE PRECISION,
    "globalRanking" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProblemStats_userId_key" ON "ProblemStats"("userId");

-- CreateIndex
CREATE INDEX "ProblemStats_userId_idx" ON "ProblemStats"("userId");

-- AddForeignKey
ALTER TABLE "ProblemStats" ADD CONSTRAINT "ProblemStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
