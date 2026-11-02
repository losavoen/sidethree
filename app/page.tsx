"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import PlaylistSheet from "@/components/PlaylistSheet";
import Record from "@/components/Record";
import { CameraIcon, PauseIcon, PlayIcon, QrIcon } from "@/components/Icons";
import { daysUntil, trip } from "@/lib/trip";
import { getProfile, listMedia, type Profile } from "@/lib/store";

export default function Home() {
  const [playing, setPlaying] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [counts, setCounts] = useState({ clips: 0, dlala: 0 });
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    setProfileState(getProfile());
    setCountdown(daysUntil(trip.takeoff));
    listMedia("clip").then((clips) => setCounts({ clips: clips.length, dlala: clips.filter((c) => c.dlala).length }));
  }, []);

  function invite() {
    const url = window.location.origin + "/join";
    const text = `Join our record for ${trip.title} on Side Three`;
    if (navigator.share) navigator.share({ title: "Side Three", text, url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
  }

  return (
    <main className="app">
      <div className="between">
        <div className="row" style={{ gap: 8 }}>
          <span className="script" style={{ fontSize: 24, textShadow: "2px 2px 0 var(--ember)" }}>Side Three</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {profile ? (
            <button className="btn" onClick={invite}><QrIcon size={18} />Invite</button>
          ) : (
            <Link className="btn" href="/join"><QrIcon size={18} />Join</Link>
          )}
        </div>
      </div>

      {!profile && (
        <Link href="/join" className="card fade-up" style={{ padding: "14px 16px", textDecoration: "none", display: "block" }}>
          <p style={{ fontWeight: 600 }}>Join the record</p>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Add your name so your clips are credited to you.</p>
        </Link>
      )}

      <p className="label" style={{ marginTop: 8 }}>Now spinning</p>

      <section className="card dots" style={{ borderRadius: 10, padding: "24px 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        <Record playing={playing} />
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="script" style={{ fontSize: 44, lineHeight: 0.92 }}>{trip.title}</h1>
          <p className="mono muted" style={{ fontSize: 12, letterSpacing: 1 }}>{trip.subtitle.toUpperCase()}</p>
          <p className="mono ember" style={{ fontSize: 12, letterSpacing: 1, fontWeight: 500, minHeight: 15 }}>
            {countdown === null ? "" : countdown > 0 ? `${countdown} DAYS TO TAKEOFF · DLALA THUKZIN × 2` : "WE'RE IN LONDON"}
          </p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Stop the record" : "Spin the record"}
            style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 8, background: "var(--text)", border: 0, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={() => setSheet(true)} style={{ flexGrow: 1, minWidth: 0, textAlign: "left", background: "none", border: 0, padding: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>three steps forward</p>
            <p className="muted" style={{ fontSize: 13 }}>Open the playlist</p>
          </button>
          <Link href="/capture" aria-label="Open camera" style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 8, background: "var(--ember)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CameraIcon />
          </Link>
        </div>
      </section>

      <div className="grid3" style={{ gap: 8 }}>
        <Stat value={String(counts.clips)} label="CLIPS" />
        <Stat value={String(trip.girls.length)} label="GIRLS" />
        <Stat value={`${counts.dlala}/10`} label="DLALA SHOTS" />
      </div>

      <BottomNav />
      {sheet && <PlaylistSheet onClose={() => setSheet(false)} />}
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card" style={{ borderRadius: 10, padding: 12 }}>
      <p className="serif" style={{ fontSize: 22 }}>{value}</p>
      <p className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{label}</p>
    </div>
  );
}
