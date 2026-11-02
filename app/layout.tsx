import type { Metadata, Viewport } from "next";
import "./globals.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Gloock&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Pinyon+Script&display=swap";

export const metadata: Metadata = {
  title: "Side Three — Ember London",
  description: "Our girls' trip to London for Dlala Thukzin, pressed into one film.",
  appleWebApp: { capable: true, title: "Side Three", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
