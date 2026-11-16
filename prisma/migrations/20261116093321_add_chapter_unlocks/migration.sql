-- CreateTable
CREATE TABLE "ChapterUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paystackTransactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChapterUnlock_reference_key" ON "ChapterUnlock"("reference");

-- CreateIndex
CREATE INDEX "ChapterUnlock_chapterId_status_idx" ON "ChapterUnlock"("chapterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterUnlock_userId_chapterId_key" ON "ChapterUnlock"("userId", "chapterId");

-- AddForeignKey
ALTER TABLE "ChapterUnlock" ADD CONSTRAINT "ChapterUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterUnlock" ADD CONSTRAINT "ChapterUnlock_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
