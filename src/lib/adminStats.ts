import { prisma } from "@/lib/prisma";

// Month-by-month counts for the admin dashboard, oldest month first.
export async function getMonthlyStats(months = 12) {
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (months - 1));

  const [users, posts, chapters, tips] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.chapter.findMany({
      // Drafts aren't published yet, so they don't count as output.
      where: { publishedAt: { gte: since }, isPublished: true },
      select: { publishedAt: true },
    }),
    prisma.tip.findMany({
      where: { status: "SUCCESSFUL", createdAt: { gte: since } },
      select: { createdAt: true, amountKobo: true },
    }),
  ]);

  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-NG", { month: "short" }),
      users: 0,
      posts: 0,
      chapters: 0,
      tipsNaira: 0,
    };
  });

  const indexByKey = new Map(buckets.map((b, i) => [b.key, i]));
  const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  for (const u of users) {
    const i = indexByKey.get(keyOf(u.createdAt));
    if (i !== undefined) buckets[i].users++;
  }
  for (const p of posts) {
    const i = indexByKey.get(keyOf(p.createdAt));
    if (i !== undefined) buckets[i].posts++;
  }
  for (const c of chapters) {
    const i = indexByKey.get(keyOf(c.publishedAt));
    if (i !== undefined) buckets[i].chapters++;
  }
  for (const t of tips) {
    const i = indexByKey.get(keyOf(t.createdAt));
    if (i !== undefined) buckets[i].tipsNaira += t.amountKobo / 100;
  }

  return buckets;
}