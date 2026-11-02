"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackIcon } from "@/components/Icons";
import { getDetails, setDetails, type TripDetails } from "@/lib/store";

const empty: TripDetails = { flight: "", lands: "", stay: "", checkIn: "" };

export default function Details() {
  const router = useRouter();
  const [form, setForm] = useState<TripDetails>(empty);

  useEffect(() => {
    setForm(getDetails() ?? empty);
  }, []);

  const set = (k: keyof TripDetails) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  function save(e: React.FormEvent) {
    e.preventDefault();
    setDetails(form);
    router.push("/trip");
  }

  return (
    <main className="app bare">
      <div className="between">
        <Link href="/trip" className="icon-btn" aria-label="Back"><BackIcon size={18} /></Link>
        <p className="label">Flights and stay</p>
        <span style={{ width: 44 }} />
      </div>
      <h1 className="title">Getting there</h1>

      <form onSubmit={save} className="stack" style={{ gap: 16 }}>
        <label className="field"><span>Your flight</span><input value={form.flight} onChange={set("flight")} placeholder="e.g. BA 192, Wed 11 Feb" /></label>
        <label className="field"><span>Lands in London</span><input value={form.lands} onChange={set("lands")} placeholder="e.g. 07:15 Heathrow T5" /></label>
        <label className="field"><span>Where we're staying</span><input value={form.stay} onChange={set("stay")} placeholder="Name or neighbourhood" /></label>
        <label className="field"><span>Check-in</span><input value={form.checkIn} onChange={set("checkIn")} placeholder="e.g. 15:00" /></label>
        <button className="btn ember block" type="submit" style={{ marginTop: 8 }}>Save</button>
      </form>
    </main>
  );
}
