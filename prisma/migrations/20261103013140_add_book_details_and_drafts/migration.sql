-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "isMature" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;
