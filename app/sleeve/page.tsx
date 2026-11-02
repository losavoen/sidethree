"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MediaThumb from "@/components/MediaThumb";
import { BackIcon, ShareIcon } from "@/components/Icons";
import { getLinerNotes, getProfile, listMedia, type MediaRecord, type Profile } from "@/lib/store";

export default function Sleeve() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [cover, setCover] = useState<MediaRecord | null>(null);
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const p = getProfile();
    setProfileState(p);
    setLine(getLinerNotes().find((n) => n.who === p?.initial)?.text ?? null);
    listMedia().then((all) => {
      const mine = all.filter((m) => m.kind !== "voice" && (!p || m.who === p.initial));
      setCover(mine.find((m) => m.dlala) ?? mine.at(-1) ?? null);
    });
  }, []);

  function share() {
    const text = `${profile?.name ?? "We"} on Side Three · Ember London`;
    if (navigator.share) navigator.share({ title: "Side Three", text, url: window.location.origin }).catch(() => {});
  }

  return (
    <main className="app bare">
      <div className="between">
        <Link href="/film" className="icon-btn" aria-label="Back"><BackIcon size={18} /></Link>
        <p className="label">Your sleeve</p>
        <span style={{ width: 44 }} />
      </div>

      <div className="drop-in" style={{ position: "relative", aspectRatio: "9 / 16", borderRadius: 24, overflow: "hidden", background: "#1a130f", border: "1px solid #2e2420" }}>
        {cover && <div style={{ position: "absolute", inset: 0, filter: "sepia(0.3) saturate(1.2) contrast(1.05)" }}><MediaThumb blob={cover.blob} mime={cover.mime} /></div>}
        <div style={{ position: "absolute", inset: 0, background: "rgba(12,10,9,0.38)" }} />
        <div style={{ position: "absolute", inset: 0, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="between mono" style={{ fontSize: 11, letterSpacing: 2 }}>
            <span>SIDE THREE</span>
            <span>33⅓</span>
          </div>
          <div className="stack" style={{ gap: 4 }}>
            <p className="script" style={{ fontSize: 60, lineHeight: 1 }}>Ember</p>
            <p className="serif" style={{ fontSize: 20, letterSpacing: 6 }}>LONDON</p>
            {line && <p style={{ fontSize: 15, marginTop: 12, maxWidth: 260 }}>“{line}”</p>}
            <div className="between mono" style={{ fontSize: 11, letterSpacing: 1.4, marginTop: 16 }}>
              <span>{(profile?.name ?? "[Your name]").toUpperCase()}</span>
              <span>11–15 FEB · DLALA THUKZIN</span>
            </div>
          </div>
        </div>
      </div>

      {!cover && <p className="muted" style={{ fontSize: 14, textAlign: "center" }}>Your best clip becomes the cover. Shoot a few and it fills in.</p>}
      {!line && <Link href="/notes" className="btn block">Add your liner note</Link>}
      <button className="btn ember block" onClick={share}><ShareIcon size={18} />Share my sleeve</button>
    </main>
  );
}
