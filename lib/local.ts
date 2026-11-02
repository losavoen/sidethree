"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Small per-phone settings (name, shot list ticks, trip notes). Never throws. */

const EVENT = "side-three:local";
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** JSON value persisted on this phone. Returns the fallback during server render. */
export function useLocal<T>(key: string, fallback: T): [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(`s3:${key}`),
    () => null,
  );

  let value = fallback;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }

  const set = useCallback((next: T) => write(`s3:${key}`, JSON.stringify(next)), [key]);
  return [value, set];
}

/** Stable "now" for render: updates once a minute on the client, fixed on the server. */
const minuteListeners = new Set<() => void>();
let minuteTimer: ReturnType<typeof setInterval> | null = null;
let minuteNow = 0;

function subscribeMinute(onChange: () => void) {
  minuteListeners.add(onChange);
  if (!minuteTimer) {
    minuteNow = Date.now();
    minuteTimer = setInterval(() => {
      minuteNow = Date.now();
      minuteListeners.forEach((fn) => fn());
    }, 60_000);
  }
  return () => {
    minuteListeners.delete(onChange);
    if (minuteListeners.size === 0 && minuteTimer) {
      clearInterval(minuteTimer);
      minuteTimer = null;
    }
  };
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribeMinute,
    () => minuteNow || null,
    () => null,
  );
}
