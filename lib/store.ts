"use client";

// Device-only storage until Supabase is connected.
// Small records live in localStorage; clips, photos and voice notes live in IndexedDB.

export type Profile = { name: string; initial: string };
export type TripDetails = { flight: string; lands: string; stay: string; checkIn: string };
export type LinerNote = { who: string; text: string };

export type MediaKind = "clip" | "fit" | "voice";
export type MediaRecord = {
  id: string;
  kind: MediaKind;
  who: string;
  moment: string;
  day: string;
  createdAt: number;
  mime: string;
  dlala?: boolean;
  blob: Blob;
};

const PROFILE = "side3.profile";
const DETAILS = "side3.details";
const NOTES = "side3.liner";
const PRESSED = "side3.pressed";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable in private mode */
  }
}

export const getProfile = () => read<Profile | null>(PROFILE, null);
export const setProfile = (p: Profile) => write(PROFILE, p);

export const getDetails = () => read<TripDetails | null>(DETAILS, null);
export const setDetails = (d: TripDetails) => write(DETAILS, d);

export const getLinerNotes = () => read<LinerNote[]>(NOTES, []);
export function saveLinerNote(note: LinerNote) {
  const rest = getLinerNotes().filter((n) => n.who !== note.who);
  write(NOTES, [...rest, note]);
}

export const isPressed = () => read<boolean>(PRESSED, false);
export const setPressed = (v: boolean) => write(PRESSED, v);

// ---- IndexedDB ----

const DB_NAME = "sidethree";
const STORE = "media";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("kind", "kind");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMedia(rec: Omit<MediaRecord, "id" | "createdAt">): Promise<MediaRecord> {
  const full: MediaRecord = {
    ...rec,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(full);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return full;
}

export async function listMedia(kind?: MediaKind): Promise<MediaRecord[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const all = (req.result as MediaRecord[]).sort((a, b) => a.createdAt - b.createdAt);
        resolve(kind ? all.filter((m) => m.kind === kind) : all);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export function currentDayTab(now = new Date()): string {
  // Trip days in London time; outside the trip, default to the first day.
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "numeric" });
  const [d, m] = fmt.format(now).split("/").map(Number);
  if (m === 2 && d >= 11 && d <= 15) return ["Wed", "Thu", "Fri", "Sat", "Sun"][d - 11];
  return "Wed";
}

export function timeLabel(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(ts);
}
