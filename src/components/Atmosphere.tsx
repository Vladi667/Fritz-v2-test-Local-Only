type AtmosphereProps = {
  progress: number;
};

export function Atmosphere({progress}: AtmosphereProps) {
  const glowOpacity = 0.26 + progress * 0.12;
  const driftA = -progress * 22;
  const driftB = -progress * 36;

  return (
    <svg className="atmosphere" viewBox="0 0 1440 1024" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="glow-a" cx="58%" cy="46%" r="38%">
          <stop offset="0%" stopColor="#fff5e5" stopOpacity="0.86" />
          <stop offset="65%" stopColor="#eed4ad" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#eed4ad" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="veil" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#fbf6ec" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#fbf6ec" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fbf6ec" stopOpacity="0.26" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1440" height="1024" fill="url(#veil)" />
      <circle cx="885" cy="438" r="348" fill="url(#glow-a)" opacity={glowOpacity} />
      <path
        d="M126 746 C 330 644, 550 798, 760 692 S 1124 642, 1318 762"
        stroke="#6f5136"
        strokeOpacity="0.13"
        strokeWidth="2.1"
        fill="none"
        style={{transform: `translateY(${driftA}px)`}}
      />
      <path
        d="M254 836 C 476 732, 678 914, 918 810 S 1180 778, 1374 906"
        stroke="#6f5136"
        strokeOpacity="0.09"
        strokeWidth="1.6"
        fill="none"
        style={{transform: `translateY(${driftB}px)`}}
      />
      <path
        d="M976 234 C 1014 188, 1080 178, 1128 216 C 1178 254, 1188 322, 1146 360"
        stroke="#8d6f4f"
        strokeOpacity="0.15"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}
