"use client";

// Lane x-positions and widths (viewBox 1000 wide, road from x=0 to x=1000)
// Left Sidewalk:   x=0,   w=75
// Left Parking:    x=75,  w=67
// SB Transit/Bike: x=142, w=100
// SB Traffic 1:    x=242, w=83
// SB Traffic 2:    x=325, w=83
// Center Median:   x=408, w=40
// NB Turn Lane:    x=448, w=83
// NB Traffic 1:    x=531, w=83
// NB Traffic 2:    x=614, w=83
// Safety Buffer:   x=697, w=20
// NB Bike Lane:    x=717, w=50
// Right Parking:   x=767, w=67
// Right Sidewalk:  x=834, w=75 (to 909)
// Total road: 909px, centered in 1000 with 45.5 margin each side
// Adjusted: offset +45 → Left SW x=45, Right SW ends at 954

export function CompleteStreet() {
  const O = 45; // left offset
  const lanes = {
    lsw:  { x: O + 0,   w: 75  },
    lp:   { x: O + 75,  w: 67  },
    sbt:  { x: O + 142, w: 100 },
    sb1:  { x: O + 242, w: 83  },
    sb2:  { x: O + 325, w: 83  },
    med:  { x: O + 408, w: 40  },
    nbt:  { x: O + 448, w: 83  },
    nb1:  { x: O + 531, w: 83  },
    nb2:  { x: O + 614, w: 83  },
    buf:  { x: O + 697, w: 20  },
    nbk:  { x: O + 717, w: 50  },
    rp:   { x: O + 767, w: 67  },
    rsw:  { x: O + 834, w: 75  },
  };
  const roadY = 290; // top of road surface
  const roadH = 80;  // road height
  const groundY = roadY + roadH;

  return (
    <section className="w-full bg-white overflow-hidden select-none">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1000 480"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full min-w-[800px]"
          style={{ display: "block" }}
          aria-hidden="true"
        >
          <defs>
            <pattern id="yellowHatch" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
              <rect width="12" height="12" fill="#1a1a1a"/>
              <rect width="6" height="12" fill="#FFD700"/>
            </pattern>
            <pattern id="whiteHatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#4a4a4a"/>
              <rect width="5" height="10" fill="rgba(255,255,255,0.2)"/>
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
              <stop offset="50%" stopColor="#FFF9C4" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0"/>
            </radialGradient>
            <filter id="vShadow">
              <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
            </filter>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.12"/>
            </filter>
          </defs>

          {/* ── BACKGROUND ── */}
          <rect width="1000" height="480" fill="#FFFFFF"/>

          {/* ── TOP LABEL ── */}
          <text x="500" y="22" textAnchor="middle"
            fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
            fontWeight="700" fontSize="11" fill="#333333" letterSpacing="2.5">
            17TH TO 21ST, TYPICAL BLOCK
          </text>

          {/* ── LANE WIDTH LABELS (above road) ── */}
          {[
            { x: lanes.lsw.x + lanes.lsw.w/2,  label: "9 ft." },
            { x: lanes.lp.x  + lanes.lp.w/2,   label: "8 ft." },
            { x: lanes.sbt.x + lanes.sbt.w/2,  label: "12 ft." },
            { x: lanes.sb1.x + lanes.sb1.w/2,  label: "10 ft." },
            { x: lanes.sb2.x + lanes.sb2.w/2,  label: "10 ft." },
            { x: lanes.med.x + lanes.med.w/2,  label: "4 ft." },
            { x: lanes.nbt.x + lanes.nbt.w/2,  label: "10 ft." },
            { x: lanes.nb1.x + lanes.nb1.w/2,  label: "10 ft." },
            { x: lanes.nb2.x + lanes.nb2.w/2,  label: "10 ft." },
            { x: lanes.buf.x + lanes.buf.w/2,  label: "2 ft." },
            { x: lanes.nbk.x + lanes.nbk.w/2,  label: "6 ft." },
            { x: lanes.rp.x  + lanes.rp.w/2,   label: "8 ft." },
            { x: lanes.rsw.x + lanes.rsw.w/2,  label: "9 ft." },
          ].map(({ x, label }) => (
            <text key={label + x} x={x} y="38"
              textAnchor="middle"
              fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
              fontWeight="700" fontSize="9" fill="#555555">
 
              {label}
            </text>
          ))}

          {/* ── LANE SURFACES ── */}
          {/* Left Sidewalk */}
          <rect x={lanes.lsw.x} y={roadY} width={lanes.lsw.w} height={roadH} fill="url(#concrete)"/>
          {/* Left Parking */}
          <rect x={lanes.lp.x} y={roadY} width={lanes.lp.w} height={roadH} fill="#D0D0D0"/>
          {/* SB Transit/Bike */}
          <rect x={lanes.sbt.x} y={roadY} width={lanes.sbt.w} height={roadH} fill="#C62828" opacity="0.88"/>
          {/* SB Traffic 1 */}
          <rect x={lanes.sb1.x} y={roadY} width={lanes.sb1.w} height={roadH} fill="url(#asphalt)"/>
          {/* SB Traffic 2 */}
          <rect x={lanes.sb2.x} y={roadY} width={lanes.sb2.w} height={roadH} fill="url(#asphalt)"/>
          {/* Center Median */}
          <rect x={lanes.med.x} y={roadY} width={lanes.med.w} height={roadH} fill="url(#yellowHatch)"/>
          {/* NB Turn Lane */}
          <rect x={lanes.nbt.x} y={roadY} width={lanes.nbt.w} height={roadH} fill="url(#asphalt)"/>
          {/* NB Traffic 1 */}
          <rect x={lanes.nb1.x} y={roadY} width={lanes.nb1.w} height={roadH} fill="url(#asphalt)"/>
          {/* NB Traffic 2 */}
          <rect x={lanes.nb2.x} y={roadY} width={lanes.nb2.w} height={roadH} fill="url(#asphalt)"/>
          {/* Safety Buffer */}
          <rect x={lanes.buf.x} y={roadY} width={lanes.buf.w} height={roadH} fill="url(#whiteHatch)"/>
          {/* NB Bike Lane */}
          <rect x={lanes.nbk.x} y={roadY} width={lanes.nbk.w} height={roadH} fill="#4CAF50" opacity="0.88"/>
          {/* Right Parking */}
          <rect x={lanes.rp.x} y={roadY} width={lanes.rp.w} height={roadH} fill="#D0D0D0"/>
          {/* Right Sidewalk */}
          <rect x={lanes.rsw.x} y={roadY} width={lanes.rsw.w} height={roadH} fill="url(#concrete)"/>

          {/* ── ROAD EDGE / CURBS ── */}
          <rect x={lanes.lp.x} y={roadY + roadH - 8} width={2} height={10} fill="#888"/>
          <rect x={lanes.rp.x + lanes.rp.w} y={roadY + roadH - 8} width={2} height={10} fill="#888"/>

          {/* ── LANE DIVIDERS ── */}
          {/* Dashed white between traffic lanes */}
          {[lanes.sb1.x, lanes.sb2.x, lanes.nbt.x, lanes.nb1.x, lanes.nb2.x].map((x) => (
            <line key={x} x1={x} y1={roadY} x2={x} y2={roadY + roadH}
              stroke="white" strokeWidth="1.5" strokeDasharray="9,9" opacity="0.65"/>
          ))}
          {/* Solid boundaries */}
          <line x1={lanes.sbt.x} y1={roadY} x2={lanes.sbt.x} y2={roadY + roadH} stroke="white" strokeWidth="2"/>
          <line x1={lanes.med.x} y1={roadY} x2={lanes.med.x} y2={roadY + roadH} stroke="#FFD700" strokeWidth="2"/>
          <line x1={lanes.med.x + lanes.med.w} y1={roadY} x2={lanes.med.x + lanes.med.w} y2={roadY + roadH} stroke="#FFD700" strokeWidth="2"/>
          <line x1={lanes.buf.x} y1={roadY} x2={lanes.buf.x} y2={roadY + roadH} stroke="white" strokeWidth="1.5"/>
          <line x1={lanes.nbk.x} y1={roadY} x2={lanes.nbk.x} y2={roadY + roadH} stroke="white" strokeWidth="2"/>
          <line x1={lanes.rp.x} y1={roadY} x2={lanes.rp.x} y2={roadY + roadH} stroke="#A0A0A0" strokeWidth="1.5"/>
          <line x1={lanes.lp.x + lanes.lp.w} y1={roadY} x2={lanes.lp.x + lanes.lp.w} y2={roadY + roadH} stroke="#A0A0A0" strokeWidth="1.5"/>

          {/* ── ROAD MARKINGS: ARROWS ── */}
          {/* SB Arrow lane 1 */}
          <g transform={`translate(${lanes.sb1.x + lanes.sb1.w/2 - 8}, ${roadY + 18})`}>
            <path d="M8 0 L8 28 M2 20 L8 28 L14 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </g>
          {/* SB Arrow lane 2 */}
          <g transform={`translate(${lanes.sb2.x + lanes.sb2.w/2 - 8}, ${roadY + 18})`}>
            <path d="M8 0 L8 28 M2 20 L8 28 L14 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </g>
          {/* NB Turn Arrow */}
          <g transform={`translate(${lanes.nbt.x + lanes.nbt.w/2 - 10}, ${roadY + 14})`}>
            <path d="M14 36 L14 16 Q14 8 8 8 L2 8 M2 8 L6 3 M2 8 L6 13" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </g>
          {/* NB Arrow lane 1 */}
          <g transform={`translate(${lanes.nb1.x + lanes.nb1.w/2 - 8}, ${roadY + 18})`}>
            <path d="M8 28 L8 0 M2 8 L8 0 L14 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </g>
          {/* NB Arrow lane 2 */}
          <g transform={`translate(${lanes.nb2.x + lanes.nb2.w/2 - 8}, ${roadY + 18})`}>
            <path d="M8 28 L8 0 M2 8 L8 0 L14 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </g>

          {/* ── BUS + BIKE STENCILS in Transit Lane ── */}
          {/* Bus stencil */}
          <g transform={`translate(${lanes.sbt.x + 18}, ${roadY + 14})`} opacity="0.55">
            <rect x="0" y="0" width="28" height="20" rx="2" fill="white"/>
            <rect x="3" y="3" width="9" height="10" rx="1" fill="#C62828"/>
            <rect x="16" y="3" width="9" height="10" rx="1" fill="#C62828"/>
            <circle cx="6" cy="20" r="3" fill="white" stroke="#C62828" strokeWidth="1.5"/>
            <circle cx="22" cy="20" r="3" fill="white" stroke="#C62828" strokeWidth="1.5"/>
          </g>
          {/* Bike stencil */}
          <g transform={`translate(${lanes.sbt.x + 58}, ${roadY + 16})`} opacity="0.55">
            <circle cx="6" cy="18" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <circle cx="22" cy="18" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <path d="M14 4 L12 12 L6 18 M14 4 L16 12 L22 18 M14 4 L18 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="2" r="2" fill="white"/>
          </g>
          {/* Bike stencil in NB bike lane */}
          <g transform={`translate(${lanes.nbk.x + 10}, ${roadY + 16})`} opacity="0.55">
            <circle cx="6" cy="18" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <circle cx="22" cy="18" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
            <path d="M14 4 L12 12 L6 18 M14 4 L16 12 L22 18 M14 4 L18 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="18" cy="2" r="2" fill="white"/>
          </g>

          {/* ── PARKING SIGN (Left) ── */}
          <g transform={`translate(${lanes.lp.x + lanes.lp.w/2 - 14}, ${roadY + 22})`}>
            <rect width="28" height="28" rx="3" fill="#0066CC"/>
            <rect x="1.5" y="1.5" width="25" height="25" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
            <text x="14" y="21" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="18" fill="white">P</text>
          </g>
          {/* PARKING SIGN (Right) */}
          <g transform={`translate(${lanes.rp.x + lanes.rp.w/2 - 14}, ${roadY + 22})`}>
            <rect width="28" height="28" rx="3" fill="#0066CC"/>
            <rect x="1.5" y="1.5" width="25" height="25" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
            <text x="14" y="21" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="18" fill="white">P</text>
          </g>

          {/* ── SOIL / UNDERGROUND ── */}
          <rect x="0" y={groundY} width="1000" height="90" fill="url(#soilGrad)"/>
          <rect x="0" y={groundY} width="1000" height="4" fill="#222"/>

          {/* ── LANE LABELS BELOW ROAD ── */}
          {[
            { x: lanes.lsw.x + lanes.lsw.w/2, lines: ["SIDEWALK"] },
            { x: lanes.lp.x  + lanes.lp.w/2,  lines: ["PARKING"] },
            { x: lanes.sbt.x + lanes.sbt.w/2, lines: ["SOUTHBOUND", "TRANSIT/BIKE"] },
            { x: lanes.sb1.x + lanes.sb1.w/2, lines: ["SOUTHBOUND", "TRAFFIC"] },
            { x: lanes.sb2.x + lanes.sb2.w/2, lines: ["SOUTHBOUND", "TRAFFIC"] },
            { x: lanes.med.x + lanes.med.w/2, lines: ["MEDIAN"] },
            { x: lanes.nbt.x + lanes.nbt.w/2, lines: ["NORTHBOUND", "LEFT TURN"] },
            { x: lanes.nb1.x + lanes.nb1.w/2, lines: ["NORTHBOUND", "TRAFFIC"] },
            { x: lanes.nb2.x + lanes.nb2.w/2, lines: ["NORTHBOUND", "TRAFFIC"] },
            { x: lanes.buf.x + lanes.buf.w/2, lines: ["BUF."] },
            { x: lanes.nbk.x + lanes.nbk.w/2, lines: ["N-BOUND", "BIKE"] },
            { x: lanes.rp.x  + lanes.rp.w/2,  lines: ["PARKING"] },
            { x: lanes.rsw.x + lanes.rsw.w/2, lines: ["SIDEWALK"] },
          ].map(({ x, lines }) => (
            <g key={x}>
              {lines.map((line, i) => (
                <text key={i} x={x} y={groundY + 14 + i * 9}
                  textAnchor="middle"
                  fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
                  fontWeight="700" fontSize="6.5"
                  fill={x > lanes.sbt.x && x < lanes.med.x + lanes.med.w/2 ? "#ccc" :
                        x > lanes.med.x + lanes.med.w/2 && x < lanes.rp.x ? "#ccc" : "#555"}>
                  {line}
                </text>
              ))}
            </g>
          ))}

          {/* ── BOTTOM LABEL ── */}
          <text x="500" y="460" textAnchor="middle"
            fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
            fontWeight="700" fontSize="11" fill="#333333" letterSpacing="2.5">
            INTERSECTION
          </text>
        </svg>
      </div>
    </section>
  );
}
