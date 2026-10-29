import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, welcomeEmail } from "@/lib/email";

// Usernames appear in profile URLs (/u/<username>) and links across the app,
// so they must be plain: letters, numbers, and underscores, 3–30 characters.
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!USERNAME_PATTERN.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–30 characters using only letters, numbers, or underscores. No spaces, no @.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "That email or username is already taken" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

    // A failed email must never fail the signup itself.
    try {
      await sendEmail({ to: user.email, ...welcomeEmail(user.username) });
    } catch (err) {
      console.error("Welcome email failed:", err);
    }

    return NextResponse.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error("Signup failed:", err);
    return NextResponse.json(
      { error: "Something went wrong creating your account" },
      { status: 500 }
    );
  }
}