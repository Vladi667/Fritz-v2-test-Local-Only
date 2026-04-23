type AtmosphereProps = {
  progress: number;
};

export function Atmosphere({progress}: AtmosphereProps) {
  const glowOpacity = 0.3 + progress * 0.08;
  const driftA = -progress * 18;
  const driftB = -progress * 28;

  return (
    <svg className="atmosphere" viewBox="0 0 1440 1024" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="glow-a" cx="50%" cy="46%" r="42%">
          <stop offset="0%" stopColor="#a87442" stopOpacity="0.34" />
          <stop offset="60%" stopColor="#3d2d1f" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#0e1319" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="veil" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#090d12" stopOpacity="0.92" />
          <stop offset="35%" stopColor="#11161c" stopOpacity="0.76" />
          <stop offset="65%" stopColor="#151a20" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#090d12" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1440" height="1024" fill="url(#veil)" />
      <circle cx="720" cy="436" r="390" fill="url(#glow-a)" opacity={glowOpacity} />
      <path
        d="M126 746 C 330 644, 550 798, 760 692 S 1124 642, 1318 762"
        stroke="#b07a47"
        strokeOpacity="0.12"
        strokeWidth="1.9"
        fill="none"
        style={{transform: `translateY(${driftA}px)`}}
      />
      <path
        d="M254 836 C 476 732, 678 914, 918 810 S 1180 778, 1374 906"
        stroke="#cab399"
        strokeOpacity="0.09"
        strokeWidth="1.25"
        fill="none"
        style={{transform: `translateY(${driftB}px)`}}
      />
      <path
        d="M968 224 C 1012 180, 1074 176, 1128 214 C 1176 250, 1186 316, 1148 358"
        stroke="#f1d2ab"
        strokeOpacity="0.1"
        strokeWidth="1.1"
        fill="none"
      />
    </svg>
  );
}
