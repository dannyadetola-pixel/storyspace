"use client";

import { useEffect } from "react";

// Saves a search to the reader's recent list once it has been run.
// Renders nothing.
export default function SaveSearch({ query }: { query: string }) {
  useEffect(() => {
    if (query.length < 2) return;
    fetch("/api/search/recent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      keepalive: true,
    }).catch(() => {});
  }, [query]);

  return null;
}
