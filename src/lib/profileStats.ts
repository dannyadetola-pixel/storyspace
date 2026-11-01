import { prisma } from "@/lib/prisma";

// Counts for one user's profile. "Total likes" means reactions on their
// posts and chapters. "Book engagements" means reactions and comments on
// the chapters of their books.
export async function getProfileStats(userId: string) {
  const [followers, following, books, posts, chapters] = await Promise.all([
    prisma.follow.count({ where: { followedId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.book.count({ where: { userId } }),
    prisma.post.findMany({ where: { userId }, select: { id: true } }),
    prisma.chapter.findMany({
      where: { book: { userId } },
      select: { id: true },
    }),
  ]);

  const postIds = posts.map((p) => p.id);
  const chapterIds = chapters.map((c) => c.id);

  const [postReactions, chapterReactions, chapterComments] = await Promise.all([
    postIds.length
      ? prisma.reaction.count({
          where: { targetType: "POST", targetId: { in: postIds } },
        })
      : 0,
    chapterIds.length
      ? prisma.reaction.count({
          where: { targetType: "CHAPTER", targetId: { in: chapterIds } },
        })
      : 0,
    chapterIds.length
      ? prisma.comment.count({
          where: { targetType: "CHAPTER", targetId: { in: chapterIds } },
        })
      : 0,
  ]);

  return {
    followers,
    following,
    booksCount: books,
    postsCount: posts.length,
    chaptersCount: chapters.length,
    totalLikes: postReactions + chapterReactions,
    bookEngagements: chapterReactions + chapterComments,
  };
}