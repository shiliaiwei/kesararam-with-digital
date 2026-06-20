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

  // --- Official MPWT Plate (Premium Cambodian License Plate look with navy border, gray labels & bold navy number) ---
  if (style === "official") {
    const navy = "#11355c"; // Premium authentic navy blue
    const gray = "#78889b"; // Elegant low-opacity gray-blue for labels

    // Scale font sizes to fit perfectly within the plate dimensions and prevent cut-offs
    const topFontSize = size === "xs" ? 5.5 : size === "sm" ? 7 : size === "md" ? 9 : 11;
    const valueFontSize = size === "xs" ? 13 : size === "sm" ? 17 : size === "md" ? 23 : 30;
    const bottomFontSize = size === "xs" ? 4.5 : size === "sm" ? 6 : size === "md" ? 7.5 : 9;

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-between overflow-hidden bg-white text-center ${className}`}
        style={{
          ...shell,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
          border: `${(size === "sm" || size === "xs") ? "2px" : "3px"} solid ${navy}`,
          borderRadius: size === "xs" ? 4 : size === "sm" ? 5 : size === "md" ? 8 : 10,
          paddingTop: size === "xs" ? 1 : size === "sm" ? 1.5 : size === "md" ? 3 : 4,
        }}
      >
        {/* Top Text (Khmer Province/Country) in Low Opacity Gray */}
        <span
          className="z-10 font-bold leading-none"
          style={{ fontSize: topFontSize, color: gray }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) in Bold Navy */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{ fontSize: valueFontSize, color: navy }}
        >
          <PlateValue value={value} />
        </span>

        {/* Bottom divider & English Province name */}
        <div className="z-10 w-full flex flex-col items-center mt-auto">
          {/* Full-width navy divider */}
          <div className="w-full border-t border-[#11355c] opacity-35" />
          
          {/* Bottom text wrapper */}
          <div
            className="w-full flex items-center justify-center relative"
            style={{
              paddingTop: size === "xs" ? 1 : size === "sm" ? 1.5 : size === "md" ? 2.5 : 3.5,
              paddingBottom: size === "xs" ? 1.5 : size === "sm" ? 2 : size === "md" ? 3 : 4,
            }}
          >
            <span
              className="font-bold leading-none tracking-[0.14em]"
              style={{ fontSize: bottomFontSize, color: gray }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Default/Original Road Plate (Yellow background, square holes, flat corners) ---
  const isMini = size === "xs";
  return (
    <div
      className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-black bg-yellow-400 px-3 py-1 text-black ${className} ${isMini ? "border-2" : "border-[3px]"}`}
      style={shell}
    >
      <div 
        className="pointer-events-none absolute border-black" 
        style={{
          inset: isMini ? "3px" : "5px",
          borderWidth: isMini ? "2px" : "3px",
        }}
      />
      {[
        [isMini ? "left-1" : "left-2", isMini ? "top-1" : "top-1.5"],
        [isMini ? "right-1" : "right-2", isMini ? "top-1" : "top-1.5"],
        [isMini ? "left-1" : "left-2", isMini ? "bottom-1" : "bottom-1.5"],
        [isMini ? "right-1" : "right-2", isMini ? "bottom-1" : "bottom-1.5"],
      ].map(([x, y]) => (
        <span key={`${x}-${y}`} className={`absolute ${x} ${y} bg-black ${isMini ? "size-1" : "size-1.5"}`} />
      ))}
      <span className="z-10 font-black leading-none" style={topStyle}>
        {kh}
      </span>
      <span
        className="z-10 font-mono font-black leading-none tabular-nums"
        style={valueStyle}
      >
        <PlateValue value={value} />
      </span>
      <span
        className="z-10 font-black leading-none tracking-[0.14em]"
        style={bottomStyle}
      >
        {en}
      </span>
    </div>
  );
}
