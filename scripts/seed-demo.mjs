// scripts/seed-demo.mjs
// Fills StorySpace with demo content. Content lives in scripts/demo-data.mjs.
//
// Seed:  node --env-file=.env scripts/seed-demo.mjs
// Check: node --env-file=.env scripts/seed-demo.mjs --check
// Clean: node --env-file=.env scripts/seed-demo.mjs --clean

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
const MODE = process.argv.includes("--clean")
  ? "clean"
  : process.argv.includes("--check")
    ? "check"
    : "seed";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();
const ago = (ms) => new Date(now - ms);

const demoBook = { user: { username: { startsWith: PREFIX } } };

async function counts() {
  return {
    users: await prisma.user.count({ where: { username: { startsWith: PREFIX } } }),
    books: await prisma.book.count({ where: demoBook }),
    chapters: await prisma.chapter.count({ where: { book: demoBook } }),
    posts: await prisma.post.count({ where: { user: { username: { startsWith: PREFIX } } } }),
    editorPicks: await prisma.editorPick.count({ where: { book: demoBook } }),
    bookViews: await prisma.bookView.count({ where: { book: demoBook } }),
  };
}

function step(name) {
  console.log(`→ ${name}`);
}

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
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Run with: node --env-file=.env scripts/seed-demo.mjs");
  }

  if (MODE === "check") {
    console.log("Demo content in the database:", await counts());
    return;
  }

  step("Removing previous demo data");
  const removed = await removeDemo();
  console.log(`  removed ${removed} demo accounts`);
  if (MODE === "clean") {
    console.log("Clean complete.");
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const today = new Date(new Date().toISOString().slice(0, 10));

  step("Creating accounts");
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

  step("Creating books and chapters");
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

  step("Creating posts");
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

  step("Creating follows");
  const followPairs = [
    ...readers.flatMap((r) => creators.map((c) => [r.username, c.username])),
    ...creators.flatMap((a) =>
      creators.filter((b) => b.username !== a.username).map((b) => [a.username, b.username])
    ),
  ];
  await prisma.follow.createMany({
    data: followPairs.map(([from, to]) => ({ followerId: ids[from], followedId: ids[to] })),
    skipDuplicates: true,
  });

  step("Recording reads");
  const viewRows = [];
  books.forEach((_, i) => {
    const count = Math.max(1, readers.length - Math.floor(0.6 * i));
    readers.slice(0, count).forEach((r) => {
      viewRows.push({ bookId: bookIds[i], userId: ids[r.username], day: today });
    });
  });
  await prisma.bookView.createMany({ data: viewRows, skipDuplicates: true });

  step("Adding likes");
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

  step("Adding comments");
  await prisma.comment.createMany({
    data: [
      { userId: ids.demo_reader1, targetType: "POST", targetId: postIds[0], body: "The light in this one is beautiful." },
      { userId: ids.demo_reader2, targetType: "POST", targetId: postIds[1], body: "Can't wait for the next chapter!" },
      { userId: ids.demo_reader3, targetType: "POST", targetId: postIds[2], body: "Looking forward to the next instalment." },
    ],
  });

  step("Adding editor picks");
  await prisma.editorPick.createMany({
    data: bookIds.slice(0, 4).map((bookId, i) => ({ bookId, position: i + 1 })),
    skipDuplicates: true,
  });

  step("Checking the result");
  const result = await counts();
  console.log("  in database:", result);
  const expected = { users: 15, books: 14, chapters: 64, posts: 8, editorPicks: 4 };
  let ok = true;
  for (const [key, want] of Object.entries(expected)) {
    if (result[key] !== want) {
      ok = false;
      console.warn(`  WARNING: expected ${want} ${key}, found ${result[key]}`);
    }
  }
  if (ok) console.log("Seeding complete. Every count matches.");
  console.log(`Login: demo_reader1@${DOMAIN} / ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("\nSeeding stopped with an error:");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());