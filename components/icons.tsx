type IconProps = { size?: number; className?: string };

function base(size: number, className?: string, strokeWidth = 1.6) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

export const SpinIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const TripIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 14l18-6-3 9-6-2-3 4v-5z" />
  </svg>
);

export const CrateIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const FilmIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M10 9.5l4 2.5-4 2.5z" />
  </svg>
);

export const CameraIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size, className, 1.8)}>
    <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const CloseIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className, 1.8)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const BackIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className, 1.8)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ShareIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className, 1.8)}>
    <path d="M12 4v11M7.5 8.5L12 4l4.5 4.5M5 14v5h14v-5" />
  </svg>
);

export const FlipIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16M4 20v-4h4" />
  </svg>
);

export const CheckIcon = ({ size = 11, className }: IconProps) => (
  <svg {...base(size, className, 3)}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);

export const PlayIcon = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M7 5l12 7-12 7z" />
  </svg>
);

export const PauseIcon = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const InviteIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const ImageIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M21 16l-5-5-9 9" />
  </svg>
);

export const TrashIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);

export const DownloadIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className, 1.8)}>
    <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14" />
  </svg>
);
