/** Everything specific to this session ("record"). Edit here for the next trip. */

export const trip = {
  slug: "ember-london",
  title: "Ember London",
  label: "Ember",
  city: "London",
  kind: "A girls' trip",
  // Local London dates (GMT in February).
  start: "2027-02-11",
  end: "2027-02-15",
  artist: "Dlala Thukzin",
  venue: "Roundhouse",
  dlalaTarget: 10,
  playlist: {
    name: "three steps forward",
    id: "6nVE5YsGJgZkczU6wE9S9C",
  },
} as const;

export const spotifyUrl = `https://open.spotify.com/playlist/${trip.playlist.id}`;
export const spotifyEmbedUrl = `https://open.spotify.com/embed/playlist/${trip.playlist.id}?utm_source=generator&theme=0`;

export type TripDay = {
  index: number;
  date: string; // YYYY-MM-DD
  side: string; // A1, A2…
  title: string;
  heading: string; // crate heading
  show: boolean;
};

export const days: TripDay[] = [
  { index: 0, date: "2027-02-11", side: "A1", title: "Fly out, land in London", heading: "Takeoff", show: false },
  { index: 1, date: "2027-02-12", side: "A2", title: `Night one at the ${trip.venue}`, heading: "Night one", show: true },
  { index: 2, date: "2027-02-13", side: "B1", title: `Night two at the ${trip.venue}`, heading: "Night two", show: true },
  { index: 3, date: "2027-02-14", side: "B2", title: "Our London day", heading: "London day", show: false },
  { index: 4, date: "2027-02-15", side: "B3", title: "Fly home", heading: "Flight home", show: false },
];

export const moments = [
  "Getting ready",
  "The queue",
  "The set",
  "After",
  "London days",
  "Travel",
] as const;
export type Moment = (typeof moments)[number];

export const shotList = [
  { id: "booth", label: "Booth close-up" },
  { id: "hands", label: "Hands on the decks" },
  { id: "crowd", label: "Crowd from behind" },
  { id: "drop", label: "The drop" },
] as const;

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function utc(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

/** "THU 11 FEB" */
export function dayStamp(date: string) {
  const d = utc(date);
  return `${weekday.format(d)} ${dayMonth.format(d)}`.toUpperCase();
}

/** Short tab label, e.g. "Thu" */
export function dayShort(date: string) {
  return weekday.format(utc(date));
}

/** "11–15 FEB" */
export function tripRange() {
  const s = utc(trip.start);
  const e = utc(trip.end);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(e).toUpperCase();
  return `${s.getUTCDate()}–${e.getUTCDate()} ${month}`;
}

/** Which trip day a timestamp falls on, in London time. Clips before the trip go to day 0, after to the last day. */
export function dayIndexFor(time: number) {
  const london = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(time));
  const exact = days.findIndex((d) => d.date === london);
  if (exact >= 0) return exact;
  return london < days[0].date ? SOUNDCHECK : days.length - 1;
}

/** Day index for clips shot before the trip starts (tests, the run-up). */
export const SOUNDCHECK = -1;

/** Best-guess moment for a new clip from its time of day and trip day. */
export function suggestMoment(time: number): Moment {
  const index = dayIndexFor(time);
  if (index === SOUNDCHECK) return "Getting ready";
  const day = days[index];
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(new Date(time)),
  );
  if (!day.show) return day.index === 0 || day.index === days.length - 1 ? "Travel" : "London days";
  if (hour >= 17 && hour < 20) return "Getting ready";
  if (hour >= 20 && hour < 22) return "The queue";
  if (hour >= 22 || hour < 1) return "The set";
  if (hour >= 1 && hour < 6) return "After";
  return "London days";
}

export type TripPhase =
  | { phase: "before"; days: number }
  | { phase: "during"; day: TripDay }
  | { phase: "after" };

export function tripPhase(now: number): TripPhase {
  const startMs = Date.parse(`${trip.start}T00:00:00Z`);
  const endMs = Date.parse(`${trip.end}T23:59:59Z`);
  if (now < startMs) return { phase: "before", days: Math.ceil((startMs - now) / 86_400_000) };
  if (now > endMs) return { phase: "after" };
  return { phase: "during", day: days[Math.max(0, dayIndexFor(now))] };
}
