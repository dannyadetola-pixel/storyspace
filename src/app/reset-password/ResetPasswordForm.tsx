"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ResetPasswordForm({ token }: { token: string }) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [complete, setComplete] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setSubmitting(true);
		try {
			const response = await fetch("/api/password-reset/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error ?? "Could not update password");
			setComplete(true);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen flex items-center justify-center px-4">
			<form onSubmit={handleSubmit} className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4">
				<h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">Choose a new password</h1>
				{complete ? (
					<p role="status" className="text-sm text-app-text dark:text-app-text-dark">Your password has been updated. <Link href="/login" className="text-app-primary dark:text-app-primary-dark underline underline-offset-2">Log in</Link></p>
				) : (
					<>
						{!token && <p role="alert" className="text-sm text-red-600">This reset link is invalid or has expired.</p>}
						{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
						<div>
							<label htmlFor="password" className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70">New password</label>
							<input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!token} className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark" />
						</div>
						<div>
							<label htmlFor="confirmPassword" className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70">Confirm new password</label>
							<input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={!token} className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark" />
						</div>
						<button type="submit" disabled={submitting || !token} className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60">
							{submitting ? "Updating…" : "Update password"}
						</button>
					</>
				)}
			</form>
		</main>
	);
}
