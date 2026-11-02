// Everything about the trip lives here. Swap the [placeholders] once flights, the stay and names are set.

export const PLAYLIST_ID = "6nVE5YsGJgZkczU6wE9S9C";
export const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;
export const PLAYLIST_EMBED = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

export const trip = {
  title: "Ember London",
  subtitle: "A girls' trip · London · 11–15 Feb",
  takeoff: "2027-02-11T00:00:00Z",
  show: "Dlala Thukzin × 2 · Roundhouse, Camden",
  girls: [
    { initial: "I", name: "Ilelosa" },
    { initial: "2", name: "[Name]" },
    { initial: "3", name: "[Name]" },
    { initial: "4", name: "[Name]" },
  ],
  flight: { out: "Out Wed 11 Feb", detail: "[Flight no.] · [lands]" },
  stay: { name: "[Where we're staying]", detail: "Check-in [time]" },
};

export type Day = {
  track: string;
  tab: string;
  date: string;
  title: string;
  show?: boolean;
};

export const days: Day[] = [
  { track: "A1", tab: "Wed", date: "WED 11 FEB", title: "Fly out, land in London" },
  { track: "A2", tab: "Thu", date: "THU 12 FEB · DLALA THUKZIN", title: "Night one at the Roundhouse", show: true },
  { track: "B1", tab: "Fri", date: "FRI 13 FEB · DLALA THUKZIN", title: "Night two at the Roundhouse", show: true },
  { track: "B2", tab: "Sat", date: "SAT 14 FEB", title: "[Our London day]" },
  { track: "B3", tab: "Sun", date: "SUN 15 FEB", title: "Fly home" },
];

export const moments = [
  "Flight",
  "Landing",
  "The flat",
  "London days",
  "Fits",
  "The queue",
  "The set",
  "After",
  "Flight home",
];

export const dlalaShotList = ["Booth close-up", "Hands on the decks", "Crowd from behind", "The drop"];

// Sample crate content so the screens read right before real uploads exist.
type SampleClip = [time: string, who: string, moment: string, dlala: boolean];

export const sampleCrate: { heading: string; sub: string; clips: SampleClip[] }[] = [
  {
    heading: "Takeoff",
    sub: "WED 11 FEB · THE FLIGHT",
    clips: [
      ["06:40", "I", "PACKING", false], ["09:15", "2", "THE AIRPORT", false], ["10:05", "3", "THE AIRPORT", false],
      ["11:30", "I", "TAKEOFF", false], ["15:20", "4", "WINDOW SEAT", false], ["22:10", "2", "LANDING", false],
      ["23:40", "I", "THE TUBE", false], ["00:25", "3", "THE FLAT", false], ["00:50", "4", "THE FLAT", false],
    ],
  },
  {
    heading: "Night one",
    sub: "THU 12 FEB · ROUNDHOUSE",
    clips: [
      ["10:12", "I", "BREAKFAST", false], ["13:30", "2", "CAMDEN", false], ["18:40", "3", "FITS", false],
      ["18:52", "I", "FITS", false], ["20:10", "4", "THE QUEUE", false], ["20:15", "2", "THE QUEUE", false],
      ["22:31", "I", "THE SET", true], ["22:48", "3", "THE SET", false], ["23:02", "I", "THE SET", true],
      ["00:14", "4", "THE SET", true], ["01:22", "2", "AFTER", false], ["02:03", "3", "NIGHT BUS", false],
    ],
  },
  {
    heading: "Night two",
    sub: "FRI 13 FEB · ROUNDHOUSE",
    clips: [
      ["11:40", "I", "SLOW MORNING", false], ["14:10", "2", "RECORD SHOP", false], ["18:45", "4", "FITS", false],
      ["20:15", "3", "THE QUEUE", false], ["22:20", "I", "THE SET", true], ["22:44", "2", "THE SET", true],
      ["23:10", "4", "THE SET", false], ["01:30", "3", "AFTER", false], ["02:10", "I", "NIGHT BUS", false],
    ],
  },
  {
    heading: "London day",
    sub: "SAT 14 FEB",
    clips: [
      ["12:05", "2", "BRUNCH", false], ["14:30", "I", "WANDERING", false], ["16:45", "3", "GOLDEN HOUR", false],
      ["20:00", "4", "DINNER", false], ["22:30", "I", "LAST NIGHT", false], ["23:15", "2", "LAST NIGHT", false],
    ],
  },
  {
    heading: "Flight home",
    sub: "SUN 15 FEB",
    clips: [
      ["08:30", "I", "PACKING UP", false], ["11:00", "3", "THE AIRPORT", false], ["13:20", "4", "WINDOW SEAT", false],
    ],
  },
];

export function daysUntil(iso: string, from = new Date()): number {
  const ms = new Date(iso).getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
