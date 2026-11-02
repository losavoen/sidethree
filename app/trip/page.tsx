"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { MicIcon } from "@/components/Icons";
import { days, trip } from "@/lib/trip";
import { getDetails, getProfile, type Profile, type TripDetails } from "@/lib/store";

export default function Trip() {
  const [details, setDetailsState] = useState<TripDetails | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);

  useEffect(() => {
    setDetailsState(getDetails());
    setProfileState(getProfile());
  }, []);

  // Until accounts exist, a girl who joined on this phone takes the first open seat.
  const girls = trip.girls.map((g) => g);
  if (profile && !girls.some((g) => g.name === profile.name)) {
    const open = girls.findIndex((g) => g.name.startsWith("["));
    if (open > -1) girls[open] = { initial: profile.initial, name: profile.name };
  }

  return (
    <main className="app">
      <div>
        <p className="label">London · 11–15 Feb · 5 days</p>
        <h1 className="title">The trip</h1>
      </div>

      <div className="between">
        <div className="row" style={{ gap: 0 }}>
          {girls.map((g, i) => (
            <span
              key={i}
              title={g.name}
              style={{
                width: 44, height: 44, marginLeft: i ? -10 : 0, borderRadius: "50%", border: "2px solid var(--bg)",
                background: i === 0 ? "var(--ember)" : ["#2a211c", "#33281f", "#241a16"][(i - 1) % 3],
                color: i === 0 ? "var(--bg)" : "var(--soft)", fontWeight: 600, fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {g.initial}
            </span>
          ))}
        </div>
        <Link href="/notes" className="btn"><MicIcon size={18} />Notes</Link>
      </div>

      <div className="grid2">
        <Link href="/trip/details" className="card" style={{ borderRadius: 16, padding: "12px 14px", textDecoration: "none" }}>
          <p className="label" style={{ fontSize: 10, letterSpacing: 1.6 }}>Flights</p>
          <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{details?.flight || trip.flight.out}</p>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{details?.lands ? `Lands ${details.lands}` : trip.flight.detail}</p>
        </Link>
        <Link href="/trip/details" className="card" style={{ borderRadius: 16, padding: "12px 14px", textDecoration: "none" }}>
          <p className="label" style={{ fontSize: 10, letterSpacing: 1.6 }}>The stay</p>
          <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{details?.stay || trip.stay.name}</p>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{details?.checkIn ? `Check-in ${details.checkIn}` : trip.stay.detail}</p>
        </Link>
      </div>

      <div className="between" style={{ alignItems: "baseline" }}>
        <p className="script" style={{ fontSize: 30, lineHeight: 1 }}>Tracklist</p>
        <p className="mono muted" style={{ fontSize: 11 }}>ONE DAY PER TRACK</p>
      </div>

      <ol className="card" style={{ listStyle: "none", margin: 0, padding: 0, overflow: "hidden" }}>
        {days.map((d, i) => (
          <li
            key={d.track}
            className="row"
            style={{ gap: 14, padding: "14px 16px", borderBottom: i < days.length - 1 ? "1px solid #231f1c" : 0, background: d.show ? "var(--ember-deep)" : undefined }}
          >
            <span className={`mono ${d.show ? "ember" : "muted"}`} style={{ width: 26, fontSize: 12, fontWeight: 500 }}>{d.track}</span>
            <Link href={`/crate?day=${d.tab}`} style={{ flexGrow: 1, textDecoration: "none" }}>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{d.title}</p>
              <p className={`mono ${d.show ? "ember" : "muted"}`} style={{ fontSize: 11, marginTop: 2 }}>{d.date}</p>
            </Link>
            {d.show && (
              <Link href={`/fits?day=${d.tab}`} className="mono" style={{ height: 30, padding: "0 10px", borderRadius: 15, background: "var(--ember)", color: "var(--bg)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", textDecoration: "none" }}>
                FITS
              </Link>
            )}
          </li>
        ))}
      </ol>

      <BottomNav />
    </main>
  );
}
