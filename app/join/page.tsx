"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Record from "@/components/Record";
import { CloseIcon } from "@/components/Icons";
import { trip } from "@/lib/trip";
import { getProfile, setProfile } from "@/lib/store";

export default function Join() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    const p = getProfile();
    if (p) setName(p.name);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setProfile({ name: clean, initial: clean[0].toUpperCase() });
    router.push("/trip");
  }

  return (
    <main className="app bare">
      <div className="between">
        <Link href="/" className="icon-btn" aria-label="Close"><CloseIcon size={18} /></Link>
        <p className="label">You're invited</p>
        <span style={{ width: 44 }} />
      </div>

      <div className="drop-in"><Record playing title="Ember" /></div>

      <div className="stack fade-up" style={{ gap: 6, textAlign: "center" }}>
        <p className="script" style={{ fontSize: 48, lineHeight: 0.9 }}>{trip.title}</p>
        <p className="mono muted" style={{ fontSize: 12, letterSpacing: 1 }}>{trip.subtitle.toUpperCase()}</p>
        <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>Everything we shoot goes into one film. Add your name so your clips are credited to you.</p>
      </div>

      <form onSubmit={submit} className="stack" style={{ marginTop: "auto" }}>
        <label className="field">
          <span>Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="First name" required />
        </label>
        <button className="btn ember block" type="submit" disabled={!name.trim()}>Join the record</button>
      </form>
    </main>
  );
}
