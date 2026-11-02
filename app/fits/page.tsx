"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import MediaThumb from "@/components/MediaThumb";
import { BackIcon, CameraIcon } from "@/components/Icons";
import { getProfile, listMedia, saveMedia, type MediaRecord } from "@/lib/store";

const nights = [
  { tab: "Thu", label: "Night one", date: "THU 12 FEB" },
  { tab: "Fri", label: "Night two", date: "FRI 13 FEB" },
];

function FitsInner() {
  const params = useSearchParams();
  const [day, setDay] = useState(params.get("day") === "Fri" ? "Fri" : "Thu");
  const [fits, setFits] = useState<MediaRecord[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => listMedia("fit").then(setFits), []);
  useEffect(() => { load(); }, [load]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const who = getProfile()?.initial ?? "I";
    await saveMedia({ kind: "fit", who, moment: "FITS", day, mime: file.type || "image/jpeg", blob: file });
    e.target.value = "";
    load();
  }

  const shown = fits.filter((f) => f.day === day);
  const night = nights.find((n) => n.tab === day)!;

  return (
    <main className="app bare">
      <div className="between">
        <Link href="/trip" className="icon-btn" aria-label="Back"><BackIcon size={18} /></Link>
        <p className="label">{night.date}</p>
        <span style={{ width: 44 }} />
      </div>
      <div>
        <p className="label">Before we go out</p>
        <h1 className="title">The fits</h1>
      </div>

      <div className="segment" role="group" aria-label="Night">
        {nights.map((n) => (
          <button key={n.tab} aria-pressed={day === n.tab} onClick={() => setDay(n.tab)}>{n.label}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <p className="display" style={{ fontSize: 24 }}>No fits yet</p>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Post yours before you leave the flat. Fits become their own sequence in the film.</p>
        </div>
      ) : (
        <div className="grid2">
          {shown.map((f) => (
            <div key={f.id} className="tile" style={{ aspectRatio: "3 / 4.4" }}>
              <MediaThumb blob={f.blob} mime={f.mime} />
              <div className="meta"><span className="who" style={{ alignSelf: "flex-end" }}>{f.who}</span></div>
            </div>
          ))}
        </div>
      )}

      <input ref={input} type="file" accept="image/*" capture="user" className="sr-only" onChange={onFile} aria-label="Choose a fit photo" />
      <button className="btn ember block" style={{ marginTop: "auto" }} onClick={() => input.current?.click()}>
        <CameraIcon size={20} />Post my fit
      </button>
    </main>
  );
}

export default function Fits() {
  return (
    <Suspense>
      <FitsInner />
    </Suspense>
  );
}
