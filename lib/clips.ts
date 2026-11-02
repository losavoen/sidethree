"use client";

import { useSyncExternalStore } from "react";
import type { Moment } from "@/lib/trip";

/**
 * Clips live on this phone in IndexedDB until shared uploads are added.
 * The store is tiny on purpose: one object store, keyed by id.
 */

export type Clip = {
  id: string;
  kind: "video" | "photo";
  mime: string;
  blob: Blob;
  createdAt: number;
  dayIndex: number;
  moment: Moment;
  dlala: boolean;
  durationMs?: number;
  by: string;
};

export type ClipMeta = Omit<Clip, "blob">;

const DB_NAME = "side-three";
const STORE = "clips";
const CHANGE = "side-three:clips";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

function announce() {
  cache = null;
  window.dispatchEvent(new Event(CHANGE));
}

export async function saveClip(clip: Clip) {
  await tx("readwrite", (s) => s.put(clip));
  // Ask the browser not to evict the footage under storage pressure.
  navigator.storage?.persist?.().catch(() => {});
  announce();
}

export async function updateClip(id: string, patch: Partial<Pick<Clip, "moment" | "dlala" | "dayIndex">>) {
  const existing = await tx<Clip | undefined>("readonly", (s) => s.get(id));
  if (!existing) return;
  await tx("readwrite", (s) => s.put({ ...existing, ...patch }));
  announce();
}

export async function deleteClip(id: string) {
  await tx("readwrite", (s) => s.delete(id));
  announce();
}

export async function getClip(id: string) {
  return tx<Clip | undefined>("readonly", (s) => s.get(id));
}

export async function allClips(): Promise<Clip[]> {
  const list = await tx<Clip[]>("readonly", (s) => s.getAll());
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

/* ---------- React subscription ---------- */

let cache: Clip[] | null = null;
let loading = false;
const listeners = new Set<() => void>();

function load() {
  if (loading) return;
  loading = true;
  allClips()
    .then((list) => {
      cache = list;
    })
    .catch(() => {
      cache = [];
    })
    .finally(() => {
      loading = false;
      listeners.forEach((fn) => fn());
    });
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) window.addEventListener(CHANGE, load);
  if (!cache) load();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener(CHANGE, load);
  };
}

/** All clips on this phone, oldest first. `null` while the first read is in flight. */
export function useClips(): Clip[] | null {
  return useSyncExternalStore(
    subscribe,
    () => cache,
    () => null,
  );
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function extFor(mime: string) {
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("quicktime")) return "mov";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("png")) return "png";
  return "jpg";
}
