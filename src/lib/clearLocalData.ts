import { clearBooks } from "@/lib/offlineStore";

// Removes everything this device saved for the signed-in reader: offline books
// and any cached pages. Static build files and icons are kept, since they hold
// no personal data and make the next visit faster.
export async function clearLocalData(): Promise<void> {
  try {
    await clearBooks();
  } catch {
    // If IndexedDB isn't available, there's nothing to clear.
  }

  if (typeof caches === "undefined") return;

  const names = await caches.keys();
  for (const name of names) {
    if (!name.startsWith("storyspace-")) continue;
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      const path = new URL(request.url).pathname;
      const isKeptAsset =
        path === "/offline" ||
        path === "/manifest.webmanifest" ||
        path.startsWith("/icons/") ||
        path.startsWith("/_next/static/");
      if (!isKeptAsset) await cache.delete(request);
    }
  }
}
