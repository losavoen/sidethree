"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Record from "@/components/Record";
import { GridIcon, PlayIcon, ShareIcon } from "@/components/Icons";
import { days, PLAYLIST_URL } from "@/lib/trip";
import { isPressed, listMedia, type MediaRecord } from "@/lib/store";

const lengths = [{ label: "60s", s: 60 }, { label: "2 min 30", s: 150 }, { label: "3 min", s: 180 }];
const grades = [
  { label: "Riso", filter: "sepia(0.35) saturate(1.25) hue-rotate(-12deg) contrast(1.08)" },
  { label: "Night bus", filter: "saturate(0.8) contrast(1.15) brightness(0.9) hue-rotate(8deg)" },
  { label: "Daylight", filter: "saturate(1.05) brightness(1.05)" },
];
const dayOrder = days.map((d) => d.tab);

export default function Film() {
  const [pressed, setPressedState] = useState<boolean | null>(null);
  const [clips, setClips] = useState<MediaRecord[]>([]);
  const [length, setLength] = useState(1);
  const [grade, setGrade] = useState(0);
  const [index, setIndex] = useState(-1);
  const [url, setUrl] = useState<string | null>(null);
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setPressedState(isPressed());
    listMedia().then((all) =>
      setClips(
        all
          .filter((m) => m.kind === "clip" || m.kind === "fit")
          .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.createdAt - b.createdAt),
      ),
    );
  }, []);

  // Each clip gets an equal share of the chosen length, at most 3 seconds, cut in order.
  const perClip = clips.length ? Math.min(3, lengths[length].s / clips.length) : 3;

  useEffect(() => {
    if (index < 0 || index >= clips.length) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(clips[index].blob);
    setUrl(u);
    if (clips[index].mime.startsWith("image/")) {
      const t = setTimeout(() => setIndex((i) => i + 1), perClip * 1000);
      return () => { clearTimeout(t); URL.revokeObjectURL(u); };
    }
    return () => URL.revokeObjectURL(u);
  }, [index, clips, perClip]);

  function onTime() {
    const v = player.current;
    if (v && v.currentTime >= perClip) setIndex((i) => i + 1);
  }

  async function exportArchive() {
    for (const c of clips) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(c.blob);
      a.download = `${c.day}-${c.moment.toLowerCase().replace(/\s+/g, "-")}-${c.who}-${c.id}.${c.mime.includes("mp4") ? "mp4" : c.mime.startsWith("image/") ? "jpg" : "webm"}`;
      a.click();
      await new Promise((r) => setTimeout(r, 400));
      URL.revokeObjectURL(a.href);
    }
  }

  if (pressed === null) return <main className="app" />;

  if (!pressed) {
    return (
      <main className="app">
        <div>
          <p className="label">Presses after the flight home</p>
          <h1 className="title">The film</h1>
        </div>
        <Record playing={false} />
        <div className="stack" style={{ textAlign: "center", gap: 8 }}>
          <p className="script" style={{ fontSize: 34, lineHeight: 0.95 }}>Still recording</p>
          <p className="muted" style={{ fontSize: 15 }}>
            Every clip, fit and voice note goes in. On Sunday 15 Feb the record stops spinning and the film is pressed for all of us at once.
          </p>
          <p className="mono ember" style={{ fontSize: 12, marginTop: 6 }}>{clips.length} PIECES IN THE CRATE</p>
        </div>
        <Link href="/film/press" className="btn block">Preview the pressing</Link>
        <BottomNav />
      </main>
    );
  }

  const playing = index >= 0 && url;
  const current = playing ? clips[index] : null;

  return (
    <main className="app">
      <div className="between">
        <p className="label ember">Pressed</p>
        <Link href="/sleeve" className="btn" style={{ minHeight: 36, fontSize: 13 }}><ShareIcon size={16} />My sleeve</Link>
      </div>

      <div style={{ height: 430, borderRadius: 10, background: "var(--ember-deep)", border: "1.5px solid var(--line)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        {current && url && (current.mime.startsWith("image/") ? (
          <img src={url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: grades[grade].filter }} />
        ) : (
          <video key={url} ref={player} src={url} autoPlay muted playsInline onTimeUpdate={onTime} onEnded={() => setIndex((i) => i + 1)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: grades[grade].filter }} />
        ))}
        {!playing && (
          <>
            <p className="mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--soft)" }}>SIDE THREE</p>
            <p className="script" style={{ fontSize: 60, lineHeight: 0.88, textAlign: "center" }}>Ember<br />London</p>
            <button
              onClick={() => clips.length && setIndex(0)}
              disabled={!clips.length}
              aria-label="Play the film"
              style={{ marginTop: 28, width: 64, height: 64, borderRadius: 8, background: "var(--text)", border: 0, color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <PlayIcon size={22} />
            </button>
            {!clips.length && <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>Shoot a few clips first.</p>}
          </>
        )}
        <div className="between mono" style={{ position: "absolute", left: 16, right: 16, bottom: 16, fontSize: 11, color: "var(--soft)" }}>
          <span>{current ? `${current.day.toUpperCase()} · ${current.moment}` : "A GIRLS' TRIP · 11–15 FEB"}</span>
          <span>{playing ? `${index + 1}/${clips.length}` : lengths[length].label.toUpperCase()}</span>
        </div>
        {playing && (
          <div style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: "100%", background: "var(--line)" }}>
            <div style={{ height: 3, width: `${((index + 1) / clips.length) * 100}%`, background: "var(--ember)", transition: "width .3s" }} />
          </div>
        )}
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <p className="label" style={{ letterSpacing: 2 }}>Length</p>
        <div className="pills">
          {lengths.map((l, i) => <button key={l.label} className="pill" aria-pressed={length === i} onClick={() => setLength(i)}>{l.label}</button>)}
        </div>
        <p className="label" style={{ letterSpacing: 2, marginTop: 8 }}>Grade</p>
        <div className="pills">
          {grades.map((g, i) => <button key={g.label} className="pill" aria-pressed={grade === i} onClick={() => setGrade(i)}>{g.label}</button>)}
        </div>
      </div>

      <div className="card row" style={{ borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
          <div style={{ width: 14, height: 14, borderRadius: 8, background: "var(--ember)" }} />
        </div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Scored to three steps forward</p>
          <p className="muted" style={{ fontSize: 13 }}>Final cut gets the track on the server render</p>
        </div>
        <a href={PLAYLIST_URL} target="_blank" rel="noopener" style={{ fontSize: 13 }}>Open</a>
      </div>

      <div className="row" style={{ gap: 8 }}>
        <Link href="/film/drop" className="btn" style={{ flex: 1 }}><GridIcon size={18} />The drop</Link>
        <button className="btn" style={{ flex: 1 }} onClick={exportArchive} disabled={!clips.length}>Export archive</button>
      </div>

      <BottomNav />
    </main>
  );
}
