"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CameraIcon, CrateIcon, FilmIcon, SpinIcon, TripIcon } from "./Icons";

const tabs = [
  { href: "/", label: "SPIN", Icon: SpinIcon },
  { href: "/trip", label: "TRIP", Icon: TripIcon },
  { href: "/crate", label: "CRATE", Icon: CrateIcon },
  { href: "/film", label: "FILM", Icon: FilmIcon },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      {tabs.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className="tab" aria-current={active ? "page" : undefined}>
            <Icon />
            {label}
          </Link>
        );
      })}
      <Link href="/capture" className="cam" aria-label="Open camera">
        <CameraIcon size={20} />
      </Link>
    </nav>
  );
}
