import type { Metadata, Viewport } from "next";
import "./globals.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";

export const metadata: Metadata = {
  title: "Side Three — Ember London",
  description: "Our girls' trip to London for Dlala Thukzin, pressed into one film.",
  appleWebApp: { capable: true, title: "Side Three", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#10142a",
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
