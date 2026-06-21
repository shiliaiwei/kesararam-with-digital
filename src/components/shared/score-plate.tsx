import type { CSSProperties, ReactNode } from "react";
import { normalizeScorePlateStyle, type ScorePlateStyle } from "@/lib/score-plates";

type ScorePlateSize = "xs" | "sm" | "md" | "lg";

interface ScorePlateProps {
  value: number | ReactNode;
  styleId?: ScorePlateStyle | string | null;
  provinceEn?: string | null;
  provinceKh?: string | null;
  size?: ScorePlateSize;
  className?: string;
  shadow?: boolean;
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
  return <>{typeof value === "number" ? value.toLocaleString() : value}</>;
}

export function ScorePlate({
  value,
  styleId,
  provinceEn,
  provinceKh,
  size = "sm",
  className = "",
  shadow = false,
}: ScorePlateProps) {
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
          borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Subtle metal plate sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        <div className="absolute inset-[0.5px] border border-zinc-200/40 pointer-events-none rounded-[inherit]" />

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

  // --- Blue Watercolor Ribbon Plate ---
  if (style === "ribbon") {
    const isMini = size === "xs";
    
    // Scale font sizes to fit perfectly within the plate dimensions and prevent cut-offs
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    // Bow scale calculations
    const bowScale = size === "xs" ? 0.6 : size === "sm" ? 0.8 : size === "md" ? 1.15 : 1.4;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden border-black text-black text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
        style={{
          ...shell,
          backgroundColor: "#fafaf7", // High quality textured watercolor paper color
          borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Soft watercolor paper texture sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/5 via-white/10 to-white/25 pointer-events-none rounded-[inherit]" />

        {/* 1. Watercolor Wavy Border Ribbons (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          width="100%"
          height="100%"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
        >
          {/* Top wavy line */}
          <path d="M 2,3.5 Q 25,6 50,3.5 Q 75,6 98,3.5" fill="none" stroke="rgba(59, 130, 246, 0.28)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 2,3.5 Q 25,6 50,3.5 Q 75,6 98,3.5" fill="none" stroke="rgba(29, 78, 216, 0.7)" strokeWidth="0.85" strokeLinecap="round" />

          {/* Right wavy line */}
          <path d="M 98,3.5 Q 95.5,20 97,30 Q 95.5,45 98,56.5" fill="none" stroke="rgba(59, 130, 246, 0.28)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 98,3.5 Q 95.5,20 97,30 Q 95.5,45 98,56.5" fill="none" stroke="rgba(29, 78, 216, 0.7)" strokeWidth="0.85" strokeLinecap="round" />

          {/* Bottom wavy line */}
          <path d="M 98,56.5 Q 75,54 50,56.5 Q 25,54 2,56.5" fill="none" stroke="rgba(59, 130, 246, 0.28)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 98,56.5 Q 75,54 50,56.5 Q 25,54 2,56.5" fill="none" stroke="rgba(29, 78, 216, 0.7)" strokeWidth="0.85" strokeLinecap="round" />

          {/* Left wavy line */}
          <path d="M 2,56.5 Q 4.5,45 3,30 Q 4.5,20 2,3.5" fill="none" stroke="rgba(59, 130, 246, 0.28)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 2,56.5 Q 4.5,45 3,30 Q 4.5,20 2,3.5" fill="none" stroke="rgba(29, 78, 216, 0.7)" strokeWidth="0.85" strokeLinecap="round" />
        </svg>

        {/* 2. Watercolor Ribbon Bow Centered at Top (SVG) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
          style={{
            top: size === "xs" ? -4 : size === "sm" ? -5 : size === "md" ? -6 : -7,
            width: 120,
            height: 24,
            transform: `scale(${bowScale})`,
            transformOrigin: "top center",
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 120 24">
            {/* Left large loop */}
            <path d="M 60,7 C 42,0 32,6 60,7" fill="rgba(59, 130, 246, 0.2)" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60,7 C 42,0 32,6 60,7" fill="none" stroke="rgba(29, 78, 216, 0.75)" strokeWidth="0.85" strokeLinecap="round" />

            {/* Right large loop */}
            <path d="M 60,7 C 78,0 88,6 60,7" fill="rgba(59, 130, 246, 0.2)" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60,7 C 78,0 88,6 60,7" fill="none" stroke="rgba(29, 78, 216, 0.75)" strokeWidth="0.85" strokeLinecap="round" />

            {/* Left secondary inner loop */}
            <path d="M 60,7 C 50,1.5 40,4.5 60,7" fill="rgba(37, 99, 235, 0.1)" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="2.5" />
            <path d="M 60,7 C 50,1.5 40,4.5 60,7" fill="none" stroke="rgba(29, 78, 216, 0.65)" strokeWidth="0.7" />

            {/* Right secondary inner loop */}
            <path d="M 60,7 C 70,1.5 80,4.5 60,7" fill="rgba(37, 99, 235, 0.1)" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="2.5" />
            <path d="M 60,7 C 70,1.5 80,4.5 60,7" fill="none" stroke="rgba(29, 78, 216, 0.65)" strokeWidth="0.7" />

            {/* Left hanging tail */}
            <path d="M 60,7 Q 48,15 42,20" fill="none" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60,7 Q 48,15 42,20" fill="none" stroke="rgba(29, 78, 216, 0.75)" strokeWidth="0.85" strokeLinecap="round" />

            {/* Right hanging tail */}
            <path d="M 60,7 Q 72,15 78,20" fill="none" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60,7 Q 72,15 78,20" fill="none" stroke="rgba(29, 78, 216, 0.75)" strokeWidth="0.85" strokeLinecap="round" />

            {/* Center knot */}
            <circle cx="60" cy="7" r="2" fill="rgba(29, 78, 216, 0.85)" stroke="rgba(29, 78, 216, 0.95)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* 3. Text Layout (Centered using flexbox to avoid overlapping top bow & bottom edge) */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: size === "xs" ? 7 : size === "sm" ? 9 : size === "md" ? 12 : 15,
            paddingBottom: size === "xs" ? 3 : size === "sm" ? 5 : size === "md" ? 7 : 9,
          }}
        >
          {/* Top Text (Khmer Province/Country) in Indigo-Blue */}
          <span
            className="font-bold leading-none text-center"
            style={{
              fontSize: topFontSize,
              color: "#1d4ed8",
            }}
          >
            {kh}
          </span>

          {/* Middle Text (Score) in Indigo-Blue */}
          <span
            className="font-mono font-black leading-none tabular-nums"
            style={{
              fontSize: valueFontSize,
              color: "#1e3a8a",
              transform: size === "xs" ? "translateY(-0.5px)" : size === "sm" ? "translateY(-1px)" : size === "md" ? "translateY(-1.5px)" : "translateY(-2px)",
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom Text (English Province/Country) in Indigo-Blue */}
          <span
            className="font-bold leading-none tracking-[0.14em]"
            style={{
              fontSize: bottomFontSize,
              color: "#2563eb",
            }}
          >
            {en}
          </span>
        </div>
      </div>
    );
  }

  // --- Cute Kitty Plate (Hello Kitty inspired design with ears, bow, whiskers, and "Hello Friends" badge) ---
  if (style === "kitty") {
    const isMini = size === "xs";
    
    // Scale font sizes to fit perfectly within the plate dimensions and prevent cut-offs
    const topFontSize = size === "xs" ? 5 : size === "sm" ? 6.5 : size === "md" ? 8 : 10;
    const valueFontSize = size === "xs" ? 12 : size === "sm" ? 16 : size === "md" ? 22 : 28;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 5.5 : size === "md" ? 7 : 8.5;

    // Bow size calculations
    const bowSize = size === "xs" ? 0.7 : size === "sm" ? 1 : size === "md" ? 1.4 : 1.7;

    // Mounting slot dimensions
    const pillW = size === "xs" ? 3.5 : size === "sm" ? 5.5 : size === "md" ? 7.5 : 9.5;
    const pillH = size === "xs" ? 1.25 : size === "sm" ? 1.75 : size === "md" ? 2.5 : 3.25;
    const pillY = size === "xs" ? 1.5 : size === "sm" ? 2.5 : size === "md" ? 3.5 : 4.5;
    const pillX = size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10;

    // Inside usable flex height padding
    const padTop = size === "xs" ? 8 : size === "sm" ? 11 : size === "md" ? 14 : 18;
    const padBot = size === "xs" ? 5 : size === "sm" ? 7 : size === "md" ? 10 : 13;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden border-black text-black text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
        style={{
          ...shell,
          backgroundColor: "#ffffff", // Pure white kitty base
          borderRadius: size === "xs" ? 6 : size === "sm" ? 8 : size === "md" ? 10 : 12,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
        }}
      >
        {/* Reflective metal plate sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none rounded-[inherit]" />
        <div className="absolute inset-[0.5px] border border-zinc-200/40 pointer-events-none rounded-[inherit]" />

        {/* Outer pink border frame */}
        <div 
          className="pointer-events-none absolute border-[#ec4899] rounded-[inherit]" 
          style={{
            inset: size === "xs" ? "1.5px" : size === "sm" ? "2.5px" : size === "md" ? "3.5px" : "4.5px",
            borderWidth: size === "xs" ? "1.5px" : size === "sm" ? "2.5px" : "3.5px",
            opacity: 0.9,
          }}
        />

        {/* Left Kitty Ear (fully inside, rotated) */}
        <div
          className="absolute bg-white border-black pointer-events-none flex items-center justify-center z-10"
          style={{
            width: size === "xs" ? 8 : size === "sm" ? 11 : size === "md" ? 15 : 19,
            height: size === "xs" ? 8 : size === "sm" ? 11 : size === "md" ? 15 : 19,
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            left: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            borderWidth: isMini ? "1.5px" : "2px",
            borderRadius: "4px 0 0 0",
            transform: "rotate(-12deg)",
          }}
        >
          {/* Cute pink inner ear patch */}
          <div 
            className="bg-pink-100 border-[0.5px] border-pink-300"
            style={{
              width: "50%",
              height: "50%",
              borderRadius: "2px 0 0 0",
            }}
          />
        </div>

        {/* Right Kitty Ear (fully inside, rotated) */}
        <div
          className="absolute bg-white border-black pointer-events-none flex items-center justify-center z-10"
          style={{
            width: size === "xs" ? 8 : size === "sm" ? 11 : size === "md" ? 15 : 19,
            height: size === "xs" ? 8 : size === "sm" ? 11 : size === "md" ? 15 : 19,
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            right: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            borderWidth: isMini ? "1.5px" : "2px",
            borderRadius: "0 4px 0 0",
            transform: "rotate(12deg)",
          }}
        >
          {/* Cute pink inner ear patch */}
          <div 
            className="bg-pink-100 border-[0.5px] border-pink-300"
            style={{
              width: "50%",
              height: "50%",
              borderRadius: "0 2px 0 0",
            }}
          />
        </div>

        {/* Red Bow on Top-Right Ear (fully inside) */}
        <div
          className="absolute pointer-events-none z-20"
          style={{
            top: size === "xs" ? 1.5 : size === "sm" ? 2 : size === "md" ? 3 : 4,
            right: size === "xs" ? 1.5 : size === "sm" ? 2 : size === "md" ? 3 : 4,
            transform: `scale(${bowSize * 0.75}) rotate(15deg)`,
          }}
        >
          <div className="relative w-6 h-5 flex items-center justify-center">
            {/* Left loop */}
            <div className="absolute left-[1px] w-3 h-3.5 bg-red-500 border border-black rounded-full rotate-[-15deg] shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.4)]" />
            {/* Right loop */}
            <div className="absolute right-[1px] w-3 h-3.5 bg-red-500 border border-black rounded-full rotate-[15deg] shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.4)]" />
            {/* Center knot */}
            <div className="absolute w-2.5 h-2.5 bg-red-600 border border-black rounded-full z-10 shadow-[0.5px_0.5px_0_rgba(0,0,0,0.2)]" />
          </div>
        </div>

        {/* Left Whiskers (fully inside, diagonal layout) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none z-20"
          style={{ 
            left: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
            gap: size === "xs" ? "1.5px" : size === "sm" ? "2px" : "3px" 
          }}
        >
          <div className="bg-black opacity-80" style={{ width: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 9 : 12, height: size === "xs" ? 1 : 1.5, transform: "rotate(10deg)" }} />
          <div className="bg-black opacity-80" style={{ width: size === "xs" ? 5 : size === "sm" ? 7 : size === "md" ? 11 : 14, height: size === "xs" ? 1 : 1.5 }} />
          <div className="bg-black opacity-80" style={{ width: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 9 : 12, height: size === "xs" ? 1 : 1.5, transform: "rotate(-10deg)" }} />
        </div>

        {/* Right Whiskers (fully inside, diagonal layout) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none z-20"
          style={{ 
            right: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
            gap: size === "xs" ? "1.5px" : size === "sm" ? "2px" : "3px" 
          }}
        >
          <div className="bg-black opacity-80" style={{ width: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 9 : 12, height: size === "xs" ? 1 : 1.5, transform: "rotate(-10deg)" }} />
          <div className="bg-black opacity-80" style={{ width: size === "xs" ? 5 : size === "sm" ? 7 : size === "md" ? 11 : 14, height: size === "xs" ? 1 : 1.5 }} />
          <div className="bg-black opacity-80" style={{ width: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 9 : 12, height: size === "xs" ? 1 : 1.5, transform: "rotate(10deg)" }} />
        </div>

        {/* Horizontal divider line like a real plate */}
        <div
          className="absolute left-0 right-0 border-t border-[#ec4899] opacity-25 pointer-events-none"
          style={{ bottom: padBot + (size === "xs" ? 1 : 2) }}
        />

        {/* Hello Friends script label at the top center (fully inside) */}
        <div
          className="absolute bg-zinc-950 border border-black text-[#f472b6] font-black tracking-wide uppercase px-1 py-0.5 z-20 flex items-center justify-center"
          style={{
            fontSize: size === "xs" ? 4.5 : size === "sm" ? 5.5 : size === "md" ? 7 : 8.5,
            top: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
            transform: "scale(0.9)",
            boxShadow: "1px 1px 0 #000",
            borderRadius: 2,
          }}
        >
          Hello Friends
        </div>

        {/* Yellow/Green button at the bottom center (fully inside) */}
        <div
          className="absolute border border-black rounded-full pointer-events-none z-20"
          style={{
            width: size === "xs" ? 5 : size === "sm" ? 7 : size === "md" ? 10 : 12,
            height: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            bottom: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : 5,
            backgroundColor: "#a3e635", // Bright lime green/yellow button
          }}
        />

        {/* Horizontal pill-shaped mounting slots with metal screws inside (fully inside) */}
        {[
          { top: pillY, left: pillX },
          { top: pillY, right: pillX },
          { bottom: pillY, left: pillX },
          { bottom: pillY, right: pillX },
        ].map((pos, idx) => (
          <span
            key={idx}
            className="absolute bg-black rounded-full pointer-events-none flex items-center justify-center z-20"
            style={{
              width: pillW,
              height: pillH,
              ...pos,
            }}
          >
            {/* Shiny metal screw core inside the mounting slot */}
            <span
              className="bg-zinc-400 rounded-full border-[0.5px] border-zinc-600 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.8)]"
              style={{
                width: "55%",
                height: "55%",
              }}
            />
          </span>
        ))}

        {/* Vertically centered flexbox for text elements, keeping them perfectly clear of the top banner & bottom button */}
        <div
          className="absolute inset-0 flex flex-col justify-between items-center z-10 pointer-events-none"
          style={{
            paddingTop: padTop,
            paddingBottom: padBot,
          }}
        >
          {/* Top Text (Province name in pink) */}
          <span
            className="font-black leading-none text-center"
            style={{
              fontSize: topFontSize,
              color: "#ec4899", // Cute pink text
            }}
          >
            {kh}
          </span>

          {/* Middle Text (Score) */}
          <span
            className="font-mono font-black leading-none tabular-nums"
            style={{
              fontSize: valueFontSize,
              color: "#000000",
            }}
          >
            <PlateValue value={value} />
          </span>

          {/* Bottom Text (English Province in pink) */}
          <span
            className="font-black leading-none tracking-[0.14em]"
            style={{
              fontSize: bottomFontSize,
              color: "#db2777", // Darker cute pink text
            }}
          >
            {en}
          </span>
        </div>
      </div>
    );
  }

  // --- Angkor Heritage Plate (Premium brushed gold plate with Angkor Wat silhouette, bronze borders & screws) ---
  if (style === "heritage") {
    const isMini = size === "xs";
    const bronze = "#42310c"; // Deep bronze color
    
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    const pillW = size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6;
    const pillH = size === "xs" ? 0.75 : size === "sm" ? 1.25 : size === "md" ? 1.75 : 2.25;
    const pillY = size === "xs" ? 1.5 : size === "sm" ? 2.5 : size === "md" ? 3.5 : 4.5;
    const pillX = size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
        style={{
          ...shell,
          background: "linear-gradient(135deg, #e8c86b 0%, #f7df94 50%, #c49928 100%)", // brushed gold
          borderColor: bronze,
          color: bronze,
          borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
        }}
      >
        {/* Metal reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none rounded-[inherit]" />
        <div className="absolute inset-[0.5px] border border-white/30 pointer-events-none rounded-[inherit]" />

        {/* Embossed inner border line */}
        <div 
          className="pointer-events-none absolute rounded-[inherit]" 
          style={{
            inset: size === "xs" ? "1.5px" : size === "sm" ? "2.5px" : size === "md" ? "3.5px" : "4.5px",
            border: `${size === "xs" ? "1px" : "2px"} solid ${bronze}`,
            opacity: 0.85,
            boxShadow: "inset 1px 1px 0px rgba(255,255,255,0.4)"
          }}
        />

        {/* Angkor Wat Silhouette Watermark (SVG) */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.14]"
          style={{
            width: size === "xs" ? 28 : size === "sm" ? 38 : size === "md" ? 52 : 68,
            height: size === "xs" ? 14 : size === "sm" ? 19 : size === "md" ? 26 : 34,
            transform: "translate(-50%, -60%)",
          }}
          viewBox="0 0 100 50"
          fill={bronze}
        >
          {/* Detailed Angkor Wat silhouette */}
          <path d="M 50 10 L 52 14 L 54 14 L 54 22 L 46 22 L 46 14 L 48 14 Z M 40 18 L 42 22 L 44 22 L 44 32 L 36 32 L 36 22 L 38 22 Z M 60 18 L 62 22 L 64 22 L 64 32 L 56 32 L 56 22 L 58 22 Z M 30 25 L 32 28 L 34 28 L 34 40 L 26 40 L 26 28 L 28 28 Z M 70 25 L 72 28 L 74 28 L 74 40 L 66 40 L 66 28 L 68 28 Z M 20 40 L 80 40 L 80 44 L 20 44 Z" />
        </svg>

        {/* Gold/Bronze mounting slots and screws */}
        {[
          { top: pillY, left: pillX },
          { top: pillY, right: pillX },
          { bottom: pillY, left: pillX },
          { bottom: pillY, right: pillX },
        ].map((pos, idx) => (
          <span
            key={idx}
            className="absolute rounded-full pointer-events-none flex items-center justify-center"
            style={{
              width: pillW,
              height: pillH,
              backgroundColor: bronze,
              ...pos,
            }}
          >
            {/* Shiny gold/brass screw core */}
            <span
              className="bg-yellow-100 rounded-full border-[0.5px] border-amber-600 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.8)]"
              style={{
                width: "55%",
                height: "55%",
              }}
            />
          </span>
        ))}

        {/* Top Text (Khmer Province/Country) with stamped look */}
        <span
          className="absolute font-black leading-none text-center"
          style={{
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            fontSize: topFontSize,
            color: bronze,
            textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.45)",
          }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) with stamped look */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{
            fontSize: valueFontSize,
            color: bronze,
            transform: size === "xs" ? "translateY(-1.5px)" : size === "sm" ? "translateY(-2px)" : size === "md" ? "translateY(-2.5px)" : "translateY(-3.5px)",
            textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.45)",
          }}
        >
          <PlateValue value={value} />
        </span>

        {/* Bottom divider & English Province name */}
        <div className="absolute left-0 right-0 flex flex-col items-center bottom-0">
          <div className="w-full border-t opacity-25" style={{ borderColor: bronze }} />
          <div
            className="w-full flex items-center justify-center relative"
            style={{
              paddingTop: size === "xs" ? 1 : size === "sm" ? 2 : size === "md" ? 3 : 4,
              paddingBottom: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4.5 : 6,
            }}
          >
            <span
              className="font-black leading-none tracking-[0.14em]"
              style={{
                fontSize: bottomFontSize,
                color: bronze,
                textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.45)",
              }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Eco-Green Plate (Emerald green base with white double-border, leaf motifs and steel screws) ---
  if (style === "eco") {
    const isMini = size === "xs";
    const darkGreen = "#064e3b";
    const forestGreen = "#047857";
    
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    const pillW = size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6;
    const pillH = size === "xs" ? 0.75 : size === "sm" ? 1.25 : size === "md" ? 1.75 : 2.25;
    const pillY = size === "xs" ? 1.5 : size === "sm" ? 2.5 : size === "md" ? 3.5 : 4.5;
    const pillX = size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
        style={{
          ...shell,
          backgroundColor: forestGreen,
          borderColor: darkGreen,
          color: "#ffffff",
          borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
        }}
      >
        {/* Metal reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none rounded-[inherit]" />
        <div className="absolute inset-[0.5px] border border-white/20 pointer-events-none rounded-[inherit]" />

        {/* Embossed white inner border line */}
        <div 
          className="pointer-events-none absolute rounded-[inherit]" 
          style={{
            inset: size === "xs" ? "1.5px" : size === "sm" ? "2.5px" : size === "md" ? "3.5px" : "4.5px",
            border: `${size === "xs" ? "1px" : "2px"} solid #ffffff`,
            opacity: 0.9,
            boxShadow: `inset 1px 1px 0px ${darkGreen}`
          }}
        />

        {/* Cute Leaf watermarks in corner (SVG) */}
        <svg
          className="absolute opacity-25 pointer-events-none"
          style={{
            width: size === "xs" ? 8 : size === "sm" ? 12 : size === "md" ? 16 : 20,
            height: size === "xs" ? 8 : size === "sm" ? 12 : size === "md" ? 16 : 20,
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

        {/* Steel mounting slots and screws */}
        {[
          { top: pillY, left: pillX },
          { top: pillY, right: pillX },
          { bottom: pillY, left: pillX },
          { bottom: pillY, right: pillX },
        ].map((pos, idx) => (
          <span
            key={idx}
            className="absolute rounded-full pointer-events-none flex items-center justify-center"
            style={{
              width: pillW,
              height: pillH,
              backgroundColor: darkGreen,
              ...pos,
            }}
          >
            {/* Shiny zinc/steel screw core */}
            <span
              className="bg-zinc-300 rounded-full border-[0.5px] border-zinc-600 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.8)]"
              style={{
                width: "55%",
                height: "55%",
              }}
            />
          </span>
        ))}

        {/* Top Text (Khmer Province/Country) */}
        <span
          className="absolute font-black leading-none text-center"
          style={{
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            fontSize: topFontSize,
            color: "#ffffff",
            textShadow: `0.5px 0.5px 0px ${darkGreen}`,
          }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{
            fontSize: valueFontSize,
            color: "#ffffff",
            transform: size === "xs" ? "translateY(-1.5px)" : size === "sm" ? "translateY(-2px)" : size === "md" ? "translateY(-2.5px)" : "translateY(-3.5px)",
            textShadow: `1px 1px 0px ${darkGreen}`,
          }}
        >
          <PlateValue value={value} />
        </span>

        {/* Bottom divider & English Province name */}
        <div className="absolute left-0 right-0 flex flex-col items-center bottom-0">
          <div className="w-full border-t opacity-30 border-[#ffffff]" />
          <div
            className="w-full flex items-center justify-center relative"
            style={{
              paddingTop: size === "xs" ? 1 : size === "sm" ? 2 : size === "md" ? 3 : 4,
              paddingBottom: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4.5 : 6,
            }}
          >
            <span
              className="font-black leading-none tracking-[0.14em]"
              style={{
                fontSize: bottomFontSize,
                color: "#ffffff",
                textShadow: `0.5px 0.5px 0px ${darkGreen}`,
              }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Cyberpunk Plate (Dark matte charcoal base, neon pink and cyan double borders and screws) ---
  if (style === "cyber") {
    const isMini = size === "xs";
    const neonPink = "#ec4899";
    const neonCyan = "#06b6d4";
    
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    const pillW = size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6;
    const pillH = size === "xs" ? 0.75 : size === "sm" ? 1.25 : size === "md" ? 1.75 : 2.25;
    const pillY = size === "xs" ? 1.5 : size === "sm" ? 2.5 : size === "md" ? 3.5 : 4.5;
    const pillX = size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
        style={{
          ...shell,
          backgroundColor: "#111827", // Matte black
          borderColor: "#374151",
          color: neonCyan,
          borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
        }}
      >
        {/* Glow backdrop grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

        {/* Double Neon Border (Pink outer, Cyan inner) */}
        <div 
          className="pointer-events-none absolute rounded-[inherit]" 
          style={{
            inset: size === "xs" ? "1px" : "2px",
            border: `1.5px solid ${neonPink}`,
            opacity: 0.8,
            boxShadow: `0 0 4px ${neonPink}`,
          }}
        />
        <div 
          className="pointer-events-none absolute rounded-[inherit]" 
          style={{
            inset: size === "xs" ? "2.5px" : "4.5px",
            border: `1px solid ${neonCyan}`,
            opacity: 0.85,
            boxShadow: `0 0 3px ${neonCyan}`,
          }}
        />

        {/* Glowing corner brackets (SVGs or absolute shapes) */}
        <div className="absolute top-[6px] left-[6px] w-[5px] h-[5px] border-t border-l border-white opacity-40 pointer-events-none" />
        <div className="absolute top-[6px] right-[6px] w-[5px] h-[5px] border-t border-r border-white opacity-40 pointer-events-none" />

        {/* Glowing neon screws */}
        {[
          { top: pillY, left: pillX },
          { top: pillY, right: pillX },
          { bottom: pillY, left: pillX },
          { bottom: pillY, right: pillX },
        ].map((pos, idx) => (
          <span
            key={idx}
            className="absolute rounded-full pointer-events-none flex items-center justify-center"
            style={{
              width: pillW,
              height: pillH,
              backgroundColor: neonPink,
              boxShadow: `0 0 3px ${neonPink}`,
              ...pos,
            }}
          >
            {/* Glowing cyan core */}
            <span
              className="bg-cyan-300 rounded-full"
              style={{
                width: "55%",
                height: "55%",
                boxShadow: `0 0 2px ${neonCyan}`,
              }}
            />
          </span>
        ))}

        {/* Top Text (Khmer Province/Country) */}
        <span
          className="absolute font-black leading-none text-center"
          style={{
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            fontSize: topFontSize,
            color: neonCyan,
            textShadow: `0 0 3px ${neonCyan}`,
          }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{
            fontSize: valueFontSize,
            color: neonPink,
            transform: size === "xs" ? "translateY(-1.5px)" : size === "sm" ? "translateY(-2px)" : size === "md" ? "translateY(-2.5px)" : "translateY(-3.5px)",
            textShadow: `0 0 4px ${neonPink}`,
          }}
        >
          <PlateValue value={value} />
        </span>

        {/* Bottom divider & English Province name */}
        <div className="absolute left-0 right-0 flex flex-col items-center bottom-0">
          <div className="w-full border-t opacity-40 border-cyan-800" />
          <div
            className="w-full flex items-center justify-center relative"
            style={{
              paddingTop: size === "xs" ? 1 : size === "sm" ? 2 : size === "md" ? 3 : 4,
              paddingBottom: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4.5 : 6,
            }}
          >
            <span
              className="font-black leading-none tracking-[0.14em]"
              style={{
                fontSize: bottomFontSize,
                color: neonCyan,
                textShadow: `0 0 3px ${neonCyan}`,
              }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Vintage Classic Plate (Retro matte black plate with cream pressed lettering, borders and aged screws) ---
  if (style === "vintage") {
    const isMini = size === "xs";
    const cream = "#fef3c7"; // Warm vintage cream/yellow-100
    const borderZinc = "#27272a";
    
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    const pillW = size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6;
    const pillH = size === "xs" ? 0.75 : size === "sm" ? 1.25 : size === "md" ? 1.75 : 2.25;
    const pillY = size === "xs" ? 1.5 : size === "sm" ? 2.5 : size === "md" ? 3.5 : 4.5;
    const pillX = size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center overflow-hidden text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
        style={{
          ...shell,
          backgroundColor: "#18181b", // Distressed black
          borderColor: borderZinc,
          color: cream,
          borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
        }}
      >
        {/* Subtle vintage texture card grain */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-white/5 to-white/10 pointer-events-none rounded-[inherit]" />
        <div className="absolute inset-[0.5px] border border-white/5 pointer-events-none rounded-[inherit]" />

        {/* Vintage cream border line with letterpress effect */}
        <div 
          className="pointer-events-none absolute rounded-[inherit]" 
          style={{
            inset: size === "xs" ? "1.5px" : size === "sm" ? "2.5px" : size === "md" ? "3.5px" : "4.5px",
            border: `${size === "xs" ? "1px" : "2.5px"} solid ${cream}`,
            opacity: 0.8,
            boxShadow: "inset 0.5px 0.5px 1px rgba(0,0,0,0.8)"
          }}
        />

        {/* Aged bronze/iron mounting slots and screws */}
        {[
          { top: pillY, left: pillX },
          { top: pillY, right: pillX },
          { bottom: pillY, left: pillX },
          { bottom: pillY, right: pillX },
        ].map((pos, idx) => (
          <span
            key={idx}
            className="absolute rounded-full pointer-events-none flex items-center justify-center"
            style={{
              width: pillW,
              height: pillH,
              backgroundColor: "#27272a",
              ...pos,
            }}
          >
            {/* Distressed bronze screw core */}
            <span
              className="bg-[#d97706]/40 rounded-full border-[0.5px] border-zinc-900 shadow-[inset_0.5px_0.5px_0.5px_rgba(255,255,255,0.1)]"
              style={{
                width: "55%",
                height: "55%",
              }}
            />
          </span>
        ))}

        {/* Top Text (Khmer Province/Country) with stamped look */}
        <span
          className="absolute font-bold leading-none text-center"
          style={{
            top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
            fontSize: topFontSize,
            color: cream,
            textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
          }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) with stamped look */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{
            fontSize: valueFontSize,
            color: cream,
            transform: size === "xs" ? "translateY(-1.5px)" : size === "sm" ? "translateY(-2px)" : size === "md" ? "translateY(-2.5px)" : "translateY(-3.5px)",
            textShadow: "1.5px 1.5px 0px rgba(0,0,0,0.9)",
          }}
        >
          <PlateValue value={value} />
        </span>

        {/* Bottom divider & English Province name */}
        <div className="absolute left-0 right-0 flex flex-col items-center bottom-0">
          <div className="w-full border-t opacity-15 border-white" />
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
                color: cream,
                textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
              }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- New Yellow/Gold Road Plate (Rounded corners, inner border line, horizontal pill mounting slots) ---
  const isMini = size === "xs";
  
  // Scale font sizes to fit perfectly within the plate dimensions and prevent cut-offs
  const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
  const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
  const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

  // Mounting slot dimensions
  const pillW = size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6;
  const pillH = size === "xs" ? 0.75 : size === "sm" ? 1.25 : size === "md" ? 1.75 : 2.25;
  const pillY = size === "xs" ? 1.5 : size === "sm" ? 2.5 : size === "md" ? 3.5 : 4.5;
  const pillX = size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10;

  return (
    <div
      className={`relative flex select-none flex-col items-center justify-center overflow-hidden border-black text-black text-center ${className} ${isMini ? "border-2" : "border-[3px]"}`}
      style={{
        ...shell,
        backgroundColor: "#eab308", // Brand Yellow
        borderRadius: size === "xs" ? 4 : size === "sm" ? 6 : size === "md" ? 8 : 10,
      }}
    >
      {/* Subtle metal plate sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none rounded-[inherit]" />
      <div className="absolute inset-[0.5px] border border-white/25 pointer-events-none rounded-[inherit]" />

      {/* Inner black border line matching rounded corners with embossed look */}
      <div 
        className="pointer-events-none absolute border-black rounded-[inherit] shadow-[inset_1px_1px_0_rgba(255,255,255,0.4)]" 
        style={{
          inset: size === "xs" ? "1.5px" : size === "sm" ? "2.5px" : size === "md" ? "3.5px" : "4.5px",
          borderWidth: size === "xs" ? "1px" : "2px",
          opacity: 0.85,
        }}
      />

      {/* Horizontal pill-shaped mounting slots with chrome screws */}
      {[
        { top: pillY, left: pillX },
        { top: pillY, right: pillX },
        { bottom: pillY, left: pillX },
        { bottom: pillY, right: pillX },
      ].map((pos, idx) => (
        <span
          key={idx}
          className="absolute bg-black rounded-full pointer-events-none flex items-center justify-center"
          style={{
            width: pillW,
            height: pillH,
            ...pos,
          }}
        >
          {/* Shiny metal screw core inside the mounting slot */}
          <span
            className="bg-zinc-400 rounded-full border-[0.5px] border-zinc-600 shadow-[inset_0.5px_0.5px_0_rgba(255,255,255,0.8)]"
            style={{
              width: "55%",
              height: "55%",
            }}
          />
        </span>
      ))}

      {/* Top Text (Khmer Province/Country) with stamped 3D look */}
      <span
        className="absolute font-black leading-none text-center text-black"
        style={{
          top: size === "xs" ? 2.5 : size === "sm" ? 3.5 : size === "md" ? 5 : 6,
          fontSize: topFontSize,
          textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.45)",
        }}
      >
        {kh}
      </span>

      {/* Middle Text (Score) with stamped 3D look */}
      <span
        className="z-10 font-mono font-black leading-none tabular-nums text-black"
        style={{
          fontSize: valueFontSize,
          transform: size === "xs" ? "translateY(-1.5px)" : size === "sm" ? "translateY(-2px)" : size === "md" ? "translateY(-2.5px)" : "translateY(-3.5px)",
          textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.45)",
        }}
      >
        <PlateValue value={value} />
      </span>

      {/* Bottom divider & English Province name with stamped 3D look */}
      <div className="absolute left-0 right-0 flex flex-col items-center bottom-0">
        <div className="w-full border-t border-black opacity-20" />
        <div
          className="w-full flex items-center justify-center relative"
          style={{
            paddingTop: size === "xs" ? 1 : size === "sm" ? 2 : size === "md" ? 3 : 4,
            paddingBottom: size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4.5 : 6,
          }}
        >
          <span
            className="font-black leading-none tracking-[0.14em] text-black"
            style={{
              fontSize: bottomFontSize,
              textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.45)",
            }}
          >
            {en}
          </span>
        </div>
      </div>
    </div>
  );
}
