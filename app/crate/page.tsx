"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Screen } from "@/components/bottom-nav";
import { ClipMedia, useClipUrl } from "@/components/clip-media";
import { CloseIcon, DownloadIcon, TrashIcon } from "@/components/icons";
import { deleteClip, extFor, updateClip, useClips, type Clip } from "@/lib/clips";
import { useNow } from "@/lib/local";
import { SOUNDCHECK, dayIndexFor, dayShort, dayStamp, days, moments, trip, type Moment } from "@/lib/trip";

const tones = ["#2a211c", "#3a2418", "#1f1b19", "#33281f", "#241a16", "#2e2420"];

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/London",
});

type Tab = { index: number; short: string; heading: string; sub: string };

export default function CratePage() {
  const clips = useClips();
  const now = useNow();
  const [picked, setPicked] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const hasSoundcheck = clips?.some((c) => c.dayIndex === SOUNDCHECK) ?? false;

  const tabs: Tab[] = useMemo(() => {
    const list: Tab[] = days.map((d) => ({
      index: d.index,
      short: dayShort(d.date),
      heading: d.heading,
      sub: `${dayStamp(d.date)}${d.show ? ` · ${trip.venue.toUpperCase()}` : ""}`,
    }));
    if (hasSoundcheck) {
      list.unshift({ index: SOUNDCHECK, short: "Pre", heading: "Soundcheck", sub: "BEFORE THE TRIP" });
    }
    return list;
  }, [hasSoundcheck]);

  // Default tab: today during the trip, soundcheck before it if there are clips, otherwise the first night.
  const fallback = (() => {
    if (now == null) return days[1].index;
    const today = dayIndexFor(now);
    if (today === SOUNDCHECK) return hasSoundcheck ? SOUNDCHECK : days[1].index;
    return today;
  })();
  const active = picked != null && tabs.some((t) => t.index === picked) ? picked : fallback;
  const tab = tabs.find((t) => t.index === active) ?? tabs[0];

  const dayClips = clips?.filter((c) => c.dayIndex === active) ?? [];
  const open = clips?.find((c) => c.id === openId) ?? null;

  return (
    <Screen>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[2.4px] text-dust">{trip.title.toUpperCase()}</p>
            <h1 className="mt-1 font-serif text-[34px] tracking-[-0.4px]">The crate</h1>
          </div>
          <div className="flex h-8 items-center gap-2 rounded-full border border-line-strong bg-groove px-3 font-mono text-[12px] text-dust">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e2602d" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            {clips == null ? "–" : clips.length} {clips?.length === 1 ? "CLIP" : "CLIPS"}
          </div>
        </div>

        <div role="tablist" aria-label="Trip day" className="flex gap-1.5 rounded-[22px] border border-line bg-sleeve p-1">
          {tabs.map((t) => (
            <button
              key={t.index}
              type="button"
              role="tab"
              aria-selected={t.index === active}
              onClick={() => setPicked(t.index)}
              className={`h-[38px] flex-1 rounded-[18px] text-[13px] font-semibold transition-colors ${
                t.index === active ? "bg-paper text-ink" : "text-dust"
              }`}
            >
              {t.short}
            </button>
          ))}
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="font-script text-[28px] leading-none">{tab.heading}</h2>
          <p className="font-mono text-[11px] text-dust">{tab.sub}</p>
        </div>

        {clips == null ? null : dayClips.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
            <p className="text-[15px]">Nothing pressed for {tab.heading.toLowerCase()} yet.</p>
            <Link href="/capture" className="h-10 rounded-full bg-ember px-4 pt-[9px] text-[14px] font-semibold text-ink">
              Open the camera
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-1.5">
            {dayClips.map((clip, i) => (
              <li key={clip.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(clip.id)}
                  aria-label={`${clip.kind === "photo" ? "Photo" : "Clip"} at ${timeFmt.format(clip.createdAt)}, ${clip.moment}${
                    clip.dlala ? ", Dlala in frame" : ""
                  }`}
                  className="grain relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-xl p-2 text-left"
                  style={{
                    background: tones[i % tones.length],
                    boxShadow: clip.dlala ? "inset 0 0 0 1.5px #e2602d" : undefined,
                  }}
                >
                  <ClipMedia clip={clip} className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" aria-hidden />
                  <span className="relative flex items-center justify-between">
                    <span className="font-mono text-[10px] font-medium tracking-[0.8px]">{timeFmt.format(clip.createdAt)}</span>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold">
                      {clip.by.slice(0, 1).toUpperCase()}
                    </span>
                  </span>
                  <span className="relative flex flex-col items-start gap-1">
                    {clip.dlala ? (
                      <span className="rounded-md bg-ember px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink">DLALA</span>
                    ) : null}
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.8px] text-dust-soft">{clip.moment}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open ? <ClipSheet clip={open} onClose={() => setOpenId(null)} /> : null}
    </Screen>
  );
}

function ClipSheet({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const url = useClipUrl(clip);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const remove = async () => {
    await deleteClip(clip.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Clip"
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-[480px] flex-col bg-ink"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
      }}
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-2">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-groove"
        >
          <CloseIcon />
        </button>
        <p className="font-mono text-[11px] tracking-[1.4px] text-dust">
          {timeFmt.format(clip.createdAt)} · {clip.by.toUpperCase()}
        </p>
        {url ? (
          <a
            href={url}
            download={`side-three-${clip.id}.${extFor(clip.mime)}`}
            aria-label="Save to this phone"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-groove"
          >
            <DownloadIcon />
          </a>
        ) : (
          <span className="h-11 w-11" />
        )}
      </div>

      <div className="relative mx-4 min-h-0 grow overflow-hidden rounded-[24px] bg-[#141110]">
        <ClipMedia clip={clip} controls className="absolute inset-0 h-full w-full object-contain" />
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="radiogroup" aria-label="Moment">
          {moments.map((m: Moment) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={clip.moment === m}
              onClick={() => updateClip(clip.id, { moment: m, dlala: m === "The set" ? clip.dlala : false })}
              className={`h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] ${
                clip.moment === m ? "bg-paper font-semibold text-ink" : "border border-line-strong bg-groove font-medium text-dust"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {clip.moment === "The set" ? (
            <label className="flex h-11 grow items-center justify-between rounded-full border border-line-strong bg-groove px-4 text-[14px]">
              Dlala in frame
              <input
                type="checkbox"
                checked={clip.dlala}
                onChange={(e) => updateClip(clip.id, { dlala: e.target.checked })}
                className="h-5 w-5 accent-[#e2602d]"
              />
            </label>
          ) : (
            <span className="grow" />
          )}
          {confirming ? (
            <>
              <button type="button" onClick={() => setConfirming(false)} className="h-11 rounded-full px-4 text-[14px] text-dust">
                Keep
              </button>
              <button type="button" onClick={remove} className="h-11 rounded-full bg-[#b8463a] px-4 text-[14px] font-semibold text-paper">
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Delete clip"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-groove text-dust"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
