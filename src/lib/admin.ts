import type { Session } from "next-auth";

// There's exactly one admin — you. Rather than add a role system to the
// schema for a single person, the admin is just whoever's username matches
// this env var. Set ADMIN_USERNAME in .env to your own username.
export function isAdmin(session: Session | null): boolean {
  return Boolean(
    session?.user?.username &&
      process.env.ADMIN_USERNAME &&
      session.user.username === process.env.ADMIN_USERNAME
  );
}
