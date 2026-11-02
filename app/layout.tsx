import type { Metadata, Viewport } from "next";
import "@fontsource/gloock/latin-400.css";
import "@fontsource/inter-tight/latin-400.css";
import "@fontsource/inter-tight/latin-500.css";
import "@fontsource/inter-tight/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/pinyon-script/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Side Three",
  description: "Ember London — our weekend for Dlala Thukzin, pressed into one film.",
  applicationName: "Side Three",
  appleWebApp: { capable: true, title: "Side Three", statusBarStyle: "black-translucent" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0C0A09",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className="min-h-dvh">
        <div className="mx-auto min-h-dvh w-full max-w-[480px]">{children}</div>
      </body>
    </html>
  );
}
