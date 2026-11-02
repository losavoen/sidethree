"use client";

import { PLAYLIST_EMBED, PLAYLIST_URL } from "@/lib/trip";
import { CloseIcon } from "./Icons";

export default function PlaylistSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-modal="true" aria-label="three steps forward playlist" onClick={(e) => e.stopPropagation()}>
        <div className="between">
          <div>
            <p className="label">Now spinning</p>
            <p className="script" style={{ fontSize: 32, lineHeight: 1.1 }}>three steps forward</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close playlist"><CloseIcon size={18} /></button>
        </div>
        <iframe
          title="three steps forward on Spotify"
          src={PLAYLIST_EMBED}
          width="100%"
          height="352"
          style={{ border: 0, borderRadius: 12 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
        <a className="btn" href={PLAYLIST_URL} target="_blank" rel="noopener">Open in Spotify</a>
        <p className="muted" style={{ fontSize: 12 }}>Full tracks play when you're signed in to Spotify in this browser. Otherwise you'll hear previews.</p>
      </div>
    </div>
  );
}
