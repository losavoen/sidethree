"use client";

import { useEffect, useState } from "react";
import type { Clip } from "@/lib/clips";

/** Object URL for a clip's blob, revoked when the clip changes or the component unmounts. */
export function useClipUrl(clip: Clip | null | undefined) {
  const [entry, setEntry] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!clip) return;
    const url = URL.createObjectURL(clip.blob);
    // Mirrors an external resource (the object URL) into state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntry({ id: clip.id, url });
    return () => URL.revokeObjectURL(url);
  }, [clip]);

  return clip && entry?.id === clip.id ? entry.url : null;
}

type ClipMediaProps = {
  clip: Clip;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
};

/** Still frame for photos and videos; plays inline when `controls` or `autoPlay` is set. */
export function ClipMedia({ clip, className = "", controls = false, autoPlay = false }: ClipMediaProps) {
  const url = useClipUrl(clip);
  if (!url) return null;

  if (clip.kind === "photo") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={className} />;
  }

  return (
    <video
      // "#t=0.1" asks Safari to paint a first frame instead of a black box.
      src={controls || autoPlay ? url : `${url}#t=0.1`}
      className={className}
      muted={!controls}
      playsInline
      preload="metadata"
      controls={controls}
      autoPlay={autoPlay}
      loop={autoPlay && !controls}
    />
  );
}
