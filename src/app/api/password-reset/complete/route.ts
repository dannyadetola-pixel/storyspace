import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	let token: string;
	let password: string;

	try {
		const body = await request.json();
		token = typeof body.token === "string" ? body.token : "";
		password = typeof body.password === "string" ? body.password : "";
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	if (!/^[a-f0-9]{64}$/.test(token)) {
		return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
	}
	if (password.length < 8 || password.length > 128) {
		return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 });
	}

	const tokenHash = createHash("sha256").update(token).digest("hex");
	const passwordHash = await bcrypt.hash(password, 10);
	const now = new Date();

	try {
		await prisma.$transaction(async (transaction) => {
			const resetToken = await transaction.passwordResetToken.findUnique({
				where: { tokenHash },
				select: { id: true, userId: true, expiresAt: true },
			});
			if (!resetToken || resetToken.expiresAt <= now) throw new Error("INVALID_RESET_TOKEN");

			const consumed = await transaction.passwordResetToken.deleteMany({
				where: { id: resetToken.id, expiresAt: { gt: now } },
			});
			if (consumed.count !== 1) throw new Error("INVALID_RESET_TOKEN");

			await transaction.user.update({
				where: { id: resetToken.userId },
				data: { passwordHash },
			});
			await transaction.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });
		});
	} catch (error) {
		if (error instanceof Error && error.message === "INVALID_RESET_TOKEN") {
			return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
		}
		throw error;
	}

	return NextResponse.json({ message: "Password updated. You can now log in." });
}
