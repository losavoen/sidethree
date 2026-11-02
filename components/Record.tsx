export default function Record({ playing, title = "Ember" }: { playing: boolean; title?: string }) {
  return (
    <div className="platter" aria-hidden>
      <div className="platter-base">
        <div className={`vinyl${playing ? "" : " paused"}`}>
          <div className="label-disc">
            <span className="mono" style={{ fontSize: 7, letterSpacing: 1.6, fontWeight: 500 }}>SIDE THREE</span>
            <span className="script" style={{ fontSize: 22, lineHeight: 1.1 }}>{title}</span>
            <span className="mono" style={{ fontSize: 7, letterSpacing: 1.6, fontWeight: 500 }}>LONDON · 33⅓</span>
            <span className="hole" />
          </div>
        </div>
      </div>
      <div className="pivot" />
      <div className="tonearm" style={{ transform: `rotate(${playing ? 28 : 6}deg)` }} />
    </div>
  );
}
