"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MediaThumb from "@/components/MediaThumb";
import { GridIcon } from "@/components/Icons";
import { days, sampleCrate } from "@/lib/trip";
import { listMedia, timeLabel, type MediaRecord } from "@/lib/store";

const tones = ["#2A211C", "#3A2418", "#1F1B19", "#33281F", "#241A16", "#2E2420"];

function CrateInner() {
  const params = useSearchParams();
  const initial = Math.max(0, days.findIndex((d) => d.tab === params.get("day")));
  const [tab, setTab] = useState(initial);
  const [mine, setMine] = useState<MediaRecord[]>([]);

  useEffect(() => {
    listMedia().then((all) => setMine(all.filter((m) => m.kind !== "voice")));
  }, []);

  const set = sampleCrate[tab];
  const real = mine.filter((m) => m.day === days[tab].tab);

  return (
    <main className="app">
      <div className="between" style={{ alignItems: "flex-end" }}>
        <div>
          <p className="label">Ember London</p>
          <h1 className="title">The crate</h1>
        </div>
        <Link href="/film/drop" className="btn" style={{ minHeight: 36, fontSize: 13 }}><GridIcon size={16} />The drop</Link>
      </div>

      <div className="segment" role="group" aria-label="Day">
        {days.map((d, i) => (
          <button key={d.tab} aria-pressed={tab === i} onClick={() => setTab(i)}>{d.tab}</button>
        ))}
      </div>

      <div className="between" style={{ alignItems: "baseline" }}>
        <p className="script" style={{ fontSize: 28, lineHeight: 1 }}>{set.heading}</p>
        <p className="mono muted" style={{ fontSize: 11 }}>{set.sub}</p>
      </div>

      {real.length > 0 && (
        <>
          <p className="label" style={{ fontSize: 10 }}>Ours</p>
          <div className="grid3">
            {real.map((m) => (
              <div key={m.id} className={`tile${m.dlala ? " dlala" : ""}`}>
                <MediaThumb blob={m.blob} mime={m.mime} />
                <Meta time={timeLabel(m.createdAt)} who={m.who} moment={m.moment} dlala={!!m.dlala} />
              </div>
            ))}
          </div>
          <p className="label" style={{ fontSize: 10 }}>Sample</p>
        </>
      )}

      <div className="grid3">
        {set.clips.map(([time, who, moment, dlala], i) => (
          <div key={i} className={`tile${dlala ? " dlala" : ""}`} style={{ background: tones[i % tones.length] }}>
            <Meta time={time} who={who} moment={moment} dlala={dlala} />
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}

function Meta({ time, who, moment, dlala }: { time: string; who: string; moment: string; dlala: boolean }) {
  return (
    <div className="meta">
      <div className="between" style={{ gap: 4 }}>
        <span className="tiny" style={{ fontWeight: 500 }}>{time}</span>
        <span className="who">{who}</span>
      </div>
      {dlala && <span className="tag">DLALA</span>}
      <span className="tiny" style={{ color: "var(--soft)", fontWeight: 500 }}>{moment}</span>
    </div>
  );
}

export default function Crate() {
  return (
    <Suspense>
      <CrateInner />
    </Suspense>
  );
}
