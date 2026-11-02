"use client";

import Link from "next/link";
import { useState } from "react";
import { Screen } from "@/components/bottom-nav";
import { CameraIcon, InviteIcon, PauseIcon, PlayIcon } from "@/components/icons";
import { shareLink } from "@/components/share";
import { useClips } from "@/lib/clips";
import { useNow } from "@/lib/local";
import { spotifyEmbedUrl, spotifyUrl, trip, tripPhase, tripRange } from "@/lib/trip";

function statusLine(now: number | null) {
  const artist = `${trip.artist.toUpperCase()} × 2`;
  if (now == null) return artist;
  const p = tripPhase(now);
  if (p.phase === "before") {
    return `${p.days} ${p.days === 1 ? "DAY" : "DAYS"} TO TAKEOFF · ${artist}`;
  }
  if (p.phase === "during") {
    return p.day.show ? `LIVE · ${p.day.heading.toUpperCase()} · ${trip.venue.toUpperCase()}` : `LIVE · ${p.day.heading.toUpperCase()}`;
  }
  return "PRESSED · THE FILM IS READY";
}

export default function HomePage() {
  const [playing, setPlaying] = useState(false);
  const [note, setNote] = useState("");
  const clips = useClips();
  const now = useNow();

  const clipCount = clips?.length ?? 0;
  const dlalaCount = clips?.filter((c) => c.dlala).length ?? 0;

  const invite = async () => {
    const result = await shareLink(
      `Side Three · ${trip.title}`,
      `Our ${trip.artist} weekend. Open this and add it to your home screen:`,
    );
    if (result === "copied") {
      setNote("Link copied. Paste it in the group chat.");
      setTimeout(() => setNote(""), 3000);
    }
  };

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ember" aria-hidden />
          <span className="font-serif text-[26px] tracking-[-0.3px]">Side Three</span>
        </div>
        <button
          type="button"
          onClick={invite}
          className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-groove px-4 text-[15px] font-medium"
        >
          <InviteIcon />
          Invite
        </button>
      </header>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-right font-mono text-[11px] text-dust">
        {note}
      </p>

      <p className="mb-3 mt-4 font-mono text-[11px] font-medium tracking-[2.4px] text-dust">
        {playing ? "NOW SPINNING" : "ON THE PLATTER"}
      </p>

      <section className="flex flex-col gap-[18px] rounded-[28px] border border-line bg-sleeve px-5 pb-5 pt-6">
        <Turntable playing={playing} />

        <div className="flex flex-col gap-1.5">
          <h1 className="font-script text-[44px] leading-none">{trip.title}</h1>
          <p className="font-mono text-[12px] tracking-[1px] text-dust">
            {trip.kind.toUpperCase()} · {trip.city.toUpperCase()} · {tripRange()}
          </p>
          <p className="font-mono text-[12px] font-medium tracking-[1px] text-ember">
            {statusLine(now)
              .split(" · ")
              .map((part, i) => (
                <span key={part} className="whitespace-nowrap">
                  {i > 0 ? " · " : ""}
                  {part}
                </span>
              ))}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Lift the needle" : `Play ${trip.playlist.name}`}
            aria-pressed={playing}
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-paper text-ink transition-transform active:scale-95"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="min-w-0 grow">
            <p className="text-[16px] font-semibold">{trip.playlist.name}</p>
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-dust underline-offset-2 hover:text-paper hover:underline">
              Open in Spotify
            </a>
          </div>
          <Link
            href="/capture"
            aria-label="Open camera"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-ember text-ink transition-transform active:scale-95"
          >
            <CameraIcon />
          </Link>
        </div>

        {playing ? (
          <iframe
            title={`${trip.playlist.name} on Spotify`}
            src={spotifyEmbedUrl}
            className="h-[352px] w-full rounded-2xl border-0 bg-groove"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : null}
      </section>

      <div className="mt-3.5 grid grid-cols-3 gap-2">
        <Stat value={clips == null ? "–" : String(clipCount)} label="CLIPS" />
        <Stat value={clips == null ? "–" : `${dlalaCount}/${trip.dlalaTarget}`} label="DLALA SHOTS" />
        <Stat value="2" label="NIGHTS" />
      </div>
      <p className="mt-3 font-mono text-[11px] leading-[1.6] text-dust">
        CLIPS SAVE ON THIS PHONE. SHARED UPLOADS ARE COMING BEFORE THE TRIP.
      </p>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-sleeve p-3">
      <p className="font-serif text-[22px]">{value}</p>
      <p className="mt-0.5 font-mono text-[11px] text-dust">{label}</p>
    </div>
  );
}

function Turntable({ playing }: { playing: boolean }) {
  return (
    <div className="relative flex h-[270px] items-center justify-center" aria-hidden>
      <div className="flex aspect-square h-full items-center justify-center rounded-full bg-[#0f0d0c] shadow-[inset_0_0_0_1px_#2a2521]">
        <div
          className="vinyl flex h-[94%] w-[94%] items-center justify-center rounded-full"
          style={{ animationPlayState: playing ? "running" : "paused" }}
        >
          <div className="relative flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-ember text-[#1a0b05]">
            <span className="font-mono text-[7px] font-medium tracking-[1.6px]">SIDE THREE</span>
            <span className="font-script text-[22px] leading-[1.1]">{trip.label}</span>
            <span className="font-mono text-[7px] font-medium tracking-[1.6px]">{trip.city.toUpperCase()} · 33⅓</span>
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
          </div>
        </div>
      </div>
      <div className="absolute right-0.5 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-[#3a332e] bg-line-strong" />
      <div
        className="absolute right-2.5 top-3.5 h-[168px] w-1 origin-[2px_0] rounded-sm bg-[#b9b0a4] transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `rotate(${playing ? 28 : 6}deg)` }}
      >
        <div className="absolute -bottom-2.5 -left-[5px] h-5 w-3.5 rounded-[3px] bg-[#d8d0c4]" />
      </div>
    </div>
  );
}
