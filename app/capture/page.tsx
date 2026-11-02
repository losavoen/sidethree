"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipMedia } from "@/components/clip-media";
import { CheckIcon, CloseIcon, FlipIcon, ImageIcon } from "@/components/icons";
import { newId, saveClip, useClips } from "@/lib/clips";
import { useLocal } from "@/lib/local";
import {
  SOUNDCHECK,
  dayIndexFor,
  dayStamp,
  days,
  moments,
  shotList,
  suggestMoment,
  trip,
  type Moment,
} from "@/lib/trip";

type CamState = "starting" | "live" | "blocked" | "unsupported";
type Mode = "video" | "photo";

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const options = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
  return options.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

function clock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function dayLine(time: number) {
  const index = dayIndexFor(time);
  if (index === SOUNDCHECK) return "SOUNDCHECK · BEFORE THE TRIP";
  const day = days[index];
  return `${dayStamp(day.date)} · ${day.heading.toUpperCase()}`;
}

export default function CapturePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [cam, setCam] = useState<CamState>("starting");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [mode, setMode] = useState<Mode>("video");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [openedAt] = useState(() => Date.now());
  const [moment, setMoment] = useState<Moment>(() => suggestMoment(Date.now()));
  const [dlala, setDlala] = useState(false);
  const [toast, setToast] = useState("");
  const [ticks, setTicks] = useLocal<string[]>("shot-list", []);
  const [name] = useLocal<string>("name", "");

  const clips = useClips();
  const dlalaCount = clips?.filter((c) => c.dlala).length ?? 0;
  const last = clips && clips.length > 0 ? clips[clips.length - 1] : null;
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Start (or restart) the camera when the facing direction changes.
  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      queueMicrotask(() => setCam("unsupported"));
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        stopStream();
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCam("live");
      })
      .catch(() => {
        if (!cancelled) setCam("blocked");
      });
    return () => {
      cancelled = true;
    };
  }, [facing, stopStream]);

  // Release the camera when leaving the screen.
  useEffect(() => stopStream, [stopStream]);

  // Recording timer.
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed(Date.now() - startedRef.current), 250);
    return () => clearInterval(id);
  }, [recording]);

  const flash = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  };

  const store = async (blob: Blob, kind: "video" | "photo", durationMs?: number, shotAt?: number) => {
    const createdAt = shotAt ?? Date.now();
    const clipMoment = shotAt ? suggestMoment(shotAt) : moment;
    try {
      await saveClip({
        id: newId(),
        kind,
        mime: blob.type || (kind === "photo" ? "image/jpeg" : "video/mp4"),
        blob,
        createdAt,
        dayIndex: dayIndexFor(createdAt),
        moment: clipMoment,
        dlala: !shotAt && clipMoment === "The set" && dlala,
        durationMs,
        by: name.trim() || "Me",
      });
      flash(kind === "photo" ? "Photo saved to the crate" : "Clip saved to the crate");
    } catch {
      flash("Couldn't save. Phone storage may be full.");
    }
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = pickMime();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 6_000_000 } : undefined);
    } catch {
      flash("This browser can't record here. Use the photo library button.");
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const duration = Date.now() - startedRef.current;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "video/mp4" });
      if (blob.size > 0) store(blob, "video", duration);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    startedRef.current = Date.now();
    setElapsed(0);
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && store(blob, "photo"), "image/jpeg", 0.92);
  };

  const shutter = () => {
    if (mode === "photo") return takePhoto();
    if (recording) stopRecording();
    else startRecording();
  };

  const fromLibrary = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      // Camera-roll files keep the time they were shot, so they land on the right day.
      await store(file, file.type.startsWith("image/") ? "photo" : "video", undefined, file.lastModified || Date.now());
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleTick = (id: string) =>
    setTicks(ticks.includes(id) ? ticks.filter((t) => t !== id) : [...ticks, id]);

  return (
    <main
      className="flex min-h-dvh flex-col gap-3.5 px-4"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
      }}
    >
      <header className="flex items-center justify-between pt-6">
        <Link
          href="/"
          aria-label="Close camera"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-groove"
        >
          <CloseIcon />
        </Link>
        <div className="text-center">
          <p className="font-script text-[26px] leading-none">{trip.title}</p>
          <p className="mt-0.5 font-mono text-[11px] tracking-[1.2px] text-dust">{dayLine(openedAt)}</p>
        </div>
        <div
          className={`flex h-8 min-w-[72px] items-center justify-center gap-1.5 rounded-full px-3 font-mono text-[12px] ${
            recording ? "bg-ember-deep text-ember-soft" : "bg-groove text-dust"
          }`}
          aria-live="off"
        >
          <span className={`h-[7px] w-[7px] rounded-full ${recording ? "animate-pulse bg-ember" : "bg-dust/50"}`} aria-hidden />
          {clock(recording ? elapsed : 0)}
        </div>
      </header>

      <section className="relative flex min-h-[420px] grow items-center justify-center overflow-hidden rounded-[28px] border border-line bg-[#141110]">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""} ${
            cam === "live" ? "opacity-100" : "opacity-0"
          }`}
        />
        <Corners />

        {cam !== "live" ? (
          <div className="relative z-10 flex max-w-[260px] flex-col items-center gap-3 text-center">
            {cam === "starting" ? (
              <p className="font-mono text-[12px] tracking-[1.4px] text-dust">WARMING UP THE CAMERA</p>
            ) : (
              <>
                <p className="text-[15px] leading-snug">
                  {cam === "blocked"
                    ? "Camera access is off for this site. Allow it in your browser settings, or add clips from your camera roll."
                    : "This browser can't open the camera here. Add clips from your camera roll instead."}
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="h-10 rounded-full bg-paper px-4 text-[14px] font-semibold text-ink"
                >
                  Add from camera roll
                </button>
              </>
            )}
          </div>
        ) : null}

        {moment === "The set" ? (
          <div className="absolute inset-x-3.5 bottom-14 z-10 flex flex-col gap-2.5 rounded-[18px] border border-line-strong bg-ink/90 px-4 py-3.5 backdrop-blur">
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-[18px]">Dlala shot list</p>
              <p className="font-mono text-[12px] font-medium text-ember-soft">
                {dlalaCount}/{trip.dlalaTarget} CLEAN
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              {shotList.map((shot) => {
                const done = ticks.includes(shot.id);
                return (
                  <button
                    key={shot.id}
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => toggleTick(shot.id)}
                    className={`flex items-center gap-2 text-left ${done ? "text-paper" : "text-dust"}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] ${
                        done ? "bg-ember text-ink" : "border border-[#5a524b]"
                      }`}
                    >
                      {done ? <CheckIcon /> : null}
                    </span>
                    {shot.label}
                  </button>
                );
              })}
            </div>
            <label className="mt-1 flex items-center justify-between border-t border-line pt-2.5 text-[13px]">
              <span>Dlala in frame on this clip</span>
              <input
                type="checkbox"
                checked={dlala}
                onChange={(e) => setDlala(e.target.checked)}
                className="h-5 w-5 accent-[#e2602d]"
              />
            </label>
          </div>
        ) : null}

        <p
          role="status"
          aria-live="polite"
          className="absolute bottom-5 z-10 rounded-full bg-ink/70 px-3 py-1 font-mono text-[11px] tracking-[1px] text-dust"
        >
          {toast || "SAVES ON THIS PHONE"}
        </p>
      </section>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="radiogroup" aria-label="Moment">
        {moments.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={moment === m}
            onClick={() => setMoment(m)}
            className={`h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] ${
              moment === m ? "bg-paper font-semibold text-ink" : "border border-line-strong bg-groove font-medium text-dust"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1 font-mono text-[11px] tracking-[1.4px]" role="radiogroup" aria-label="Capture mode">
        {(["video", "photo"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            disabled={recording}
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 uppercase ${mode === m ? "text-ember-soft" : "text-dust"}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Link
            href="/crate"
            aria-label="Open the crate"
            className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#3a302a] bg-[#2a211c]"
          >
            {last ? <ClipMedia clip={last} className="h-full w-full object-cover" /> : null}
          </Link>
          <button
            type="button"
            aria-label="Add from camera roll"
            onClick={() => fileRef.current?.click()}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-groove text-paper"
          >
            <ImageIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={shutter}
          disabled={cam !== "live"}
          aria-label={mode === "photo" ? "Take photo" : recording ? "Stop recording" : "Record clip"}
          className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-paper transition-transform active:scale-95 disabled:opacity-40"
        >
          <span
            className={`bg-ember transition-all duration-200 ${
              mode === "photo" ? "h-16 w-16 rounded-full bg-paper" : recording ? "h-7 w-7 rounded-md" : "h-[60px] w-[60px] rounded-full"
            }`}
          />
        </button>

        <button
          type="button"
          aria-label="Flip camera"
          disabled={recording || cam !== "live"}
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-groove disabled:opacity-40"
        >
          <FlipIcon />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*,image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => fromLibrary(e.target.files)}
      />
    </main>
  );
}

function Corners() {
  const c = "absolute h-7 w-7 border-paper z-[1]";
  return (
    <div aria-hidden>
      <div className={`${c} left-[18px] top-[18px] rounded-tl-md border-l-2 border-t-2`} />
      <div className={`${c} right-[18px] top-[18px] rounded-tr-md border-r-2 border-t-2`} />
      <div className={`${c} bottom-[18px] left-[18px] rounded-bl-md border-b-2 border-l-2`} />
      <div className={`${c} bottom-[18px] right-[18px] rounded-br-md border-b-2 border-r-2`} />
    </div>
  );
}
