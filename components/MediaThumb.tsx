"use client";

import { useEffect, useState } from "react";

// Renders a stored blob as a muted, looping preview.
export default function MediaThumb({ blob, mime }: { blob: Blob; mime: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  if (mime.startsWith("image/")) return <img src={url} alt="" />;
  return <video src={url} muted loop playsInline autoPlay />;
}
