-- CreateTable
CREATE TABLE "BookView" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookView_bookId_idx" ON "BookView"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookView_bookId_userId_day_key" ON "BookView"("bookId", "userId", "day");

-- AddForeignKey
ALTER TABLE "BookView" ADD CONSTRAINT "BookView_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookView" ADD CONSTRAINT "BookView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
