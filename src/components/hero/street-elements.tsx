// Realistic SVG elements for street cross-section

export const RealisticCar = ({ color = "#9ca3af", x = 0, y = 0 }: { color?: string; x?: number; y?: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Shadow */}
    <ellipse cx="30" cy="48" rx="28" ry="5" fill="#00000040"/>
    {/* Body */}
    <path d="M8 35 L8 30 Q8 28, 10 28 L20 28 L25 22 L40 22 L45 28 L52 28 Q54 28, 54 30 L54 35 Q54 38, 52 38 L10 38 Q8 38, 8 35 Z" 
          fill={color} stroke="#1f2937" strokeWidth="2"/>
    {/* Windows */}
    <path d="M22 28 L26 23 L38 23 L42 28 Z" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5" opacity="0.8"/>
    {/* Headlights */}
    <rect x="10" y="32" width="4" height="3" rx="1" fill="#fbbf24"/>
    <rect x="48" y="32" width="4" height="3" rx="1" fill="#ef4444"/>
    {/* Wheels */}
    <g>
      <circle cx="18" cy="45" r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
      <circle cx="18" cy="45" r="3" fill="#6b7280"/>
      <circle cx="44" cy="45" r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
      <circle cx="44" cy="45" r="3" fill="#6b7280"/>
    </g>
    {/* Details */}
    <line x1="30" y1="28" x2="30" y2="23" stroke="#1f2937" strokeWidth="1"/>
    <rect x="26" y="36" width="10" height="1" fill="#1f2937" opacity="0.3"/>
  </g>
);

export const RealisticBus = ({ x = 0, y = 0 }: { x?: number; y?: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Shadow */}
    <ellipse cx="55" cy="72" rx="50" ry="6" fill="#00000050"/>
    {/* Body */}
    <rect x="8" y="32" width="94" height="36" rx="4" fill="#ef4444" stroke="#1f2937" strokeWidth="3"/>
    {/* Windows */}
    <rect x="14" y="38" width="18" height="16" rx="1" fill="#93c5fd" stroke="#1f2937" strokeWidth="1.5"/>
    <rect x="36" y="38" width="18" height="16" rx="1" fill="#93c5fd" stroke="#1f2937" strokeWidth="1.5"/>
    <rect x="58" y="38" width="18" height="16" rx="1" fill="#93c5fd" stroke="#1f2937" strokeWidth="1.5"/>
    <rect x="80" y="38" width="16" height="16" rx="1" fill="#93c5fd" stroke="#1f2937" strokeWidth="1.5"/>
    {/* Headlights */}
    <rect x="10" y="56" width="6" height="4" rx="1" fill="#fbbf24"/>
    <rect x="94" y="56" width="6" height="4" rx="1" fill="#fbbf24"/>
    {/* Wheels */}
    <circle cx="24" cy="68" r="7" fill="#1f2937" stroke="#4b5563" strokeWidth="2.5"/>
    <circle cx="24" cy="68" r="4" fill="#6b7280"/>
    <circle cx="86" cy="68" r="7" fill="#1f2937" stroke="#4b5563" strokeWidth="2.5"/>
    <circle cx="86" cy="68" r="4" fill="#6b7280"/>
    {/* Door */}
    <rect x="78" y="44" width="2" height="20" fill="#1f2937"/>
    {/* Text */}
    <text x="55" y="50" fontSize="12" fill="#1f2937" fontWeight="bold" textAnchor="middle">BUS</text>
    {/* Route number */}
    <rect x="48" y="32" width="14" height="8" fill="#fbbf24" stroke="#1f2937" strokeWidth="1"/>
    <text x="55" y="38" fontSize="7" fill="#1f2937" fontWeight="bold" textAnchor="middle">38</text>
  </g>
);

export const RealisticCyclist = ({ x = 0, y = 0, color = "#3b82f6" }: { x?: number; y?: number; color?: string }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Shadow */}
    <ellipse cx="16" cy="48" rx="14" ry="4" fill="#00000030"/>
    {/* Bike frame */}
    <path d="M16 28 L16 36 L10 42 M16 36 L22 42" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="16" y1="28" x2="20" y2="24" stroke="#1f2937" strokeWidth="2"/>
    {/* Wheels */}
    <circle cx="10" cy="42" r="6" fill="none" stroke="#1f2937" strokeWidth="2.5"/>
    <circle cx="10" cy="42" r="1" fill="#1f2937"/>
    <circle cx="22" cy="42" r="6" fill="none" stroke="#1f2937" strokeWidth="2.5"/>
    <circle cx="22" cy="42" r="1" fill="#1f2937"/>
    {/* Rider head */}
    <circle cx="18" cy="18" r="5" fill="#fbbf24" stroke="#1f2937" strokeWidth="1.5"/>
    {/* Helmet detail */}
    <path d="M16 16 Q18 14, 20 16" stroke="#1f2937" strokeWidth="1" fill="none"/>
    {/* Body */}
    <path d="M18 23 L16 32" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    {/* Arms */}
    <path d="M17 26 L14 30 L16 32" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 26 L20 28 L20 24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M16 32 L12 38" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 32 L20 38" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round"/>
  </g>
);

export const RealisticPedestrian = ({ x = 0, y = 0, shirtColor = "#3b82f6" }: { x?: number; y?: number; shirtColor?: string }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Shadow */}
    <ellipse cx="12" cy="46" rx="10" ry="4" fill="#00000025"/>
    {/* Head */}
    <circle cx="12" cy="12" r="7" fill="#fcd34d" stroke="#1f2937" strokeWidth="1.5"/>
    {/* Hair */}
    <path d="M8 10 Q12 6, 16 10" fill="#1f2937"/>
    {/* Body */}
    <rect x="7" y="19" width="10" height="14" rx="2" fill={shirtColor} stroke="#1f2937" strokeWidth="1.5"/>
    {/* Arms */}
    <rect x="4" y="22" width="3" height="10" rx="1.5" fill={shirtColor} stroke="#1f2937" strokeWidth="1"/>
    <rect x="15" y="22" width="3" height="10" rx="1.5" fill={shirtColor} stroke="#1f2937" strokeWidth="1"/>
    {/* Legs */}
    <rect x="8" y="33" width="3" height="12" rx="1.5" fill="#1f2937" stroke="#1f2937" strokeWidth="1"/>
    <rect x="11" y="33" width="3" height="12" rx="1.5" fill="#1f2937" stroke="#1f2937" strokeWidth="1"/>
    {/* Shoes */}
    <ellipse cx="9.5" cy="45" rx="2" ry="1.5" fill="#374151"/>
    <ellipse cx="12.5" cy="45" rx="2" ry="1.5" fill="#374151"/>
  </g>
);

export const StreetLight = ({ x = 0, y = 0, side = "left" }: { x?: number; y?: number; side?: "left" | "right" }) => {
  const curve = side === "left" ? "Q20 40, 25 80" : "Q40 40, 35 80";
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Pole */}
      <path d={`M30 10 ${curve} L30 120`} stroke="#4a5568" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Base */}
      <rect x="26" y="118" width="8" height="4" fill="#374151" rx="1"/>
      {/* Light fixture */}
      <g>
        <ellipse cx="30" cy="8" rx="10" ry="6" fill="#71717a" stroke="#1f2937" strokeWidth="2"/>
        <circle cx="30" cy="8" r="6" fill="#fbbf24" opacity="0.9"/>
        <circle cx="30" cy="8" r="4" fill="#fef08a"/>
        {/* Light beam */}
        <path d="M30 14 L20 40 L40 40 Z" fill="#fbbf24" opacity="0.15"/>
      </g>
      {/* Mounting bracket */}
      <rect x="28" y="12" width="4" height="6" fill="#4a5568" rx="1"/>
    </g>
  );
};

export const ParkingSign = ({ x = 0, y = 0 }: { x?: number; y?: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Sign board */}
    <rect x="0" y="0" width="32" height="32" rx="2" fill="#2563eb" stroke="#1f2937" strokeWidth="2"/>
    <rect x="2" y="2" width="28" height="28" rx="1" stroke="white" strokeWidth="2" fill="none"/>
    {/* P letter */}
    <text x="16" y="24" fontSize="20" fill="white" fontWeight="900" textAnchor="middle" fontFamily="Arial, sans-serif">P</text>
  </g>
);

export const BikeStencil = ({ x = 0, y = 0, color = "white" }: { x?: number; y?: number; color?: string }) => (
  <g transform={`translate(${x}, ${y})`} opacity="0.9">
    <circle cx="8" cy="20" r="5" fill="none" stroke={color} strokeWidth="2.5"/>
    <circle cx="24" cy="20" r="5" fill="none" stroke={color} strokeWidth="2.5"/>
    <path d="M16 8 L14 16 L18 16 Z" fill={color} stroke={color} strokeWidth="1.5"/>
    <line x1="14" y1="16" x2="8" y2="20" stroke={color} strokeWidth="2.5"/>
    <line x1="18" y1="16" x2="24" y2="20" stroke={color} strokeWidth="2.5"/>
    <line x1="16" y1="8" x2="20" y2="4" stroke={color} strokeWidth="2"/>
    <circle cx="20" cy="4" r="2" fill={color}/>
  </g>
);

export const BusStencil = ({ x = 0, y = 0, color = "white" }: { x?: number; y?: number; color?: string }) => (
  <g transform={`translate(${x}, ${y})`} opacity="0.9">
    <rect x="4" y="6" width="24" height="18" rx="2" fill={color} stroke={color} strokeWidth="2"/>
    <rect x="6" y="9" width="8" height="8" fill="#60a5fa" stroke={color} strokeWidth="1"/>
    <rect x="16" y="9" width="8" height="8" fill="#60a5fa" stroke={color} strokeWidth="1"/>
    <circle cx="10" cy="24" r="2" fill="#1f2937"/>
    <circle cx="22" cy="24" r="2" fill="#1f2937"/>
    <rect x="26" y="12" width="3" height="4" fill="#fbbf24"/>
  </g>
);

export const ArrowDown = ({ x = 0, y = 0, color = "white" }: { x?: number; y?: number; color?: string }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M16 4 L16 28 M8 20 L16 28 L24 20" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
);

export const ArrowUp = ({ x = 0, y = 0, color = "white" }: { x?: number; y?: number; color?: string }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M16 28 L16 4 M8 12 L16 4 L24 12" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
);

export const LeftTurnArrow = ({ x = 0, y = 0, color = "white" }: { x?: number; y?: number; color?: string }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M20 28 L20 12 Q20 8, 16 8 L8 8 M8 8 L12 4 M8 8 L12 12" 
          fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
);
