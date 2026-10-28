import Link from "next/link";

// Links to the single tip checkout page. Kept as a plain Link (no client
// JavaScript), so it works from any server-rendered page. Pages decide
// whether to show it, e.g. hiding it on the author's own profile.
export default function TipButton({
  username,
  label = "Support author",
}: {
  username: string;
  label?: string;
}) {
  return (
    <Link
      href={`/tip/${username}`}
      className="inline-block rounded-full border border-app-primary dark:border-app-primary-dark px-4 py-1.5 text-sm font-medium text-app-primary dark:text-app-primary-dark hover:bg-app-primary/5 dark:hover:bg-app-primary-dark/10"
    >
      {label}
    </Link>
  );
}
