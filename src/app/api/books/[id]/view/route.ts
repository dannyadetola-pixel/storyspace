import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Records one view per signed-in reader per book per day. Authors' own
// visits and anonymous visits aren't counted. Always returns 204, so the
// page never waits on or reacts to this.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 204 });
  }

  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!book || book.userId === session.user.id) {
    return new NextResponse(null, { status: 204 });
  }

  // Midnight UTC of today. The unique key makes repeat visits a no-op.
  const day = new Date(new Date().toISOString().slice(0, 10));
  await prisma.bookView.createMany({
    data: [{ bookId: id, userId: session.user.id, day }],
    skipDuplicates: true,
  });

  return new NextResponse(null, { status: 204 });
}
