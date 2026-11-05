"use client";

import { useEffect } from "react";

// Reports one visit when the book page opens. The server decides whether it
// counts, so this component only reports the visit and renders nothing.
export default function ViewTracker({ bookId }: { bookId: string }) {
  useEffect(() => {
    fetch(`/api/books/${bookId}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [bookId]);

  return null;
}
