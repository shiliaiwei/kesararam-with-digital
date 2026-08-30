"use client";

import type { CSSProperties, ReactNode } from "react";
import { normalizeScorePlateStyle, type ScorePlateStyle } from "@/lib/score-plates";
import { useLang } from "@/context/lang-context";

type ScorePlateSize = "xs" | "sm" | "md" | "lg";

// Comprehensive Cambodian province abbreviation lookup
const PROVINCE_ABBRS: Record<string, string> = {
  "siem reap": "សរ",
  "siemreap": "សរ",
  "phnom penh": "ភភ",
  "phnompenh": "ភភ",
  "battambang": "បប",
  "banteay meanchey": "ប.មានជ័យ",
  "banteaymeanchey": "ប.មានជ័យ",
  "kampong cham": "កច",
  "kampongcham": "កច",
  "kampong chhnang": "កឆ",
  "kampongchhnang": "កឆ",
  "kampong speu": "កស",
  "kampongspeu": "កស",
  "kampong thom": "កធ",
  "kampongthom": "កធ",
  "kampot": "កព",
  "kandal": "កដ",
  "koh kong": "កក",
  "kohkong": "កក",
  "kratie": "ក្រចេះ",
  "kratié": "ក្រចេះ",
  "mondulkiri": "មគ",
  "preah vihear": "ព្រះវិហារ",
  "preahvihear": "ព្រះវិហារ",
  "prey veng": "ព្រវែង",
  "preyveng": "ព្រវែង",
  "pursat": "ពស",
  "ratanakiri": "រគ",
  "preah sihanouk": "សីហនុ",
  "sihanoukville": "សីហនុ",
  "stung treng": "ស្ត្រ",
  "stungtreng": "ស្ត្រ",
  "svay rieng": "សរ",
  "svayrieng": "សរ",
  "takeo": "តក",
  "takéo": "តក",
  "otdar meanchey": "ឧ.មានជ័យ",
  "oddar meanchey": "ឧ.មានជ័យ",
  "oddarmeanchey": "ឧ.មានជ័យ",
  "kep": "កែប",
  "pailin": "ប៉ៃលិន",
  "tboung khmum": "តឃ",
  "tboungkhmum": "តឃ",
  "cambodia": "កម",
};

// Comprehensive English province abbreviation lookup
const EN_PROVINCE_ABBRS: Record<string, string> = {
  "siem reap": "SR",
  "siemreap": "SR",
  "phnom penh": "PP",
  "phnompenh": "PP",
  "battambang": "BTB",
  "banteay meanchey": "BMC",
  "banteaymeanchey": "BMC",
  "kampong cham": "KC",
  "kampongcham": "KC",
  "kampong chhnang": "KCH",
  "kampongchhnang": "KCH",
  "kampong speu": "KS",
  "kampongspeu": "KS",
  "kampong thom": "KT",
  "kampongthom": "KT",
  "kampot": "KP",
  "kandal": "KD",
  "koh kong": "KK",
  "kohkong": "KK",
  "kratie": "KRT",
  "kratié": "KRT",
  "mondulkiri": "MK",
  "preah vihear": "PV",
  "preahvihear": "PV",
  "prey veng": "PVG",
  "preyveng": "PVG",
  "pursat": "PS",
  "ratanakiri": "RK",
  "preah sihanouk": "SHV",
  "sihanoukville": "SHV",
  "stung treng": "STR",
  "stungtreng": "STR",
  "svay rieng": "SVR",
  "svayrieng": "SVR",
  "takeo": "TK",
  "takéo": "TK",
  "otdar meanchey": "OMC",
  "oddar meanchey": "OMC",
  "oddarmeanchey": "OMC",
  "kep": "KEP",
  "pailin": "PL",
  "tboung khmum": "TBK",
  "tboungkhmum": "TBK",
  "cambodia": "KH",
};

interface ScorePlateProps {
  value: number | ReactNode;
  styleId?: ScorePlateStyle | string | null;
  provinceEn?: string | null;
  provinceKh?: string | null;
  size?: ScorePlateSize;
  className?: string;
  shadow?: boolean;
  isSoloDriver?: boolean;
}

const DIMENSIONS: Record<
  ScorePlateSize,
  { width: number; height: number; value: number; top: number; bottom: number }
> = {
  xs: { width: 72, height: 38, value: 14, top: 6, bottom: 5 },
  sm: { width: 90, height: 48, value: 20, top: 8, bottom: 7 },
  md: { width: 122, height: 64, value: 27, top: 9, bottom: 8 },
  lg: { width: 150, height: 78, value: 34, top: 10, bottom: 9 },
};

function PlateValue({ value }: { value: number | ReactNode }) {
  return <>{typeof value === "number" ? value.toString() : value}</>;
}

export function ScorePlate({
  value,
  styleId,
  provinceEn,
  provinceKh,
  size = "sm",
  className = "",
  shadow = false,
  isSoloDriver = false,
}: ScorePlateProps) {
  const langCtx = useLang();
  const style = normalizeScorePlateStyle(styleId);
  const d = DIMENSIONS[size];
  const en = (provinceEn || "CAMBODIA").toUpperCase();
  const kh = provinceKh || "កម្ពុជា";
  const shell: CSSProperties = {
    width: d.width,
    height: d.height,
    boxShadow: shadow ? "4px 4px 0 #000" : undefined,
  };
  const valueStyle: CSSProperties = { fontSize: d.value };
  const topStyle: CSSProperties = { fontSize: d.top };
  const bottomStyle: CSSProperties = { fontSize: d.bottom };

  // --- Official MPWT Plate (Premium Cambodian License Plate look with navy border, red labels & bold navy number) ---
  if (style === "official") {
    const navy = "#11355c"; // Premium authentic navy blue

    // Scale font sizes to fit perfectly within the plate dimensions and prevent cut-offs
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden bg-white text-center ${className}`}
        style={{
          ...shell,
          border: `${(size === "sm" || size === "xs") ? "2px" : "3px"} solid ${navy}`,
          borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Subtle metal plate sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

        {/* Screws/bolts in top corners */}
        <div
          className="absolute rounded-full bg-zinc-300 border border-zinc-500 flex items-center justify-center pointer-events-none"
          style={{
            width: size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7,
            height: size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7,
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            left: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            boxShadow: "inset 0.5px 0.5px 0.5px rgba(0,0,0,0.5)",
          }}
        >
          <div className="bg-zinc-600 rounded-full" style={{ width: "35%", height: "35%" }} />
        </div>
        <div
          className="absolute rounded-full bg-zinc-300 border border-zinc-500 flex items-center justify-center pointer-events-none"
          style={{
            width: size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7,
            height: size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7,
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            right: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            boxShadow: "inset 0.5px 0.5px 0.5px rgba(0,0,0,0.5)",
          }}
        >
          <div className="bg-zinc-600 rounded-full" style={{ width: "35%", height: "35%" }} />
        </div>

        {/* Top Text (Khmer Province/Country) in Navy Blue */}
        <span
          className="absolute font-bold leading-none text-center"
          style={{
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            fontSize: topFontSize,
            color: navy,
          }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) in Bold Navy (centered) */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{
            fontSize: valueFontSize,
            color: navy,
            transform: size === "xs" ? "translateY(-1.5px)" : size === "sm" ? "translateY(-2px)" : size === "md" ? "translateY(-2.5px)" : "translateY(-3.5px)",
          }}
        >
          <PlateValue value={value} />
        </span>

        {/* Bottom divider & English Province name in Red */}
        <div className="absolute left-0 right-0 flex flex-col items-center bottom-0">
          <div className="w-full border-t border-[#11355c] opacity-35" />
          <div
            className="w-full flex items-center justify-center relative"
            style={{
              paddingTop: size === "xs" ? 1 : size === "sm" ? 2 : size === "md" ? 3 : 4,
              paddingBottom: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4.5 : 6,
            }}
          >
            <span
              className="font-bold leading-none tracking-[0.14em]"
              style={{
                fontSize: bottomFontSize,
                color: "#dc2626", // Red text for English label
              }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Vintage 1990s Diplomatic Plate (Redesigned from Ribbon Plate) ---
  if (style === "ribbon") {
    const isMini = size === "xs";
    
    // Deterministic country code (e.g., 76 for Thailand, 34 for Indonesia, 40 for Japan)
    const countryCode = typeof value === "number" ? ((value % 90) + 10) : 76;

    // Font sizes scaled according to size
    const labelFontSize = size === "xs" ? 5 : size === "sm" ? 6.5 : size === "md" ? 8 : 10;
    const cdFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    
    // Screw positions
    const screwY = size === "xs" ? 3.5 : size === "sm" ? 4.5 : size === "md" ? 6.5 : 8;
    const screwX = size === "xs" ? 7 : size === "sm" ? 10 : size === "md" ? 14 : 18;
    const screwSize = size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border" : "border-2"}`}
        style={{
          ...shell,
          background: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)", // Rich gold-yellow metal
          borderColor: "#d97706", // Amber border edge
          borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Metal sheen and vignetting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/20 pointer-events-none rounded-[inherit]" />



        {/* Vertically spaced flex layout for clean non-overlapping elements */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            paddingBottom: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
          }}
        >
          {/* Top Khmer Province (Small pressed blue) */}
          <span
            className="font-black leading-none text-center select-none text-blue-900/60"
            style={{
              fontFamily: "var(--font-kh-ui)",
              fontSize: labelFontSize,
              textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.4)",
            }}
          >
            {kh}
          </span>

          {/* Large Bold Stenciled/Embossed CD number in Royal Blue */}
          <span
            className="font-mono font-black leading-none tabular-nums text-[#0b41be]"
            style={{
              fontSize: cdFontSize,
              textShadow: "1px 1px 1px rgba(255, 255, 255, 0.4), -0.75px -0.75px 0.5px rgba(0, 0, 0, 0.45)",
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom English Province (Small pressed blue) */}
          <span
            className="font-bold leading-none tracking-[0.2em] uppercase select-none text-blue-900/60"
            style={{
              fontFamily: "var(--font-roboto)",
              fontSize: labelFontSize * 0.9,
              textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.4)",
            }}
          >
            {en}
          </span>
        </div>
      </div>
    );
  }


  // --- Angkor Heritage Plate (Redesigned as Vintage 1972 Royal Government Plate, Red & Gold) ---
  if (style === "heritage") {
    const isMini = size === "xs";
    const gold = "#fcd34d"; // Rich gold color
    const darkGold = "#b45309";
    
    const labelFontSize = size === "xs" ? 5 : size === "sm" ? 6.5 : size === "md" ? 8 : 10;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;

    const screwY = size === "xs" ? 3.5 : size === "sm" ? 4.5 : size === "md" ? 6.5 : 8;
    const screwX = size === "xs" ? 7 : size === "sm" ? 10 : size === "md" ? 14 : 18;
    const screwSize = size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7;

    // Khmer province abbreviation mapping
    const khAbbr = PROVINCE_ABBRS[en.toLowerCase()] || kh.substring(0, 2);

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border" : "border-2"}`}
        style={{
          ...shell,
          background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 50%, #7f1d1d 100%)", // Royal Crimson Red
          borderColor: "#991b1b",
          borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Metal reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-[inherit]" />

        {/* Angkor Wat Silhouette Watermark (SVG, Gold) */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.09]"
          style={{
            width: size === "xs" ? 28 : size === "sm" ? 38 : size === "md" ? 52 : 68,
            height: size === "xs" ? 14 : size === "sm" ? 19 : size === "md" ? 26 : 34,
            transform: "translate(-50%, -60%)",
          }}
          viewBox="0 0 100 50"
          fill={gold}
        >
          <path d="M 50 10 L 52 14 L 54 14 L 54 22 L 46 22 L 46 14 L 48 14 Z M 40 18 L 42 22 L 44 22 L 44 32 L 36 32 L 36 22 L 38 22 Z M 60 18 L 62 22 L 64 22 L 64 32 L 56 32 L 56 22 L 58 22 Z M 30 25 L 32 28 L 34 28 L 34 40 L 26 40 L 26 28 L 28 28 Z M 70 25 L 72 28 L 74 28 L 74 40 L 66 40 L 66 28 L 68 28 Z M 20 40 L 80 40 L 80 44 L 20 44 Z" />
        </svg>

        {/* Vertically spaced flex layout to prevent any overlapping */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            paddingBottom: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
          }}
        >
          {/* Top spacer instead of label to keep flex layout balanced */}
          <div style={{ height: labelFontSize }} />

          {/* Stenciled Gold Value */}
          <span
            className="font-mono font-black leading-none tabular-nums"
            style={{
              fontSize: valueFontSize,
              color: gold,
              textShadow: "1.5px 1.5px 1.5px rgba(0,0,0,0.9), -0.5px -0.5px 0px rgba(255,255,255,0.2)",
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom Label (English Province name) in Gold */}
          <span
            className="font-bold leading-none tracking-[0.2em] uppercase select-none"
            style={{
              fontFamily: "var(--font-roboto)",
              fontSize: labelFontSize * 0.9,
              color: gold,
              textShadow: "1px 1px 1px rgba(0,0,0,0.8)",
            }}
          >
            {en}
          </span>
        </div>
      </div>
    );
  }

  // --- Eco-Green Plate (Redesigned as 1990-2004 Cambodian State/Government Plate) ---
  if (style === "eco") {
    const isMini = size === "xs";
    
    const labelFontSize = size === "xs" ? 5 : size === "sm" ? 6.5 : size === "md" ? 8 : 10;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;

    const screwY = size === "xs" ? 3.5 : size === "sm" ? 4.5 : size === "md" ? 6.5 : 8;
    const screwX = size === "xs" ? 7 : size === "sm" ? 10 : size === "md" ? 14 : 18;
    const screwSize = size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7;

    // Province State Codes (Cambodia)
    let stateCode = "១៧"; // Default Siem Reap (17)
    const provEnLower = en.toLowerCase();
    if (provEnLower.includes("phnom") || provEnLower.includes("penh")) stateCode = "១២";
    else if (provEnLower.includes("battambang")) stateCode = "០២";
    else if (provEnLower.includes("takeo")) stateCode = "២១";
    else if (provEnLower.includes("kampot")) stateCode = "០៧";
    else if (provEnLower.includes("kandal")) stateCode = "០៨";
    else if (provEnLower.includes("svay")) stateCode = "២០";

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border" : "border-2"}`}
        style={{
          ...shell,
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)", // State Teal-Green Metal
          borderColor: "#0f766e",
          borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Metal reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-[inherit]" />

        {/* Cute Leaf watermark in corner */}
        <svg
          className="absolute opacity-15 pointer-events-none"
          style={{
            width: size === "xs" ? 14 : size === "sm" ? 20 : size === "md" ? 28 : 36,
            height: size === "xs" ? 14 : size === "sm" ? 20 : size === "md" ? 28 : 36,
            bottom: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
            right: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
          <path d="M9 22v-4h4" />
        </svg>

        {/* Vertically spaced flex layout */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            paddingBottom: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
          }}
        >
          {/* Top spacer instead of label to keep flex layout balanced */}
          <div style={{ height: labelFontSize }} />

          {/* Stenciled/Embossed White Score */}
          <span
            className="font-mono font-black leading-none tabular-nums text-white"
            style={{
              fontSize: valueFontSize,
              textShadow: "1px 1px 1.5px rgba(0,0,0,0.7), -0.5px -0.5px 0px rgba(255,255,255,0.3)",
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom Label (AWARD) */}
          <span
            className="font-bold leading-none tracking-[0.2em] uppercase select-none text-white"
            style={{
              fontFamily: "var(--font-roboto)",
              fontSize: labelFontSize * 0.9,
              textShadow: "1px 1px 1px rgba(0,0,0,0.6)",
            }}
          >
            AWARD
          </span>
        </div>
      </div>
    );
  }

  // --- Cyberpunk Plate (Redesigned as UN/UNTAC Development Program Plate with Neon Accents) ---
  if (style === "cyber") {
    const isMini = size === "xs";
    const neonPink = "#ec4899";
    const neonCyan = "#06b6d4";

    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    const screwSize = size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7;
    const screwY = size === "xs" ? 3.5 : size === "sm" ? 4.5 : size === "md" ? 6.5 : 8;
    const screwX = size === "xs" ? 7 : size === "sm" ? 10 : size === "md" ? 14 : 18;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border" : "border-2"}`}
        style={{
          ...shell,
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #172554 100%)", // UN Blue Metal
          borderColor: "#2563eb",
          borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Glow backdrop grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />

        {/* UN/UNTAC corner brackets */}
        <div className="absolute top-[5px] left-[5px] w-[4px] h-[4px] border-t border-l border-white/40 pointer-events-none" />
        <div className="absolute top-[5px] right-[5px] w-[4px] h-[4px] border-t border-r border-white/40 pointer-events-none" />

        {/* Vertically spaced flex layout to prevent any overlapping */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            paddingBottom: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
          }}
        >
          {/* Top Label (GLOBAL) in Neon Cyan */}
          <span
            className="font-black leading-none text-center select-none"
            style={{
              fontFamily: "var(--font-roboto)",
              fontSize: topFontSize,
              color: "#ffffff",
              textShadow: `0 0 3px ${neonCyan}, 0 0 6px ${neonCyan}`,
            }}
          >
            GLOBAL
          </span>

          {/* Stenciled Neon Pink Value */}
          <span
            className="font-mono font-black leading-none tabular-nums"
            style={{
              fontSize: valueFontSize,
              color: "#ffffff",
              textShadow: `0 0 4px ${neonPink}, 0 0 8px ${neonPink}, -0.5px -0.5px 0px rgba(0,0,0,0.4)`,
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom spacer instead of label to keep flex layout balanced */}
          <div style={{ height: bottomFontSize }} />
        </div>
      </div>
    );
  }

  // --- Vintage Classic Plate (Redesigned as Police Department Plate, White & Red with Yellow Screw Caps) ---
  if (style === "vintage") {
    const isMini = size === "xs";
    const policeRed = "#dc2626"; // Bold police red

    const labelFontSize = size === "xs" ? 5 : size === "sm" ? 6.5 : size === "md" ? 8 : 10;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    const screwSize = size === "xs" ? 3 : size === "sm" ? 4.5 : size === "md" ? 6 : 7;
    const screwY = size === "xs" ? 3.5 : size === "sm" ? 4.5 : size === "md" ? 6.5 : 8;
    const screwX = size === "xs" ? 7 : size === "sm" ? 10 : size === "md" ? 14 : 18;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border" : "border-2"}`}
        style={{
          ...shell,
          background: "linear-gradient(135deg, #fcfcfc 0%, #f4f4f5 50%, #e4e4e7 100%)", // Pressed white metal
          borderColor: "#d4d4d8",
          borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Metal reflections & highlights */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none rounded-[inherit]" />



        {/* Vertically spaced flex layout to prevent any overlapping */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
            paddingBottom: size === "xs" ? 3.5 : size === "sm" ? 5 : size === "md" ? 7 : 9,
          }}
        >
          {/* Top Label (Khmer: សុវត្ថិភាព - Safety) in Red */}
          <span
            className="font-black leading-none text-center select-none"
            style={{
              fontFamily: "var(--font-kh-ui)",
              fontSize: labelFontSize * 1.1,
              color: policeRed,
              textShadow: "0.5px 0.5px 0px rgba(255,255,255,0.8)",
            }}
          >
            សុវត្ថិភាព
          </span>

          {/* Stenciled Red Value */}
          <span
            className="font-mono font-black leading-none tabular-nums"
            style={{
              fontSize: valueFontSize,
              color: policeRed,
              textShadow: "1px 1px 1px rgba(255,255,255,0.8), -0.5px -0.5px 0px rgba(0,0,0,0.15)",
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom Label (SAFETY) in Red */}
          <span
            className="font-bold leading-none tracking-[0.2em] uppercase select-none"
            style={{
              fontFamily: "var(--font-roboto)",
              fontSize: labelFontSize * 0.9,
              color: policeRed,
              textShadow: "0.5px 0.5px 0px rgba(255,255,255,0.8)",
            }}
          >
            SAFETY
          </span>
        </div>
      </div>
    );
  }

  // --- Vintage 1990 Series Cambodian Plate (Redesigned from brand yellow road plate) ---
  const isMini = size === "xs";
  
  // Dynamic province abbreviations
  let khAbbr = "សរ"; // Default to Siem Reap (សរ)
  const provEnLower = en.toLowerCase();

  // Find matching abbreviation
  let matchedAbbr = "";
  for (const [key, value] of Object.entries(PROVINCE_ABBRS)) {
    if (provEnLower.includes(key)) {
      matchedAbbr = value;
      break;
    }
  }

  if (matchedAbbr) {
    khAbbr = matchedAbbr;
  } else {
    // Fallback: take first 2 characters of Khmer province name
    khAbbr = kh.substring(0, 2);
  }

  // Find matching English abbreviation
  let enAbbr = "KH"; // Default to KH
  for (const [key, value] of Object.entries(EN_PROVINCE_ABBRS)) {
    if (provEnLower.includes(key)) {
      enAbbr = value;
      break;
    }
  }

  // Determine active language safely from top-level hook
  const isKh = langCtx?.lang !== "en";

  // Font sizes scaled according to size
  const khAbbrFontSize = size === "xs" ? 9 : size === "sm" ? 12 : size === "md" ? 17 : 21;
  const numberFontSize = size === "xs" ? 12 : size === "sm" ? 16 : size === "md" ? 22 : 28;

  return (
    <div
      className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border" : "border-2"}`}
      style={{
        ...shell,
        background: isSoloDriver
          ? "linear-gradient(135deg, #fffdf0 0%, #fbf5dc 50%, #f3ecc9 100%)"
          : "linear-gradient(135deg, #f5f1e4 0%, #ebe5d3 50%, #dfd8c2 100%)", // Vintage cream metal
        borderColor: isSoloDriver ? "#000000" : "#b5ae95", // Crisp brutalist border for Solo Driver
        boxShadow: shadow ? "4px 4px 0 #000" : (isSoloDriver ? "2px 2px 0 #000" : undefined),
        borderRadius: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
      }}
    >
      {/* Solo Driver Gold Accent Bar */}
      {isSoloDriver && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-yellow-400 z-20 pointer-events-none border-b border-black/30" />
      )}

      {/* Pressed metal plate sheen & shadow vignette */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/15 pointer-events-none rounded-[inherit]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/5 pointer-events-none rounded-[inherit]" />

      {/* Single line horizontal layout of vintage stamped characters */}
      <div 
        className="flex flex-row items-center justify-center z-10"
      >
        {/* Province Abbreviation */}
        <span
          className="font-black text-black select-none"
          style={{
            fontFamily: isKh ? "var(--font-kh-ui)" : "var(--font-roboto)",
            fontSize: khAbbrFontSize,
            textShadow: "1px 1px 1px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.4)",
          }}
        >
          {isKh ? khAbbr : enAbbr}
        </span>

        {/* Hyphen */}
        <span
          className="font-black text-black select-none font-mono"
          style={{
            fontSize: khAbbrFontSize,
            textShadow: "1px 1px 1px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.4)",
            margin: size === "xs" ? "0 1px" : "0 2px",
          }}
        >
          -
        </span>

        {/* Plate Number (Score) */}
        <span
          className="font-mono font-black text-black tabular-nums tracking-normal"
          style={{
            fontSize: numberFontSize,
            textShadow: "1px 1px 1.5px rgba(0,0,0,0.45), -0.75px -0.75px 0px rgba(255,255,255,0.4)",
          }}
        >
          <PlateValue value={value} />
        </span>
      </div>
    </div>
  );
}
