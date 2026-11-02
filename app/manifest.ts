import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Side Three — Ember London",
    short_name: "Side Three",
    description: "Our girls' trip to London for Dlala Thukzin, pressed into one film.",
    start_url: "/",
    display: "standalone",
    background_color: "#10142a",
    theme_color: "#10142a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
