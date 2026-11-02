"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BackIcon, PlayIcon } from "@/components/Icons";
import { listMedia, type MediaRecord } from "@/lib/store";

// Every phone's clip of the set, started together as one grid.
export default function Drop() {
  const [clips, setClips] = useState<MediaRecord[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    listMedia("clip").then((all) => {
      const set = all.filter((c) => c.moment === "THE SET" && !c.mime.startsWith("image/")).slice(-9);
      setClips(set);
      setUrls(set.map((c) => URL.createObjectURL(c.blob)));
    });
  }, []);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  function playAll() {
    refs.current.forEach((v) => {
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => {});
    });
  }

  const slots = Math.max(9, clips.length);

  return (
    <main className="app bare">
      <div className="between">
        <Link href="/crate" className="icon-btn" aria-label="Back"><BackIcon size={18} /></Link>
        <p className="label">Every angle</p>
        <span style={{ width: 44 }} />
      </div>
      <div>
        <p className="label">Roundhouse</p>
        <h1 className="title">The drop</h1>
      </div>

      <div className="grid3" style={{ gap: 4, borderRadius: 10, overflow: "hidden" }}>
        {Array.from({ length: slots }).map((_, i) => {
          const c = clips[i];
          return (
            <div key={i} className={`tile${c?.dlala ? " dlala" : ""}`} style={{ borderRadius: 0, aspectRatio: "9 / 16", background: ["var(--tile-1)", "var(--tile-3)", "var(--tile-4)"][i % 3] }}>
              {c && <video ref={(el) => { refs.current[i] = el; }} src={urls[i]} muted playsInline loop style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <div className="meta" style={{ justifyContent: "flex-end" }}>
                <span className="tiny" style={{ color: "var(--soft)" }}>{c ? c.who : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {clips.length ? (
        <button className="btn ember block" onClick={playAll}><PlayIcon />Drop it</button>
      ) : (
        <p className="muted" style={{ fontSize: 14, textAlign: "center" }}>
          Clips tagged The set land here. Once everyone has filmed the same drop, they play together.
        </p>
      )}
      <p className="mono muted" style={{ fontSize: 11, textAlign: "center" }}>SYNCING BY TIMESTAMP ARRIVES WITH UPLOADS</p>
    </main>
  );
}
