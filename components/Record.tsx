export default function Record({ playing, title = "Ember" }: { playing: boolean; title?: string }) {
  return (
    <div className="platter" aria-hidden>
      <div className="platter-base">
        <div className={`vinyl${playing ? "" : " paused"}`}>
          <div className="label-disc">
            <span className="mono" style={{ fontSize: 7, letterSpacing: 1.6, fontWeight: 500 }}>SIDE THREE</span>
            <span className="display" style={{ fontSize: 17, lineHeight: 1.1, textTransform: "uppercase" }}>{title}</span>
            <span className="mono" style={{ fontSize: 7, letterSpacing: 1.6, fontWeight: 500 }}>LONDON</span>
            <span className="hole" />
          </div>
        </div>
      </div>
      <div className="pivot" />
      <div className="tonearm" style={{ transform: `rotate(${playing ? 28 : 6}deg)` }} />
    </div>
  );
}
