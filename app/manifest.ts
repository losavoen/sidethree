import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Side Three",
    short_name: "Side Three",
    description: "Ember London — our weekend for Dlala Thukzin, pressed into one film.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0C0A09",
    theme_color: "#0C0A09",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
