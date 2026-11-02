type P = { size?: number };
const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const SpinIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /></svg>);
export const TripIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 14l18-6-3 9-6-2-3 4v-5z" /></svg>);
export const CrateIcon = ({ size }: P) => (<svg {...base(size)}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>);
export const FilmIcon = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M10 9.5l4 2.5-4 2.5z" /></svg>);
export const CameraIcon = ({ size }: P) => (<svg {...base(size)} strokeWidth={1.8}><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>);
export const CloseIcon = ({ size }: P) => (<svg {...base(size)} strokeWidth={1.8}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const BackIcon = ({ size }: P) => (<svg {...base(size)} strokeWidth={1.8}><path d="M15 5l-7 7 7 7" /></svg>);
export const QrIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><circle cx="12" cy="12" r="2.5" /></svg>);
export const FlipIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16M4 20v-4h4" /></svg>);
export const MicIcon = ({ size }: P) => (<svg {...base(size)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
export const ShareIcon = ({ size }: P) => (<svg {...base(size)} strokeWidth={1.8}><path d="M12 4v11M7.5 8.5L12 4l4.5 4.5M5 14v5h14v-5" /></svg>);
export const PlayIcon = ({ size = 18 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 5l12 7-12 7z" /></svg>);
export const PauseIcon = ({ size = 18 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>);
export const CheckIcon = ({ size = 11 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M5 12l5 5 9-10" /></svg>);
export const GridIcon = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>);
