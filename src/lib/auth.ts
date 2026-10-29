import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, signInAlertEmail } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials login requires JWT sessions — a database-session strategy
  // doesn't work with it, even with an adapter configured for the OAuth side.
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Runs on sign-in and on every subsequent request. `user` is only
    // populated the first time (right after authorize/OAuth), so that's
    // the one chance to copy custom fields onto the token.
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    // Copies token fields onto the session object your pages actually read.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
  events: {
    // Fires on every sign-in, including Google and password logins.
    async signIn({ user }) {
      if (!user.id || !user.email) return;
      try {
        const fresh = await prisma.user.findUnique({
          where: { id: user.id },
          select: { createdAt: true, username: true },
        });
        if (!fresh) return;

        // Signing up signs the user in straight away, and the welcome email
        // already covers that moment, so skip the sign-in alert for brand
        // new accounts.
        if (Date.now() - fresh.createdAt.getTime() < 60_000) return;

        await sendEmail({
          to: user.email,
          ...signInAlertEmail(fresh.username, new Date()),
        });
      } catch (err) {
        console.error("Sign-in email failed:", err);
      }
    },
  },
});