"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, CloseIcon, FlipIcon } from "@/components/Icons";
import { days, dlalaShotList, moments } from "@/lib/trip";
import { currentDayTab, getProfile, listMedia, saveMedia } from "@/lib/store";

function pickMime() {
  const options = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
  if (typeof MediaRecorder === "undefined") return "";
  return options.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

export default function Capture() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [moment, setMoment] = useState("The set");
  const [dlala, setDlala] = useState(true);
  const [day, setDay] = useState("Thu");
  const [saved, setSaved] = useState(0);
  const [shots, setShots] = useState<string[]>([]);
  const [clean, setClean] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDay(currentDayTab());
    listMedia("clip").then((c) => setClean(c.filter((x) => x.dlala).length));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      stream.current?.getTracks().forEach((t) => t.stop());
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true,
        });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream.current = s;
        if (video.current) video.current.srcObject = s;
        setError(null);
      } catch {
        setError("Camera access is off. Allow the camera for this site in your browser settings.");
      }
    }
    start();
    return () => {
      cancelled = true;
    };
  }, [facing]);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  function startRec() {
    if (!stream.current) return;
    const mime = pickMime();
    const rec = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = async () => {
      const type = rec.mimeType || "video/webm";
      const blob = new Blob(chunks.current, { type });
      if (blob.size === 0) return;
      const isSet = moment === "The set";
      await saveMedia({
        kind: "clip",
        who: getProfile()?.initial ?? "I",
        moment: moment.toUpperCase(),
        day,
        mime: type,
        dlala: isSet && dlala,
        blob,
      });
      setSaved((n) => n + 1);
      if (isSet && dlala) setClean((n) => n + 1);
      setToast("Saved to the crate");
      setTimeout(() => setToast(null), 1600);
    };
    rec.start();
    recorder.current = rec;
    setRecording(true);
    setSeconds(0);
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopRec() {
    recorder.current?.stop();
    recorder.current = null;
    setRecording(false);
    if (timer.current) clearInterval(timer.current);
  }

  const dayInfo = days.find((d) => d.tab === day);
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <main className="app bare" style={{ paddingLeft: 16, paddingRight: 16, gap: 14 }}>
      <div className="between">
        <Link href="/" className="icon-btn" aria-label="Close camera"><CloseIcon size={18} /></Link>
        <div style={{ textAlign: "center" }}>
          <p className="script" style={{ fontSize: 26, lineHeight: 1 }}>Ember London</p>
          <p className="mono muted" style={{ fontSize: 11, letterSpacing: 1.2, marginTop: 2 }}>{dayInfo?.date.split(" · ")[0]}</p>
        </div>
        <span className="rec-chip" style={{ visibility: recording ? "visible" : "hidden" }}><span className="dot" />{mmss}</span>
      </div>

      <div className="viewfinder">
        <video ref={video} autoPlay playsInline muted style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }} />
        {error && <p className="mono muted" style={{ position: "relative", fontSize: 12, padding: 24, textAlign: "center" }}>{error}</p>}

        {moment === "The set" && (
          <div className="card" style={{ position: "absolute", left: 14, right: 14, bottom: 52, background: "rgba(16,20,42,0.9)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="between" style={{ alignItems: "baseline" }}>
              <p className="serif" style={{ fontSize: 18 }}>Dlala shot list</p>
              <p className="mono ember" style={{ fontSize: 12, fontWeight: 500 }}>{clean}/10 CLEAN</p>
            </div>
            <div className="grid2" style={{ fontSize: 13 }}>
              {dlalaShotList.map((s) => {
                const done = shots.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => setShots(done ? shots.filter((x) => x !== s) : [...shots, s])}
                    aria-pressed={done}
                    className="row"
                    style={{ gap: 8, background: "none", border: 0, padding: "4px 0", color: done ? "var(--text)" : "var(--muted)", textAlign: "left" }}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, background: done ? "var(--ember)" : "transparent", border: done ? 0 : "1px solid var(--line-strong)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {done && <CheckIcon />}
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>
            <label className="row" style={{ gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={dlala} onChange={(e) => setDlala(e.target.checked)} style={{ accentColor: "var(--ember)", width: 16, height: 16 }} />
              Dlala is in this shot
            </label>
          </div>
        )}
        <p className="mono muted" style={{ position: "absolute", bottom: 18, fontSize: 11, letterSpacing: 1 }}>
          {toast ?? (saved ? `${saved} SAVED · UPLOADS ON WI-FI` : "SAVES TO THIS PHONE")}
        </p>
      </div>

      <div className="pills" role="group" aria-label="Moment">
        {moments.map((m) => (
          <button key={m} className="pill" aria-pressed={moment === m} onClick={() => setMoment(m)}>{m}</button>
        ))}
      </div>

      <div className="between" style={{ padding: "0 12px" }}>
        <Link href="/crate" aria-label="Open the crate" style={{ width: 48, height: 48, borderRadius: 12, background: "var(--tile-1)", border: "1.5px solid var(--line)" }} />
        <button className={`shutter${recording ? " rec" : ""}`} onClick={recording ? stopRec : startRec} aria-label={recording ? "Stop recording" : "Record clip"} disabled={!!error}>
          <span />
        </button>
        <button className="icon-btn" style={{ width: 48, height: 48 }} onClick={() => setFacing(facing === "user" ? "environment" : "user")} aria-label="Flip camera" disabled={recording}>
          <FlipIcon size={20} />
        </button>
      </div>
    </main>
  );
}
