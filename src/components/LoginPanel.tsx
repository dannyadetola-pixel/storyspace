"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full h-11 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-app-primary";

export default function LoginPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);
    if (res?.error) {
      setError("Sorry, that email or password didn't match. Please try again.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <h1 className="mb-4 text-base font-semibold text-white">
          Log into StorySpace
        </h1>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-app-primary text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="flex items-center gap-3 py-5 text-xs text-white/40">
        <span className="h-px flex-1 bg-white/15" />
        OR
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full h-11 rounded-lg border border-white/15 bg-white/5 text-sm text-white/90"
      >
        Continue with Google
      </button>

      <div className="mt-5 text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-white/80 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="mt-8 rounded-md border border-white/15 p-5 text-center text-sm text-white/80">
        Don&rsquo;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-app-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
