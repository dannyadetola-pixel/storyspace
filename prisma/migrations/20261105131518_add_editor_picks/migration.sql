-- CreateTable
CREATE TABLE "EditorPick" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditorPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EditorPick_bookId_key" ON "EditorPick"("bookId");

-- CreateIndex
CREATE INDEX "EditorPick_position_idx" ON "EditorPick"("position");

-- AddForeignKey
ALTER TABLE "EditorPick" ADD CONSTRAINT "EditorPick_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
