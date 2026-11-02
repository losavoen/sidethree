"use client";

import { zip, type Zippable } from "fflate";
import { extFor, type Clip } from "@/lib/clips";
import { SOUNDCHECK, days, trip } from "@/lib/trip";

const stamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function folderFor(clip: Clip) {
  if (clip.dayIndex === SOUNDCHECK) return "00 Soundcheck";
  const d = days[clip.dayIndex];
  return `${String(d.index + 1).padStart(2, "0")} ${d.date} ${d.heading}`;
}

/**
 * Original-quality files, organised by day and moment, plus a manifest for the editor.
 * Stored without compression: video doesn't shrink and this keeps it fast on a phone.
 */
export async function buildArchive(clips: Clip[]): Promise<Blob> {
  const files: Zippable = {};
  const manifest = [];
  for (const clip of clips) {
    const time = stamp.format(clip.createdAt).replaceAll(":", "");
    const name = `${folderFor(clip)}/${clip.moment}/${time}-${clip.by}${clip.dlala ? "-DLALA" : ""}-${clip.id}.${extFor(clip.mime)}`;
    files[name] = [new Uint8Array(await clip.blob.arrayBuffer()), { level: 0 }];
    manifest.push({
      file: name,
      shotAt: new Date(clip.createdAt).toISOString(),
      kind: clip.kind,
      moment: clip.moment,
      dlalaInFrame: clip.dlala,
      by: clip.by,
      durationMs: clip.durationMs ?? null,
    });
  }
  files["manifest.json"] = new TextEncoder().encode(
    JSON.stringify({ session: trip.title, artist: trip.artist, clips: manifest }, null, 2),
  );
  return new Promise((resolve, reject) => {
    zip(files, (err, data) => (err ? reject(err) : resolve(new Blob([data as BlobPart], { type: "application/zip" }))));
  });
}

/** Share the file to the phone's share sheet (save to Photos/Files), or download it. */
export async function deliver(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch {
      // Cancelled or blocked; fall through to a download.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
