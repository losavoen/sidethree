"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Record from "@/components/Record";
import { CloseIcon } from "@/components/Icons";
import { setPressed } from "@/lib/store";

// The reveal: the record stops, the film is pressed, everyone sees it at once.
const steps = ["The record stops spinning", "Cutting on the triple pulse", "Inking the nights in pink", "Pressing Side Three"];

export default function Press() {
  const [step, setStep] = useState(0);
  const done = step >= steps.length;

  useEffect(() => {
    if (done) {
      setPressed(true);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [step, done]);

  return (
    <main className="app bare" style={{ justifyContent: "space-between" }}>
      <div className="between">
        <Link href="/film" className="icon-btn" aria-label="Close"><CloseIcon size={18} /></Link>
        <p className="label ember">{done ? "Pressed" : "Pressing"}</p>
        <span style={{ width: 44 }} />
      </div>

      <div className={done ? "drop-in" : ""}>
        <Record playing={!done && step > 0} />
      </div>

      <div className="stack" style={{ textAlign: "center", gap: 10, minHeight: 150 }} aria-live="polite">
        {done ? (
          <div className="fade-up stack" style={{ gap: 6 }}>
            <p className="mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--soft)" }}>SIDE THREE</p>
            <p className="script" style={{ fontSize: 64, lineHeight: 0.88 }}>Ember<br />London</p>
            <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>You had to be there.</p>
          </div>
        ) : (
          <p key={step} className="fade-up serif" style={{ fontSize: 24 }}>{steps[step]}</p>
        )}
      </div>

      <Link href="/film" className="btn ember block" aria-disabled={!done} style={{ visibility: done ? "visible" : "hidden" }}>
        Watch the film
      </Link>
    </main>
  );
}
