"use client";

// ─── COMPLETE STREET CROSS-SECTION HERO ───────────────────────────────────────
// Orthographic cut-through elevation. Pure white bg. No text overlay.
// Animated vehicles, cyclists, pedestrians. Fully responsive SVG.
// ─────────────────────────────────────────────────────────────────────────────

const O = 45;   // left margin offset
const RY = 200; // road surface top Y
const RH = 90;  // road height
const GY = RY + RH; // ground Y

// Lane definitions
const L = {
  lsw: { x: O,       w: 75  }, // Left Sidewalk
  lp:  { x: O+75,    w: 67  }, // Left Parking
  sbt: { x: O+142,   w: 100 }, // SB Transit/Bike
  sb1: { x: O+242,   w: 83  }, // SB Traffic 1
  sb2: { x: O+325,   w: 83  }, // SB Traffic 2
  med: { x: O+408,   w: 40  }, // Center Median
  nbt: { x: O+448,   w: 83  }, // NB Turn Lane
  nb1: { x: O+531,   w: 83  }, // NB Traffic 1
  nb2: { x: O+614,   w: 83  }, // NB Traffic 2
  buf: { x: O+697,   w: 20  }, // Safety Buffer
  nbk: { x: O+717,   w: 50  }, // NB Bike Lane
  rp:  { x: O+767,   w: 67  }, // Right Parking
  rsw: { x: O+834,   w: 75  }, // Right Sidewalk
};

// ── Vehicle Components ────────────────────────────────────────────────────────

function Car({ cx, body = "#9ca3af", roof = "#6b7280", flip = false }: {
  cx: number; body?: string; roof?: string; flip?: boolean;
}) {
  const w = 52, h = 26;
  const x = cx - w / 2;
  const y = RY - h - 2;
  return (
    <g filter="url(#vShadow)" transform={flip ? `scale(-1,1) translate(${-cx * 2 - 0},0)` : ""}>
      {/* Body */}
      <rect x={x} y={y + 10} width={w} height={h - 10} rx="3" fill={body} stroke="#1f2937" strokeWidth="1.2"/>
      {/* Cabin */}
      <path d={`M${x+8} ${y+10} L${x+12} ${y+2} L${x+38} ${y+2} L${x+44} ${y+10}`}
        fill={roof} stroke="#1f2937" strokeWidth="1.2"/>
      {/* Windshield */}
      <path d={`M${x+13} ${y+10} L${x+16} ${y+3} L${x+36} ${y+3} L${x+40} ${y+10}`}
        fill="#93c5fd" opacity="0.7" stroke="#1f2937" strokeWidth="0.8"/>
      {/* Headlights */}
      <rect x={x+2} y={y+16} width={6} height={4} rx="1" fill="#fef08a"/>
      <rect x={x+44} y={y+16} width={6} height={4} rx="1" fill="#fca5a5"/>
      {/* Wheels */}
      <circle cx={x+12} cy={y+h} r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
      <circle cx={x+12} cy={y+h} r="3" fill="#6b7280"/>
      <circle cx={x+40} cy={y+h} r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
      <circle cx={x+40} cy={y+h} r="3" fill="#6b7280"/>
      {/* Door line */}
      <line x1={x+26} y1={y+10} x2={x+26} y2={y+h-2} stroke="#1f2937" strokeWidth="0.8" opacity="0.5"/>
    </g>
  );
}

function Bus({ cx }: { cx: number }) {
  const w = 80, h = 44;
  const x = cx - w / 2;
  const y = RY - h - 2;
  return (
    <g filter="url(#vShadow)">
      {/* Body */}
      <rect x={x} y={y} width={w} height={h - 8} rx="3" fill="#ef4444" stroke="#1f2937" strokeWidth="1.5"/>
      {/* Windows */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={x+6+i*18} y={y+5} width={14} height={12} rx="1"
          fill="#bfdbfe" stroke="#1f2937" strokeWidth="0.8" opacity="0.85"/>
      ))}
      {/* Destination board */}
      <rect x={x+4} y={y+1} width={30} height={6} rx="1" fill="#fbbf24"/>
      <text x={x+19} y={y+6.5} textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="4.5" fill="#1f2937">
        SAN BRUNO
      </text>
      {/* Door */}
      <rect x={x+62} y={y+18} width={12} height={16} rx="1" fill="#fca5a5" stroke="#1f2937" strokeWidth="0.8"/>
      <line x1={x+68} y1={y+18} x2={x+68} y2={y+34} stroke="#1f2937" strokeWidth="0.6"/>
      {/* Headlights */}
      <rect x={x+2} y={y+22} width={5} height={5} rx="1" fill="#fef08a"/>
      <rect x={x+73} y={y+22} width={5} height={5} rx="1" fill="#fca5a5"/>
      {/* Wheels */}
      <circle cx={x+14} cy={y+h} r="7" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
      <circle cx={x+14} cy={y+h} r="3.5" fill="#6b7280"/>
      <circle cx={x+66} cy={y+h} r="7" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
      <circle cx={x+66} cy={y+h} r="3.5" fill="#6b7280"/>
      {/* Route number */}
      <circle cx={x+6} cy={y+6} r="4" fill="#1f2937"/>
      <text x={x+6} y={y+8} textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="4" fill="white">9</text>
    </g>
  );
}

function Cyclist({ cx, color = "#3b82f6", flip = false }: {
  cx: number; color?: string; flip?: boolean;
}) {
  const y = RY - 36;
  return (
    <g transform={flip ? `scale(-1,1) translate(${-cx * 2},0)` : `translate(${cx - 10}, 0)`}>
      {/* Bike wheels */}
      <circle cx={10} cy={y+30} r={8} fill="none" stroke="#1f2937" strokeWidth="2"/>
      <circle cx={10} cy={y+30} r={2} fill="#1f2937"/>
      <circle cx={28} cy={y+30} r={8} fill="none" stroke="#1f2937" strokeWidth="2"/>
      <circle cx={28} cy={y+30} r={2} fill="#1f2937"/>
      {/* Frame */}
      <path d="M10 30 L18 18 L28 30 M18 18 L18 12 M18 18 L26 14"
        stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Handlebar */}
      <path d="M26 14 L30 12 M26 14 L30 16" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Rider body */}
      <path d="M18 12 L20 4" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      {/* Head */}
      <circle cx={20} cy={y-26+26} r={4} fill="#fcd34d" stroke="#1f2937" strokeWidth="1"/>
      {/* Helmet */}
      <path d="M17 0 Q20 -4 23 0" stroke={color} strokeWidth="2" fill="none" transform={`translate(0,${y-26+26-4})`}/>
      {/* Arms */}
      <path d="M20 6 L26 10" stroke={color} strokeWidth="2" strokeLinecap="round" transform={`translate(0,${y-26})`}/>
      {/* Legs */}
      <path d="M18 12 L14 20 M18 12 L22 20" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" transform={`translate(0,${y-26})`}/>
    </g>
  );
}

function Pedestrian({ cx, shirt = "#3b82f6", flip = false }: {
  cx: number; shirt?: string; flip?: boolean;
}) {
  const y = RY - 42;
  return (
    <g transform={flip ? `scale(-1,1) translate(${-cx * 2 - 16},0)` : `translate(${cx - 8}, 0)`}>
      {/* Head */}
      <circle cx={8} cy={y+4} r={5} fill="#fcd34d" stroke="#1f2937" strokeWidth="1"/>
      {/* Body */}
      <rect x={4} y={y+9} width={8} height={12} rx="2" fill={shirt} stroke="#1f2937" strokeWidth="1"/>
      {/* Arms */}
      <rect x={1} y={y+10} width={3} height={8} rx="1.5" fill={shirt} stroke="#1f2937" strokeWidth="0.8"/>
      <rect x={12} y={y+10} width={3} height={8} rx="1.5" fill={shirt} stroke="#1f2937" strokeWidth="0.8"/>
      {/* Legs */}
      <rect x={4} y={y+21} width={3} height={10} rx="1.5" fill="#1f2937"/>
      <rect x={9} y={y+21} width={3} height={10} rx="1.5" fill="#1f2937"/>
      {/* Shoes */}
      <ellipse cx={5.5} cy={y+31} rx={3} ry={1.5} fill="#374151"/>
      <ellipse cx={10.5} cy={y+31} rx={3} ry={1.5} fill="#374151"/>
    </g>
  );
}

function Streetlight({ x, side }: { x: number; side: "left" | "right" }) {
  const armDir = side === "left" ? 1 : -1;
  const poleX = x;
  const topY = 30;
  const baseY = RY + RH;
  const armEndX = poleX + armDir * 40;
  const armEndY = topY + 10;
  return (
    <g>
      {/* Pole */}
      <line x1={poleX} y1={baseY} x2={poleX} y2={topY + 30}
        stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"/>
      {/* Curved arm */}
      <path d={`M${poleX} ${topY+30} Q${poleX} ${topY+10} ${armEndX} ${armEndY}`}
        stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Fixture housing */}
      <rect x={armEndX - 10} y={armEndY} width={20} height={7} rx="3" fill="#1A1A1A"/>
      {/* Glow */}
      <circle cx={armEndX} cy={armEndY + 3} r={18} fill="url(#lightGlow)" opacity="0.6"/>
      {/* Bulb */}
      <circle cx={armEndX} cy={armEndY + 3} r={5} fill="#FFFDE7" stroke="#e5e7eb" strokeWidth="0.8"/>
      {/* Ground shadow */}
      <ellipse cx={poleX} cy={baseY} rx={6} ry={2} fill="#00000020"/>
    </g>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function StreetHero() {
  return (
    <section className="w-full bg-white overflow-hidden" aria-hidden="true">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1000 430"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full min-w-[800px]"
          style={{ display: "block" }}
        >
          <defs>
            <pattern id="yellowHatch" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
              <rect width="12" height="12" fill="#1a1a1a"/>
              <rect width="6" height="12" fill="#FFD700"/>
            </pattern>
            <pattern id="whiteHatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#4a4a4a"/>
              <rect width="5" height="10" fill="rgba(255,255,255,0.22)"/>
            </pattern>
            <pattern id="concrete" patternUnits="userSpaceOnUse" width="30" height="30">
              <rect width="30" height="30" fill="#E0E0E0"/>
              <line x1="0" y1="15" x2="30" y2="15" stroke="#C8C8C8" strokeWidth="0.4"/>
              <line x1="15" y1="0" x2="15" y2="30" stroke="#C8C8C8" strokeWidth="0.4"/>
            </pattern>
            <pattern id="asphalt" patternUnits="userSpaceOnUse" width="6" height="6">
              <rect width="6" height="6" fill="#333333"/>
              <circle cx="1.5" cy="1.5" r="0.5" fill="#2c2c2c"/>
              <circle cx="4.5" cy="4.5" r="0.4" fill="#3a3a3a"/>
            </pattern>
            <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5D4037"/>
              <stop offset="45%" stopColor="#8D6E63"/>
              <stop offset="100%" stopColor="#3E2723"/>
            </linearGradient>
            <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDE7" stopOpacity="0.95"/>
              <stop offset="60%" stopColor="#FFF9C4" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0"/>
            </radialGradient>
            <filter id="vShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
            </filter>
          </defs>

          {/* ── BACKGROUND ── */}
          <rect width="1000" height="430" fill="#FFFFFF"/>

          {/* ── TOP LABEL ── */}
          <text x="500" y="18" textAnchor="middle"
            fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
            fontWeight="700" fontSize="10" fill="#333333" letterSpacing="2.5">
            17TH TO 21ST, TYPICAL BLOCK
          </text>

          {/* ── WIDTH LABELS ── */}
          {[
            { x: L.lsw.x + L.lsw.w/2, t: "9 ft." },
            { x: L.lp.x  + L.lp.w/2,  t: "8 ft." },
            { x: L.sbt.x + L.sbt.w/2, t: "12 ft." },
            { x: L.sb1.x + L.sb1.w/2, t: "10 ft." },
            { x: L.sb2.x + L.sb2.w/2, t: "10 ft." },
            { x: L.med.x + L.med.w/2, t: "4 ft." },
            { x: L.nbt.x + L.nbt.w/2, t: "10 ft." },
            { x: L.nb1.x + L.nb1.w/2, t: "10 ft." },
            { x: L.nb2.x + L.nb2.w/2, t: "10 ft." },
            { x: L.buf.x + L.buf.w/2, t: "2 ft." },
            { x: L.nbk.x + L.nbk.w/2, t: "6 ft." },
            { x: L.rp.x  + L.rp.w/2,  t: "8 ft." },
            { x: L.rsw.x + L.rsw.w/2, t: "9 ft." },
          ].map(({ x, t }) => (
            <text key={x} x={x} y="30" textAnchor="middle"
              fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
              fontWeight="700" fontSize="8" fill="#555555">{t}</text>
          ))}

          {/* ── LANE SURFACES ── */}
          <rect x={L.lsw.x} y={RY} width={L.lsw.w} height={RH} fill="url(#concrete)"/>
          <rect x={L.lp.x}  y={RY} width={L.lp.w}  height={RH} fill="#D0D0D0"/>
          <rect x={L.sbt.x} y={RY} width={L.sbt.w} height={RH} fill="#C62828" opacity="0.88"/>
          <rect x={L.sb1.x} y={RY} width={L.sb1.w} height={RH} fill="url(#asphalt)"/>
          <rect x={L.sb2.x} y={RY} width={L.sb2.w} height={RH} fill="url(#asphalt)"/>
          <rect x={L.med.x} y={RY} width={L.med.w} height={RH} fill="url(#yellowHatch)"/>
          <rect x={L.nbt.x} y={RY} width={L.nbt.w} height={RH} fill="url(#asphalt)"/>
          <rect x={L.nb1.x} y={RY} width={L.nb1.w} height={RH} fill="url(#asphalt)"/>
          <rect x={L.nb2.x} y={RY} width={L.nb2.w} height={RH} fill="url(#asphalt)"/>
          <rect x={L.buf.x} y={RY} width={L.buf.w} height={RH} fill="url(#whiteHatch)"/>
          <rect x={L.nbk.x} y={RY} width={L.nbk.w} height={RH} fill="#4CAF50" opacity="0.88"/>
          <rect x={L.rp.x}  y={RY} width={L.rp.w}  height={RH} fill="#D0D0D0"/>
          <rect x={L.rsw.x} y={RY} width={L.rsw.w} height={RH} fill="url(#concrete)"/>

          {/* ── CURBS ── */}
          <rect x={L.lp.x + L.lp.w - 2} y={RY + RH - 10} width={4} height={12} rx="1" fill="#888"/>
          <rect x={L.rp.x - 2}           y={RY + RH - 10} width={4} height={12} rx="1" fill="#888"/>

          {/* ── LANE DIVIDERS ── */}
          {[L.sb1.x, L.sb2.x, L.nbt.x, L.nb1.x, L.nb2.x].map(x => (
            <line key={x} x1={x} y1={RY} x2={x} y2={RY+RH}
              stroke="white" strokeWidth="1.5" strokeDasharray="9,9" opacity="0.6"/>
          ))}
          <line x1={L.sbt.x}           y1={RY} x2={L.sbt.x}           y2={RY+RH} stroke="white"   strokeWidth="2"/>
          <line x1={L.med.x}           y1={RY} x2={L.med.x}           y2={RY+RH} stroke="#FFD700" strokeWidth="2"/>
          <line x1={L.med.x+L.med.w}   y1={RY} x2={L.med.x+L.med.w}   y2={RY+RH} stroke="#FFD700" strokeWidth="2"/>
          <line x1={L.buf.x}           y1={RY} x2={L.buf.x}           y2={RY+RH} stroke="white"   strokeWidth="1.5"/>
          <line x1={L.nbk.x}           y1={RY} x2={L.nbk.x}           y2={RY+RH} stroke="white"   strokeWidth="2"/>
          <line x1={L.rp.x}            y1={RY} x2={L.rp.x}            y2={RY+RH} stroke="#A0A0A0" strokeWidth="1.5"/>
          <line x1={L.lp.x+L.lp.w}    y1={RY} x2={L.lp.x+L.lp.w}    y2={RY+RH} stroke="#A0A0A0" strokeWidth="1.5"/>

          {/* ── ROAD MARKINGS: ARROWS ── */}
          {/* SB arrows */}
          {[L.sb1, L.sb2].map((ln, i) => (
            <g key={i} transform={`translate(${ln.x + ln.w/2 - 7}, ${RY + 22})`}>
              <path d="M7 0 L7 26 M1 18 L7 26 L13 18"
                fill="none" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.75"/>
            </g>
          ))}
          {/* NB turn arrow */}
          <g transform={`translate(${L.nbt.x + L.nbt.w/2 - 10}, ${RY + 18})`}>
            <path d="M14 38 L14 18 Q14 8 8 8 L2 8 M2 8 L6 3 M2 8 L6 13"
              fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.75"/>
          </g>
          {/* NB arrows */}
          {[L.nb1, L.nb2].map((ln, i) => (
            <g key={i} transform={`translate(${ln.x + ln.w/2 - 7}, ${RY + 22})`}>
              <path d="M7 26 L7 0 M1 8 L7 0 L13 8"
                fill="none" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.75"/>
            </g>
          ))}

          {/* ── STENCILS ── */}
          {/* Bus stencil in transit lane */}
          <g transform={`translate(${L.sbt.x + 14}, ${RY + 18})`} opacity="0.5">
            <rect x="0" y="0" width="30" height="22" rx="2" fill="white"/>
            <rect x="3" y="3" width="10" height="11" rx="1" fill="#C62828"/>
            <rect x="17" y="3" width="10" height="11" rx="1" fill="#C62828"/>
            <circle cx="7"  cy="22" r="3.5" fill="white" stroke="#C62828" strokeWidth="1.5"/>
            <circle cx="23" cy="22" r="3.5" fill="white" stroke="#C62828" strokeWidth="1.5"/>
          </g>
          {/* Bike stencil in transit lane */}
          <g transform={`translate(${L.sbt.x + 58}, ${RY + 20})`} opacity="0.5">
            <circle cx="6"  cy="20" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <circle cx="22" cy="20" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <path d="M14 4 L12 14 L6 20 M14 4 L16 14 L22 20 M14 4 L18 2"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="2" r="2.5" fill="white"/>
          </g>
          {/* Bike stencil in NB bike lane */}
          <g transform={`translate(${L.nbk.x + 8}, ${RY + 20})`} opacity="0.5">
            <circle cx="6"  cy="20" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <circle cx="22" cy="20" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <path d="M14 4 L12 14 L6 20 M14 4 L16 14 L22 20 M14 4 L18 2"
              stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="2" r="2.5" fill="white"/>
          </g>

          {/* ── PARKING SIGNS ── */}
          <g transform={`translate(${L.lp.x + L.lp.w/2 - 13}, ${RY + 28})`}>
            <rect width="26" height="26" rx="3" fill="#0066CC"/>
            <rect x="1.5" y="1.5" width="23" height="23" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
            <text x="13" y="20" textAnchor="middle"
              fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="17" fill="white">P</text>
          </g>
          <g transform={`translate(${L.rp.x + L.rp.w/2 - 13}, ${RY + 28})`}>
            <rect width="26" height="26" rx="3" fill="#0066CC"/>
            <rect x="1.5" y="1.5" width="23" height="23" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
            <text x="13" y="20" textAnchor="middle"
              fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="17" fill="white">P</text>
          </g>

          {/* ── SOIL / UNDERGROUND ── */}
          <rect x="0" y={GY} width="1000" height="4" fill="#222"/>
          <rect x="0" y={GY+4} width="1000" height="80" fill="url(#soilGrad)"/>

          {/* ── LANE LABELS BELOW ── */}
          {[
            { x: L.lsw.x+L.lsw.w/2, lines: ["SIDEWALK"],              dark: false },
            { x: L.lp.x +L.lp.w/2,  lines: ["PARKING"],               dark: false },
            { x: L.sbt.x+L.sbt.w/2, lines: ["SOUTHBOUND","TRANSIT/BIKE"], dark: true },
            { x: L.sb1.x+L.sb1.w/2, lines: ["SOUTHBOUND","TRAFFIC"],   dark: true },
            { x: L.sb2.x+L.sb2.w/2, lines: ["SOUTHBOUND","TRAFFIC"],   dark: true },
            { x: L.med.x+L.med.w/2, lines: ["MEDIAN"],                 dark: true },
            { x: L.nbt.x+L.nbt.w/2, lines: ["NORTHBOUND","LEFT TURN"], dark: true },
            { x: L.nb1.x+L.nb1.w/2, lines: ["NORTHBOUND","TRAFFIC"],   dark: true },
            { x: L.nb2.x+L.nb2.w/2, lines: ["NORTHBOUND","TRAFFIC"],   dark: true },
            { x: L.buf.x+L.buf.w/2, lines: ["BUF."],                   dark: true },
            { x: L.nbk.x+L.nbk.w/2, lines: ["N-BOUND","BIKE"],         dark: true },
            { x: L.rp.x +L.rp.w/2,  lines: ["PARKING"],               dark: false },
            { x: L.rsw.x+L.rsw.w/2, lines: ["SIDEWALK"],              dark: false },
          ].map(({ x, lines, dark }) => (
            <g key={x}>
              {lines.map((line, i) => (
                <text key={i} x={x} y={GY + 14 + i * 9}
                  textAnchor="middle"
                  fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
                  fontWeight="700" fontSize="6.5"
                  fill={dark ? "#bbb" : "#555"}>
                  {line}
                </text>
              ))}
            </g>
          ))}

          {/* ── STREETLIGHTS ── */}
          <Streetlight x={L.lsw.x + 12} side="left"/>
          <Streetlight x={L.rsw.x + L.rsw.w - 12} side="right"/>

          {/* ── ANIMATED VEHICLES ── */}

          {/* Parked car left */}
          <Car cx={L.lp.x + L.lp.w/2} body="#9ca3af" roof="#6b7280"/>

          {/* Transit Bus — animated southbound */}
          <g>
            <animateTransform
              attributeName="transform" type="translate"
              values="120 0; -200 0" dur="18s" repeatCount="indefinite"
              additive="sum"/>
            <Bus cx={L.sbt.x + L.sbt.w/2}/>
          </g>

          {/* SB Traffic cars */}
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="80 0; -300 0" dur="14s" repeatCount="indefinite" additive="sum"/>
            <Car cx={L.sb1.x + L.sb1.w/2} body="#6b7280" roof="#4b5563"/>
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="0 0; -380 0" dur="16s" repeatCount="indefinite" additive="sum"/>
            <Car cx={L.sb2.x + L.sb2.w/2} body="#9ca3af" roof="#6b7280"/>
          </g>

          {/* NB Turn lane car */}
          <Car cx={L.nbt.x + L.nbt.w/2} body="#374151" roof="#1f2937" flip/>

          {/* NB Traffic cars */}
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="-60 0; 320 0" dur="15s" repeatCount="indefinite" additive="sum"/>
            <Car cx={L.nb1.x + L.nb1.w/2} body="#6b7280" roof="#4b5563" flip/>
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 380 0" dur="17s" repeatCount="indefinite" additive="sum"/>
            <Car cx={L.nb2.x + L.nb2.w/2} body="#9ca3af" roof="#6b7280" flip/>
          </g>

          {/* Parked car right */}
          <Car cx={L.rp.x + L.rp.w/2} body="#9ca3af" roof="#6b7280" flip/>

          {/* ── ANIMATED CYCLISTS ── */}
          {/* SB cyclist in transit lane */}
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="60 0; -280 0" dur="22s" repeatCount="indefinite" additive="sum"/>
            <Cyclist cx={L.sbt.x + 30} color="#ef4444"/>
          </g>
          {/* NB cyclist in bike lane */}
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="-40 0; 260 0" dur="20s" repeatCount="indefinite" additive="sum"/>
            <Cyclist cx={L.nbk.x + L.nbk.w/2} color="#22c55e" flip/>
          </g>

          {/* ── PEDESTRIANS ── */}
          {/* Left sidewalk — walking right */}
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="-30 0; 60 0" dur="12s" repeatCount="indefinite" additive="sum"/>
            <Pedestrian cx={L.lsw.x + 30} shirt="#3b82f6"/>
          </g>
          {/* Right sidewalk — walking left */}
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="30 0; -60 0" dur="13s" repeatCount="indefinite" additive="sum"/>
            <Pedestrian cx={L.rsw.x + 45} shirt="#ef4444" flip/>
          </g>

          {/* ── BOTTOM LABEL ── */}
          <text x="500" y="418" textAnchor="middle"
            fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
            fontWeight="700" fontSize="10" fill="#333333" letterSpacing="2.5">
            INTERSECTION
          </text>
        </svg>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        section { animation: fadeIn 0.8s ease both; }
      `}</style>
    </section>
  );
}
