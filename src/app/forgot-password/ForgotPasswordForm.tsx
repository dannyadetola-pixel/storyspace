"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError("");
		setMessage("");
		setSubmitting(true);
		try {
			const response = await fetch("/api/password-reset/request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error ?? "Could not request a reset link");
			setMessage(data.message);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen flex items-center justify-center px-4">
			<form onSubmit={handleSubmit} className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4">
				<h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">Reset your password</h1>
				<p className="text-sm text-app-text/70 dark:text-app-text-dark/70">Enter your email and we’ll send a reset link if an account matches.</p>
				{message && <p role="status" className="text-sm text-green-700 dark:text-green-400">{message}</p>}
				{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
				<div>
					<label htmlFor="email" className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70">Email</label>
					<input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark" />
				</div>
				<button type="submit" disabled={submitting} className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60">
					{submitting ? "Sending…" : "Send reset link"}
				</button>
				<p className="text-sm text-center text-app-text/70 dark:text-app-text-dark/70"><Link href="/login" className="text-app-primary dark:text-app-primary-dark underline underline-offset-2">Back to log in</Link></p>
			</form>
		</main>
	);
}
