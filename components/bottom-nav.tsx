"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CameraIcon, CrateIcon, FilmIcon, SpinIcon, TripIcon } from "@/components/icons";

const items = [
  { href: "/", label: "Spin", Icon: SpinIcon },
  { href: "/trip", label: "Trip", Icon: TripIcon },
  { href: "/crate", label: "Crate", Icon: CrateIcon },
  { href: "/film", label: "Film", Icon: FilmIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] border-t border-[#231f1c] bg-deck/95 backdrop-blur"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="flex items-center justify-between px-6 pt-3">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-14 flex-col items-center gap-1.5 font-mono text-[11px] uppercase tracking-[1.4px] transition-colors ${
                active ? "text-paper" : "text-dust hover:text-paper"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
        <Link
          href="/capture"
          aria-label="Open camera"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-ember text-ink transition-transform active:scale-95"
        >
          <CameraIcon size={20} />
        </Link>
      </div>
    </nav>
  );
}

/** Page wrapper that leaves room for the fixed bottom nav. */
export function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <main
        className={`flex flex-col px-5 pb-32 ${className}`}
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
      >
        <div className="pt-10">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
