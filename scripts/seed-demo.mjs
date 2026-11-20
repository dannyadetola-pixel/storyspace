// scripts/seed-demo.mjs
// Fills StorySpace with demo creators, books, chapters, posts, follows, likes,
// comments, views and editor picks. The content lives in scripts/demo-data.mjs.
//
// Add demo data:    node --env-file=.env scripts/seed-demo.mjs
// Remove demo data: node --env-file=.env scripts/seed-demo.mjs --clean
//
// Running it again first removes the previous demo data, so it never duplicates.
// Requires Node 20.6 or newer.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PREFIX,
  DOMAIN,
  PASSWORD,
  FREE_CHAPTERS,
  LOCKED_PRICE_KOBO,
  creators,
  readers,
  books,
  postData,
} from "./demo-data.mjs";

const prisma = new PrismaClient();
const CLEAN = process.argv.includes("--clean");

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();
const ago = (ms) => new Date(now - ms);

// Removes every demo account, along with their books, chapters, posts, and the
// likes and comments attached to them.
async function removeDemo() {
  const users = await prisma.user.findMany({
    where: { username: { startsWith: PREFIX } },
    select: { id: true },
  });
  if (users.length === 0) return 0;
  const userIds = users.map((u) => u.id);

  const posts = await prisma.post.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const chapters = await prisma.chapter.findMany({
    where: { book: { userId: { in: userIds } } },
    select: { id: true },
  });
  const targetIds = [...posts.map((p) => p.id), ...chapters.map((c) => c.id)];

  await prisma.reaction.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { targetId: { in: targetIds } }] },
  });
  await prisma.comment.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { targetId: { in: targetIds } }] },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  return users.length;
}

async function main() {
  const removed = await removeDemo();
  console.log(`Removed ${removed} demo accounts and their content.`);
  if (CLEAN) return;

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const today = new Date(new Date().toISOString().slice(0, 10));

  // Accounts
  const ids = {};
  for (const p of [...creators, ...readers]) {
    const user = await prisma.user.create({
      data: {
        username: p.username,
        email: `${p.username}@${DOMAIN}`,
        passwordHash,
        name: p.name,
        bio: p.bio,
        isVerified: p.verified,
      },
    });
    ids[p.username] = user.id;
  }

  // Books and chapters. Book 0 is the oldest, so "New books" orders by the list.
  // Each chapter's date comes from its book's position, so "New chapters" mixes
  // books instead of showing one book's chapters together.
  const bookIds = [];
  const chapterIds = [];
  for (const [i, b] of books.entries()) {
    const chapterCount = b.chapters.length;
    const book = await prisma.book.create({
      data: {
        userId: ids[b.owner],
        title: b.title,
        genre: b.genre,
        description: b.description,
        coverUrl: b.cover,
        tags: b.tags,
        status: "ONGOING",
        createdAt: ago((books.length - i) * DAY),
        chapters: {
          create: b.chapters.map((c, j) => ({
            title: c.title,
            body: c.paragraphs.join("\n\n"),
            wordCount: c.paragraphs.join(" ").split(/\s+/).length,
            priceKobo: j < FREE_CHAPTERS ? 0 : LOCKED_PRICE_KOBO,
            order: j + 1,
            isPublished: true,
            publishedAt: ago((i * 7 + (chapterCount - j) * 3) * HOUR),
          })),
        },
      },
      include: { chapters: true },
    });
    bookIds.push(book.id);
    chapterIds.push(...book.chapters.map((c) => c.id));
  }

  // Posts, each a different age, so the feed row has an order
  const postIds = [];
  for (const [i, p] of postData.entries()) {
    const post = await prisma.post.create({
      data: {
        userId: ids[p.owner],
        caption: p.caption,
        mediaType: "IMAGE",
        mediaUrl: p.image,
        createdAt: ago((i + 1) * 6 * HOUR),
      },
    });
    postIds.push(post.id);
  }

  // Follows: every reader follows every creator, and creators follow each other
  const followPairs = [
    ...readers.flatMap((r) => creators.map((c) => [r.username, c.username])),
    ...creators.flatMap((a) =>
      creators.filter((b) => b.username !== a.username).map((b) => [a.username, b.username])
    ),
  ];
  await prisma.follow.createMany({
    data: followPairs.map(([from, to]) => ({
      followerId: ids[from],
      followedId: ids[to],
    })),
    skipDuplicates: true,
  });

  // Reads. Book i is read by 10 - floor(0.6 * i) readers, so "Popular right now"
  // runs from the most-read book down to the least.
  const viewRows = [];
  books.forEach((_, i) => {
    const count = Math.max(1, readers.length - Math.floor(0.6 * i));
    readers.slice(0, count).forEach((r) => {
      viewRows.push({ bookId: bookIds[i], userId: ids[r.username], day: today });
    });
  });
  await prisma.bookView.createMany({ data: viewRows, skipDuplicates: true });

  // Likes: every reader likes every post, and about a third of the chapters
  const likeRows = [];
  readers.forEach((r, k) => {
    postIds.forEach((targetId) =>
      likeRows.push({ userId: ids[r.username], targetType: "POST", targetId, type: "LIKE" })
    );
    chapterIds.forEach((targetId, n) => {
      if ((n + k) % 3 === 0) {
        likeRows.push({ userId: ids[r.username], targetType: "CHAPTER", targetId, type: "LIKE" });
      }
    });
  });
  await prisma.reaction.createMany({ data: likeRows, skipDuplicates: true });

  // Comments on the first three posts
  await prisma.comment.createMany({
    data: [
      { userId: ids.demo_reader1, targetType: "POST", targetId: postIds[0], body: "The light in this one is beautiful." },
      { userId: ids.demo_reader2, targetType: "POST", targetId: postIds[1], body: "Can't wait for the next chapter!" },
      { userId: ids.demo_reader3, targetType: "POST", targetId: postIds[2], body: "Looking forward to the next instalment." },
    ],
  });

  // Editor picks: the first four books
  await prisma.editorPick.createMany({
    data: bookIds.slice(0, 4).map((bookId, i) => ({ bookId, position: i + 1 })),
    skipDuplicates: true,
  });

  const totalChapters = chapterIds.length;
  console.log(
    `Created ${creators.length} creators, ${readers.length} readers, ${bookIds.length} books, ${totalChapters} chapters and ${postIds.length} posts.`
  );
  console.log(`Demo login (any demo account): demo_reader1@${DOMAIN} / ${PASSWORD}`);
  console.log("Remove later with: node --env-file=.env scripts/seed-demo.mjs --clean");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
