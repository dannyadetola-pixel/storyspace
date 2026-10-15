import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const genericResponse = {
	message: "If an account exists for that email, a reset link will be sent shortly.",
};

async function getGmailAccessToken() {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
	const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

	if (!clientId || !clientSecret || !refreshToken) {
		throw new Error("Gmail API credentials are not configured");
	}

	const response = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: refreshToken,
			grant_type: "refresh_token",
		}),
	});

	if (!response.ok) throw new Error("Could not authorize Gmail API request");
	const data: { access_token: string } = await response.json();
	return data.access_token;
}

async function sendResetEmail(to: string, resetUrl: string) {
	const sender = process.env.GMAIL_USER;
	if (!sender || /[\r\n]/.test(sender) || /[\r\n]/.test(to)) {
		throw new Error("Gmail sender or recipient is invalid");
	}

	const accessToken = await getGmailAccessToken();
	const message = [
		`From: StorySpace <${sender}>`,
		`To: ${to}`,
		"Subject: Reset your StorySpace password",
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=UTF-8",
		"",
		`<p>We received a request to reset your StorySpace password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
	].join("\r\n");

	const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ raw: Buffer.from(message).toString("base64url") }),
	});

	if (!response.ok) throw new Error("Gmail could not send password reset email");
}

export async function POST(request: Request) {
	let email: string;

	try {
		const body = await request.json();
		email = typeof body.email === "string" ? body.email.trim() : "";
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	if (!email || email.length > 254) {
		return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
	}

	const user = await prisma.user.findFirst({
		where: { email: { equals: email, mode: "insensitive" } },
		select: { id: true, email: true, passwordHash: true },
	});

	if (!user?.passwordHash) return NextResponse.json(genericResponse);

	const recentToken = await prisma.passwordResetToken.findFirst({
		where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
		select: { id: true },
	});
	if (recentToken) return NextResponse.json(genericResponse);

	const rawToken = randomBytes(32).toString("hex");
	const tokenHash = createHash("sha256").update(rawToken).digest("hex");
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

	await prisma.$transaction([
		prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
		prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
	]);

	try {
		const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL;
		if (!appUrl) throw new Error("APP_URL is not configured");
		const resetUrl = new URL(`/reset-password?token=${rawToken}`, appUrl);
		if (process.env.NODE_ENV === "production" && resetUrl.protocol !== "https:") {
			throw new Error("APP_URL must use HTTPS in production");
		}
		await sendResetEmail(user.email, resetUrl.toString());
	} catch (error) {
		console.error("Password reset email delivery failed", error);
	}

	return NextResponse.json(genericResponse);
}
