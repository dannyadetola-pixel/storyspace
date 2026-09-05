import { DefaultSession } from "next-auth";

// Auth.js's default Session/User types don't know about our custom fields.
// Without this, `session.user.id` and `session.user.username` fail to
// typecheck anywhere you use them.
declare module "next-auth" {
  interface User {
    username?: string;
  }

  interface Session {
    user: {
      id: string;
      username?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
  }
}
