"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full h-11 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-app-primary";

export default function SignupPanel() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);

    if (login?.error) {
      setError("Your account was created, but signing in failed. Try logging in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <h1 className="mb-4 text-base font-semibold text-white">
          Create your StorySpace account
        </h1>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <input
          id="username"
          type="text"
          required
          autoComplete="username"
          placeholder="Username (letters, numbers, _)"
          aria-label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          className={inputClass}
        />
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
          minLength={8}
          autoComplete="new-password"
          placeholder="Password (at least 8 characters)"
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
          {submitting ? "Creating account…" : "Sign up"}
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

      <div className="mt-8 rounded-md border border-white/15 p-5 text-center text-sm text-white/80">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-app-primary hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}