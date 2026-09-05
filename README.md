# StorySpace — Module 1: Foundation

This is the first of six modules (see the plan at the bottom). It contains:

- The **full database schema** for the whole app — users, posts, books/chapters, reactions, chat, verification, and payment eligibility — even though the UI for most of that comes in later modules. Getting the data model right early avoids painful migrations down the line.
- **Working auth**: email/password signup and login, plus Google sign-in, using Auth.js (NextAuth v5).
- A themed **login, signup, and profile page** using the brand palette (deep green, warm neutrals, amber for books).
- A **light/dark toggle** component.

## Before you start: a note on testing

Everything here was hand-written and carefully reviewed, but it has **not** been run through `npm install` or a real build — the environment this was built in has no internet access, so that step literally couldn't happen on this end. That means the very first real test is *your* `npm install` and `npm run dev` below. If something doesn't compile, that's normal for a first run of any new codebase, not a sign something went unusually wrong — tell me the exact error and I'll fix it immediately.

## 1. Prerequisites

- [Node.js](https://nodejs.org) 20 or later installed on your computer
- A free [GitHub](https://github.com) account
- A free [Supabase](https://supabase.com) account (for the database)
- A free [Vercel](https://vercel.com) account (for hosting)

## 2. Local setup

1. Download/unzip this project, then open a terminal in the folder.
2. Install dependencies:
   ```
   npm install
   ```
   If any package version in `package.json` has been superseded, npm will tell you — run `npm install <package>@latest` for that one package and continue.
3. Copy the environment template:
   ```
   cp .env.example .env
   ```

## 3. Set up your database (Supabase)

1. Create a new project at [supabase.com](https://supabase.com) and save the database password you set — Supabase won't show it to you again.
2. On your project's dashboard, click the **Connect** button near the top of the page (this replaced the old Project Settings path).
3. In the dialog, select the **Transaction pooler** connection string and copy it. It looks like:
   `postgresql://postgres.xxxxxxx:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres`
4. Replace `[YOUR-PASSWORD]` with your real database password from step 1.
5. Paste it as `DATABASE_URL` in `.env`, and append `?pgbouncer=true&connection_limit=1` to the end of it — the pooler needs that flag.
6. Copy that same string again as `DIRECT_URL`, but change the port from `6543` to `5432` and drop the `?pgbouncer=...` part. This one's only used for migrations — Supabase's transaction pooler can't run them, so `prisma migrate` needs the session pooler instead (same host, different port).

## 4. Set up Google sign-in (optional but included)

1. In the [Google Cloud Console](https://console.cloud.google.com), create a project.
2. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (add your real domain's equivalent later).
5. Copy the generated Client ID and Client Secret into `.env`.

If you'd rather skip Google for now, leave those two fields blank — email/password signup still works on its own.

## 5. Generate your auth secret

```
openssl rand -base64 32
```

Paste the output into `NEXTAUTH_SECRET` in `.env`.

## 6. Create the database tables

```
npm run prisma:migrate
```

This reads `prisma/schema.prisma` and creates every table in your Supabase database.

## 7. Run it locally

```
npm run dev
```

Visit `http://localhost:3000` — you should be able to sign up, log in, and see a basic profile page.

## 8. Push to GitHub

```
git init
git add .
git commit -m "Module 1: foundation"
git branch -M main
git remote add origin <your-new-repo-url>
git push -u origin main
```

## 9. Deploy to Vercel

1. At [vercel.com](https://vercel.com), click **Add New → Project**, and import your GitHub repo.
2. In the project's **Environment Variables** settings, add everything from your `.env` file — including a `NEXTAUTH_URL` set to your actual Vercel domain (e.g. `https://storyspace.vercel.app`) instead of localhost.
3. Click **Deploy**.
4. If you set up Google sign-in, go back to the Google Cloud Console and add `https://<your-domain>/api/auth/callback/google` as a second authorized redirect URI.

## What's next

This is module 1 of 6:

1. ✅ Foundation — auth, full schema, theming
2. Story writing/reading (your priority)
3. Feed — posts with images, video, and reels
4. Reactions + explore page
5. Chat and groups
6. Verification + payment eligibility (Flutterwave)

Come back once this is deployed and working, and we'll build module 2 on top of it.
