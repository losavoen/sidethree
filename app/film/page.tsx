"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Screen } from "@/components/bottom-nav";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { buildArchive, deliver } from "@/lib/archive";
import { extFor, useClips } from "@/lib/clips";
import { Reel, grades, lengths, planReel, reelMs, type GradeId, type LengthId } from "@/lib/reel";
import { spotifyUrl, trip } from "@/lib/trip";

type Busy = null | "pressing" | "packing";

function mmss(ms: number) {
  const s = Math.round(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function FilmPage() {
  const clips = useClips();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reelRef = useRef<Reel | null>(null);

  const [length, setLength] = useState<LengthId>("150");
  const [grade, setGrade] = useState<GradeId>("ember");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState("");

  const seconds = lengths.find((l) => l.id === length)!.seconds;
  const segments = useMemo(() => (clips ? planReel(clips, seconds) : []), [clips, seconds]);
  const total = reelMs(segments);
  const hasClips = segments.length > 0;

  // Draw the title card whenever the settings change and nothing is playing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reelRef.current) return;
    new Reel(canvas, segments, grade).poster();
  }, [segments, grade]);

  // Stop playback when leaving the screen.
  useEffect(() => () => reelRef.current?.stop(), []);

  const stop = () => {
    reelRef.current?.stop();
    reelRef.current = null;
    setPlaying(false);
  };

  const play = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasClips) return;
    const reel = new Reel(canvas, segments, grade, setProgress);
    reelRef.current = reel;
    setPlaying(true);
    await reel.play();
    if (reelRef.current === reel) {
      reelRef.current = null;
      setPlaying(false);
    }
  };

  const press = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasClips || typeof MediaRecorder === "undefined" || !canvas.captureStream) {
      setMessage("This browser can't save the film. Try Chrome or Safari on your phone.");
      return;
    }
    stop();
    setBusy("pressing");
    setMessage(`Pressing in real time · ${mmss(total)}. Keep this screen open.`);
    const reel = new Reel(canvas, segments, grade, setProgress);
    reelRef.current = reel;
    try {
      const blob = await reel.record();
      await deliver(blob, `Side Three - ${trip.title} - 9x16.${extFor(blob.type)}`);
      setMessage("Film saved.");
    } catch {
      setMessage("The press stopped before finishing. Try again with the screen awake.");
    } finally {
      reelRef.current = null;
      setBusy(null);
    }
  };

  const exportArchive = async () => {
    if (!clips?.length) return;
    setBusy("packing");
    setMessage(`Packing ${clips.length} files…`);
    try {
      const blob = await buildArchive(clips);
      await deliver(blob, `Side Three - ${trip.title} - archive.zip`);
      setMessage("Archive ready.");
    } catch {
      setMessage("Couldn't pack the archive. The phone may be low on memory; try fewer clips.");
    } finally {
      setBusy(null);
    }
  };

  const pct = total ? Math.min(100, (progress / total) * 100) : 0;

  return (
    <Screen>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[2.4px] text-ember-soft">
              {hasClips ? `${segments.length} CLIPS ON THE REEL` : "NOTHING PRESSED YET"}
            </p>
            <h1 className="mt-1 font-serif text-[34px] tracking-[-0.4px]">The film</h1>
          </div>
        </div>

        <div className="grain relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[24px] border border-[#2e2420] bg-[#1a130f]">
          <canvas ref={canvasRef} className="h-full w-full" aria-label={`${trip.title} film preview`} role="img" />
          {!playing && !busy ? (
            <button
              type="button"
              onClick={play}
              disabled={!hasClips}
              aria-label="Play film"
              className="absolute left-1/2 top-[68%] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-paper text-ink transition-transform active:scale-95 disabled:opacity-40"
            >
              <PlayIcon size={22} />
            </button>
          ) : playing && !busy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop film"
              className="absolute bottom-4 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-paper"
            >
              <PauseIcon />
            </button>
          ) : null}
          <span className="absolute right-4 top-4 rounded-full bg-ink/60 px-2 py-0.5 font-mono text-[11px] text-dust-soft">
            {mmss(playing || busy ? progress : total)}
          </span>
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#2e2420]">
            <div className="h-[3px] bg-ember" style={{ width: `${playing || busy ? pct : 0}%` }} />
          </div>
        </div>

        {!hasClips && clips != null ? (
          <p className="text-center text-[14px] text-dust">
            Shoot a few clips and the reel builds itself.{" "}
            <Link href="/capture" className="text-paper underline underline-offset-2">
              Open the camera
            </Link>
          </p>
        ) : null}

        <fieldset className="flex flex-col gap-2" disabled={busy != null}>
          <legend className="mb-2 font-mono text-[11px] font-medium tracking-[2px] text-dust">LENGTH</legend>
          <div className="flex gap-2">
            {lengths.map((l) => (
              <Chip key={l.id} active={length === l.id} onClick={() => setLength(l.id)}>
                {l.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2" disabled={busy != null}>
          <legend className="mb-2 font-mono text-[11px] font-medium tracking-[2px] text-dust">GRADE</legend>
          <div className="flex gap-2">
            {(Object.keys(grades) as GradeId[]).map((g) => (
              <Chip key={g} active={grade === g} onClick={() => setGrade(g)}>
                {grades[g].label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3 rounded-[18px] border border-line bg-sleeve px-3.5 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d1917]" aria-hidden>
            <div className="h-3.5 w-3.5 rounded-full bg-ember" />
          </div>
          <div className="min-w-0 grow">
            <p className="text-[15px] font-semibold">Scored to {trip.playlist.name}</p>
            <p className="mt-0.5 text-[13px] text-dust">Start the playlist, then press play on the film.</p>
          </div>
          <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-paper underline underline-offset-2">
            Spotify
          </a>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={press}
            disabled={!hasClips || busy != null}
            className="h-[50px] flex-1 rounded-full bg-ember text-[15px] font-semibold text-ink disabled:opacity-40"
          >
            {busy === "pressing" ? "Pressing…" : "Save 9:16"}
          </button>
          <button
            type="button"
            onClick={exportArchive}
            disabled={!clips?.length || busy != null}
            className="h-[50px] flex-1 rounded-full border border-line-strong bg-groove text-[15px] font-semibold disabled:opacity-40"
          >
            {busy === "packing" ? "Packing…" : "Export archive"}
          </button>
        </div>
        <p role="status" aria-live="polite" className="min-h-5 text-center font-mono text-[11px] leading-[1.6] text-dust">
          {message}
        </p>
      </div>
    </Screen>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 rounded-full px-3.5 text-[13px] ${
        active ? "bg-paper font-semibold text-ink" : "border border-line-strong bg-groove font-medium text-dust"
      }`}
    >
      {children}
    </button>
  );
}
