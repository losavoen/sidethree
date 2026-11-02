"use client";

import { useState } from "react";
import { Screen } from "@/components/bottom-nav";
import { shareLink } from "@/components/share";
import { useLocal, useNow } from "@/lib/local";
import { dayStamp, days, trip, tripPhase, tripRange } from "@/lib/trip";

type TripNotes = {
  flightOut: string;
  flightBack: string;
  stay: string;
  checkIn: string;
  londonDay: string;
};

const emptyNotes: TripNotes = { flightOut: "", flightBack: "", stay: "", checkIn: "", londonDay: "" };

export default function TripPage() {
  const [notes, setNotes] = useLocal<TripNotes>("trip-notes", emptyNotes);
  const [name, setName] = useLocal<string>("name", "");
  const [note, setNote] = useState("");
  const now = useNow();
  const today = now != null ? tripPhase(now) : null;

  const update = (key: keyof TripNotes) => (value: string) => setNotes({ ...notes, [key]: value });

  const invite = async () => {
    const result = await shareLink(`Side Three · ${trip.title}`, "Join our Side Three for London:");
    if (result === "copied") {
      setNote("Link copied");
      setTimeout(() => setNote(""), 2500);
    }
  };

  return (
    <Screen>
      <div className="flex flex-col gap-[18px]">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[2.4px] text-dust">
            {trip.city.toUpperCase()} · {tripRange()} · {days.length} DAYS
          </p>
          <h1 className="mt-1 font-serif text-[34px] tracking-[-0.4px]">The trip</h1>
        </div>

        <div className="flex items-center justify-between">
          <p className="max-w-[60%] text-[14px] leading-snug text-dust">
            Send the link to the girls. Everyone adds it to their home screen.
          </p>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={invite}
              className="h-10 rounded-full border border-line-strong bg-groove px-3.5 text-[14px] font-medium"
            >
              Invite the girls
            </button>
            <span role="status" aria-live="polite" className="min-h-4 font-mono text-[10px] text-dust">
              {note}
            </span>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-line bg-sleeve px-3.5 py-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember text-[16px] font-semibold text-ink" aria-hidden>
            {(name.trim() || "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="font-mono text-[10px] font-medium tracking-[1.6px] text-dust">YOUR NAME ON CLIPS</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add your name"
              autoComplete="given-name"
              className="w-full bg-transparent text-[15px] font-semibold text-paper placeholder:text-dust focus:outline-none"
            />
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <NoteCard label="FLIGHTS">
            <Field label="Flight out" placeholder="Out · flight no." value={notes.flightOut} onChange={update("flightOut")} strong />
            <Field label="Flight home" placeholder="Home · flight no." value={notes.flightBack} onChange={update("flightBack")} />
          </NoteCard>
          <NoteCard label="THE STAY">
            <Field label="Where we're staying" placeholder="Where we're staying" value={notes.stay} onChange={update("stay")} strong />
            <Field label="Check-in time" placeholder="Check-in time" value={notes.checkIn} onChange={update("checkIn")} />
          </NoteCard>
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="font-script text-[30px] leading-none">Tracklist</h2>
          <p className="font-mono text-[11px] text-dust">ONE DAY PER TRACK</p>
        </div>

        <ol className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-sleeve">
          {days.map((day, i) => {
            const isToday = today?.phase === "during" && today.day.index === day.index;
            const title = day.index === 3 && notes.londonDay ? notes.londonDay : day.title;
            return (
              <li
                key={day.date}
                aria-current={isToday ? "date" : undefined}
                className={`flex items-center gap-3.5 px-4 py-3.5 ${i < days.length - 1 ? "border-b border-[#231f1c]" : ""} ${
                  day.show ? "bg-[#1e1512]" : ""
                }`}
              >
                <span className={`w-[26px] font-mono text-[12px] font-medium ${day.show ? "text-ember-soft" : "text-dust"}`}>
                  {day.side}
                </span>
                <div className="min-w-0 grow">
                  {day.index === 3 ? (
                    <input
                      aria-label="Plan for our London day"
                      value={notes.londonDay}
                      onChange={(e) => update("londonDay")(e.target.value)}
                      placeholder={day.title}
                      className="w-full bg-transparent text-[15px] font-semibold text-paper placeholder:text-paper focus:placeholder:text-dust focus:outline-none"
                    />
                  ) : (
                    <p className="text-[15px] font-semibold">{title}</p>
                  )}
                  <p className={`mt-0.5 font-mono text-[11px] ${day.show ? "text-ember-soft" : "text-dust"}`}>
                    {dayStamp(day.date)}
                    {day.show ? ` · ${trip.artist.toUpperCase()}` : ""}
                    {isToday ? " · TODAY" : ""}
                  </p>
                </div>
                {day.show ? (
                  <span className="flex h-[26px] items-center rounded-full bg-ember px-2.5 font-mono text-[11px] font-semibold text-ink">
                    FITS
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="font-mono text-[11px] text-dust">NOTES SAVE ON THIS PHONE.</p>
      </div>
    </Screen>
  );
}

function NoteCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-sleeve px-3.5 py-3">
      <p className="font-mono text-[10px] font-medium tracking-[1.6px] text-dust">{label}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  strong = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  strong?: boolean;
}) {
  return (
    <input
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent placeholder:text-dust focus:outline-none ${
        strong ? "text-[14px] font-semibold text-paper" : "text-[13px] text-dust"
      }`}
    />
  );
}
