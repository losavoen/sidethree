"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BackIcon, MicIcon } from "@/components/Icons";
import { currentDayTab, getLinerNotes, getProfile, listMedia, saveLinerNote, saveMedia, timeLabel, type MediaRecord } from "@/lib/store";

const QUESTION = "What does this music do to you?";

export default function Notes() {
  const [line, setLine] = useState("");
  const [savedLine, setSavedLine] = useState(false);
  const [voices, setVoices] = useState<MediaRecord[]>([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const load = () => listMedia("voice").then(setVoices);

  useEffect(() => {
    const p = getProfile();
    const mine = getLinerNotes().find((n) => n.who === (p?.initial ?? "I"));
    if (mine) setLine(mine.text);
    load();
  }, []);

  function saveLine(e: React.FormEvent) {
    e.preventDefault();
    if (!line.trim()) return;
    saveLinerNote({ who: getProfile()?.initial ?? "I", text: line.trim() });
    setSavedLine(true);
    setTimeout(() => setSavedLine(false), 1600);
  }

  async function toggleVoice() {
    if (recording) {
      rec.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" });
        if (!blob.size) return;
        await saveMedia({ kind: "voice", who: getProfile()?.initial ?? "I", moment: "VOICE NOTE", day: currentDayTab(), mime: blob.type, blob });
        load();
      };
      r.start();
      rec.current = r;
      setRecording(true);
      setError(null);
    } catch {
      setError("Microphone access is off. Allow it for this site in your browser settings.");
    }
  }

  return (
    <main className="app bare">
      <div className="between">
        <Link href="/trip" className="icon-btn" aria-label="Back"><BackIcon size={18} /></Link>
        <p className="label">For the documentary</p>
        <span style={{ width: 44 }} />
      </div>
      <h1 className="title">Notes</h1>

      <section className="card stack" style={{ padding: 18, gap: 14 }}>
        <div>
          <p className="label" style={{ fontSize: 10 }}>Voice note</p>
          <p className="display" style={{ fontSize: 26, lineHeight: 1.05, marginTop: 6 }}>{QUESTION}</p>
        </div>
        <button className={`btn block ${recording ? "light" : "ember"}`} onClick={toggleVoice}>
          {recording ? <><span className="dot" />Stop recording</> : <><MicIcon size={18} />Record an answer</>}
        </button>
        {error && <p className="muted" style={{ fontSize: 13 }}>{error}</p>}
        {voices.length > 0 && (
          <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 8 }}>
            {voices.map((v) => <VoiceRow key={v.id} v={v} />)}
          </ul>
        )}
      </section>

      <form onSubmit={saveLine} className="card stack" style={{ padding: 18, gap: 12 }}>
        <div>
          <p className="label" style={{ fontSize: 10 }}>Liner note</p>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>One line about the trip. It rolls in the credits and goes on your sleeve.</p>
        </div>
        <label className="field">
          <span className="sr-only">Your liner note</span>
          <input value={line} onChange={(e) => setLine(e.target.value)} maxLength={120} placeholder="One line" />
        </label>
        <button className="btn block" type="submit" disabled={!line.trim()}>{savedLine ? "Saved" : "Save my line"}</button>
      </form>
    </main>
  );
}

function VoiceRow({ v }: { v: MediaRecord }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(v.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [v.blob]);
  return (
    <li className="stack" style={{ gap: 6 }}>
      <p className="mono muted" style={{ fontSize: 11 }}>{v.who} · {v.day.toUpperCase()} · {timeLabel(v.createdAt)}</p>
      {url && <audio src={url} controls style={{ width: "100%", height: 36 }} />}
    </li>
  );
}
