"use client";

import type { Clip } from "@/lib/clips";
import { SOUNDCHECK, trip, tripRange } from "@/lib/trip";

export const W = 720;
export const H = 1280;

export const lengths = [
  { id: "60", label: "60s", seconds: 60 },
  { id: "150", label: "2 min 30", seconds: 150 },
  { id: "180", label: "3 min", seconds: 180 },
] as const;
export type LengthId = (typeof lengths)[number]["id"];

export const grades = {
  ember: { label: "Ember", filter: "sepia(0.28) saturate(1.25) contrast(1.06) brightness(0.96)", tint: "rgba(226,96,45,0.10)" },
  nightbus: { label: "Night bus", filter: "saturate(0.8) contrast(1.15) brightness(0.9) hue-rotate(-8deg)", tint: "rgba(40,70,120,0.14)" },
  daylight: { label: "Daylight", filter: "saturate(1.05) contrast(1.02) brightness(1.06)", tint: "rgba(255,240,215,0.06)" },
} as const;
export type GradeId = keyof typeof grades;

const TITLE_MS = 2600;
const END_MS = 2600;

export type Segment = { clip: Clip; ms: number };

/**
 * Pick and time clips for the reel. Clips run in the order they were shot.
 * When there are more clips than fit, Dlala clips are kept first, then the rest are sampled evenly.
 */
export function planReel(all: Clip[], seconds: number): Segment[] {
  const onTrip = all.filter((c) => c.dayIndex !== SOUNDCHECK);
  const pool = (onTrip.length > 0 ? onTrip : all).slice().sort((a, b) => a.createdAt - b.createdAt);
  if (pool.length === 0) return [];

  const budget = seconds * 1000 - TITLE_MS - END_MS;
  const minMs = 1600;
  const maxMs = 5000;
  const capacity = Math.max(1, Math.floor(budget / minMs));

  let chosen = pool;
  if (pool.length > capacity) {
    const dlala = pool.filter((c) => c.dlala).slice(0, Math.ceil(capacity * 0.4));
    const rest = pool.filter((c) => !dlala.includes(c));
    const need = capacity - dlala.length;
    const step = rest.length / need;
    const sampled = Array.from({ length: need }, (_, i) => rest[Math.floor(i * step)]);
    chosen = [...dlala, ...sampled].sort((a, b) => a.createdAt - b.createdAt);
  }

  const slot = Math.min(maxMs, Math.max(minMs, budget / chosen.length));
  return chosen.map((clip) => {
    const own = clip.kind === "video" && clip.durationMs ? clip.durationMs : Infinity;
    return { clip, ms: Math.min(slot, Math.max(minMs, own)) };
  });
}

export function reelMs(segments: Segment[]) {
  return TITLE_MS + END_MS + segments.reduce((sum, s) => sum + s.ms, 0);
}

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function cover(ctx: CanvasRenderingContext2D, src: CanvasImageSource, sw: number, sh: number) {
  if (!sw || !sh) return;
  const scale = Math.max(W / sw, H / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

type Loaded = { el: HTMLVideoElement | HTMLImageElement; url: string };

function load(clip: Clip): Promise<Loaded> {
  const url = URL.createObjectURL(clip.blob);
  if (clip.kind === "photo") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ el: img, url });
      img.onerror = reject;
      img.src = url;
    });
  }
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.onloadeddata = () => resolve({ el: v, url });
    v.onerror = reject;
    v.src = url;
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Reel {
  private ctx: CanvasRenderingContext2D;
  private stopped = false;
  private grain: HTMLCanvasElement;
  private frame = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private segments: Segment[],
    private grade: GradeId,
    private onProgress: (ms: number) => void = () => {},
  ) {
    canvas.width = W;
    canvas.height = H;
    this.ctx = canvas.getContext("2d")!;
    this.grain = makeGrain();
  }

  stop() {
    this.stopped = true;
  }

  /** Static cover frame (title card). */
  async poster() {
    await document.fonts?.ready;
    this.titleCard(1);
  }

  async play() {
    this.stopped = false;
    await document.fonts?.ready;
    let elapsed = 0;

    await this.timed(TITLE_MS, (t) => this.titleCard(Math.min(1, t / 600)), elapsed);
    elapsed += TITLE_MS;

    let next = this.segments[0] ? load(this.segments[0].clip).catch(() => null) : null;
    for (let i = 0; i < this.segments.length && !this.stopped; i++) {
      const seg = this.segments[i];
      const loaded = await next;
      next = this.segments[i + 1] ? load(this.segments[i + 1].clip).catch(() => null) : null;
      if (!loaded) {
        elapsed += seg.ms;
        continue;
      }
      const { el, url } = loaded;
      if (el instanceof HTMLVideoElement) {
        const spare = el.duration && Number.isFinite(el.duration) ? Math.max(0, el.duration - seg.ms / 1000) : 0;
        el.currentTime = spare / 2;
        await el.play().catch(() => {});
      }
      const base = elapsed;
      await this.timed(seg.ms, (t) => {
        const w = el instanceof HTMLVideoElement ? el.videoWidth : el.naturalWidth;
        const h = el instanceof HTMLVideoElement ? el.videoHeight : el.naturalHeight;
        if (el instanceof HTMLImageElement) {
          // Slow push-in on stills.
          const z = 1 + 0.06 * (t / seg.ms);
          this.ctx.save();
          this.ctx.translate(W / 2, H / 2);
          this.ctx.scale(z, z);
          this.ctx.translate(-W / 2, -H / 2);
          this.drawGraded(el, w, h);
          this.ctx.restore();
        } else {
          this.drawGraded(el, w, h);
        }
        this.overlay();
      }, base);
      if (el instanceof HTMLVideoElement) el.pause();
      URL.revokeObjectURL(url);
      elapsed += seg.ms;
    }

    if (!this.stopped) await this.timed(END_MS, (t) => this.endCard(Math.min(1, t / 600)), elapsed);
    this.onProgress(reelMs(this.segments));
  }

  /** Plays the reel while recording the canvas. Resolves with the finished video file. */
  async record(): Promise<Blob> {
    const stream = this.canvas.captureStream(30);
    const types = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    const rec = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8_000_000 } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise<Blob>((resolve) => {
      rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || mimeType || "video/webm" }));
    });
    rec.start(1000);
    await this.play();
    await sleep(300);
    rec.stop();
    stream.getTracks().forEach((t) => t.stop());
    return done;
  }

  private async timed(ms: number, draw: (t: number) => void, base: number) {
    const start = performance.now();
    while (!this.stopped) {
      const t = performance.now() - start;
      if (t >= ms) break;
      draw(t);
      this.onProgress(base + t);
      await new Promise((r) => requestAnimationFrame(r));
    }
  }

  private drawGraded(src: CanvasImageSource, w: number, h: number) {
    const ctx = this.ctx;
    const g = grades[this.grade];
    ctx.fillStyle = "#0c0a09";
    ctx.fillRect(0, 0, W, H);
    if ("filter" in ctx) ctx.filter = g.filter;
    cover(ctx, src, w, h);
    if ("filter" in ctx) ctx.filter = "none";
    ctx.fillStyle = g.tint;
    ctx.fillRect(0, 0, W, H);
  }

  private overlay() {
    const ctx = this.ctx;
    // Grain
    this.frame++;
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = "overlay";
    const ox = (this.frame * 37) % 128;
    const oy = (this.frame * 53) % 128;
    for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(this.grain, x, y);
    ctx.restore();
    // Vignette
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    // Corner stamp
    ctx.fillStyle = "rgba(237,230,218,0.75)";
    ctx.font = `500 18px ${fontVar("--font-jetbrains", "monospace")}`;
    ctx.textAlign = "left";
    ctx.fillText(`SIDE THREE · ${trip.label.toUpperCase()} ${trip.city.toUpperCase()}`, 40, H - 48);
  }

  private card(alpha: number, lines: { text: string; font: string; y: number; spacing?: number }[]) {
    const ctx = this.ctx;
    ctx.fillStyle = "#1a130f";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ede6da";
    ctx.textAlign = "center";
    for (const line of lines) {
      ctx.font = line.font;
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${line.spacing ?? 0}px`;
      ctx.fillText(line.text, W / 2, line.y);
    }
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
    ctx.globalAlpha = 1;
    this.overlayGrainOnly();
  }

  private overlayGrainOnly() {
    const ctx = this.ctx;
    this.frame++;
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.globalCompositeOperation = "overlay";
    const ox = (this.frame * 37) % 128;
    for (let x = -ox; x < W; x += 256) for (let y = -ox; y < H; y += 256) ctx.drawImage(this.grain, x, y);
    ctx.restore();
  }

  private titleCard(alpha: number) {
    const mono = fontVar("--font-jetbrains", "monospace");
    this.card(alpha, [
      { text: "SIDE THREE", font: `500 22px ${mono}`, y: H / 2 - 120, spacing: 6 },
      { text: trip.label, font: `400 150px ${fontVar("--font-pinyon", "cursive")}`, y: H / 2 + 30 },
      { text: trip.city.toUpperCase(), font: `400 46px ${fontVar("--font-gloock", "serif")}`, y: H / 2 + 120, spacing: 12 },
      { text: `${trip.kind.toUpperCase()} · ${tripRange()}`, font: `400 20px ${mono}`, y: H - 120, spacing: 2 },
    ]);
  }

  private endCard(alpha: number) {
    const mono = fontVar("--font-jetbrains", "monospace");
    this.card(alpha, [
      { text: `FOR ${trip.artist.toUpperCase()}`, font: `500 22px ${mono}`, y: H / 2 - 60, spacing: 4 },
      { text: "Two nights,", font: `400 84px ${fontVar("--font-pinyon", "cursive")}`, y: H / 2 + 40 },
      { text: "one crate.", font: `400 84px ${fontVar("--font-pinyon", "cursive")}`, y: H / 2 + 130 },
      { text: `SCORED TO ${trip.playlist.name.toUpperCase()}`, font: `400 20px ${mono}`, y: H - 120, spacing: 2 },
    ]);
  }
}

function makeGrain() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
