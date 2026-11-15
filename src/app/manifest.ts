import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StorySpace",
    short_name: "StorySpace",
    description: "Books, community, and creators in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#1b7d00",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}