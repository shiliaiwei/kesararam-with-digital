import type { CSSProperties, ReactNode } from "react";
import { Flower2, Star } from "lucide-react";
import { normalizeScorePlateStyle, type ScorePlateStyle } from "@/lib/score-plates";

type ScorePlateSize = "sm" | "md" | "lg";

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

  // --- Vintage Green Label (ornamental scalloped cartouche) ---
  if (style === "garden") {
    const fill = "#bcd89c";
    const line = "#5f9a3e";
    const ink = "#2f5d1e";
    // Symmetric ornamental cartouche outline (viewBox 200x108).
    const cartouche =
      "M100,18 C108,18 112,12 126,12 C150,12 156,8 168,10 C184,12 190,20 186,34 " +
      "C188,42 176,48 176,54 C176,60 188,66 186,74 C190,88 184,96 168,98 " +
      "C156,100 150,96 126,96 C112,96 108,102 100,102 C92,102 88,96 74,96 " +
      "C50,96 44,100 32,98 C16,96 10,88 14,74 C12,66 24,60 24,54 " +
      "C24,48 12,42 14,34 C10,20 16,12 32,10 C44,8 50,12 74,12 C88,12 92,18 100,18 Z";
    return (
      <div
        className={`relative select-none ${className}`}
        style={{ ...shell, boxShadow: "none" }}
      >
        <svg
          viewBox="0 0 200 108"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path d={cartouche} fill={fill} />
          <path d={cartouche} fill="none" stroke={line} strokeWidth={3} />
          <path
            d={cartouche}
            fill="none"
            stroke={line}
            strokeWidth={2.4}
            transform="translate(100 54) scale(0.85) translate(-100 -54)"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center px-4 text-center"
          style={{ color: ink }}
        >
          <span
            className="z-10 font-black leading-none tabular-nums"
            style={valueStyle}
          >
            <PlateValue value={value} />
          </span>
        </div>
      </div>
    );
  }

  // --- Original Sky Bloom ---
  if (style === "sky") {
    return (
      <div
        className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-[3px] border-black bg-blue-50 px-3 py-1 text-blue-950 ${className}`}
        style={shell}
      >
        <div className="pointer-events-none absolute inset-[4px] border-2 border-blue-500" />
        <Flower2
          size={Math.max(18, d.value - 2)}
          className="absolute -left-1 -top-1 text-blue-700"
          strokeWidth={2.2}
        />
        <Star
          size={Math.max(9, d.top + 2)}
          className="absolute right-2 top-1 text-yellow-500"
          fill="currentColor"
          strokeWidth={2.2}
        />
        <Star
          size={Math.max(8, d.bottom + 2)}
          className="absolute bottom-1 left-2 text-yellow-500"
          fill="currentColor"
          strokeWidth={2.2}
        />
        <span
          className="z-10 font-black leading-none text-blue-700"
          style={topStyle}
        >
          {kh}
        </span>
        <span
          className="z-10 font-mono font-black leading-none tabular-nums text-blue-950"
          style={valueStyle}
        >
          <PlateValue value={value} />
        </span>
        <span
          className="z-10 font-black leading-none tracking-[0.14em] text-blue-700"
          style={bottomStyle}
        >
          {en}
        </span>
      </div>
    );
  }

  // --- Original Rose Frame ---
  if (style === "rose") {
    return (
      <div
        className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-[3px] border-black bg-rose-100 px-3 py-1 text-rose-950 ${className}`}
        style={shell}
      >
        <div className="pointer-events-none absolute inset-[4px] border border-rose-500" />
        <Flower2
          size={Math.max(12, d.top + 5)}
          className="absolute left-2 top-1 text-rose-600"
          strokeWidth={2}
        />
        <Flower2
          size={Math.max(12, d.top + 5)}
          className="absolute bottom-1 right-2 rotate-180 text-rose-600"
          strokeWidth={2}
        />
        <span
          className="z-10 font-black leading-none text-rose-700"
          style={topStyle}
        >
          {kh}
        </span>
        <span
          className="z-10 font-mono font-black leading-none tabular-nums text-rose-950"
          style={valueStyle}
        >
          <PlateValue value={value} />
        </span>
        <span
          className="z-10 font-black leading-none tracking-[0.14em] text-rose-700"
          style={bottomStyle}
        >
          {en}
        </span>
      </div>
    );
  }

  // --- New Premium Car Plate (Unified style with rounded corners & capsule holes) ---
  if (style === "car") {
    const insetPx = size === "sm" ? 3 : size === "md" ? 4 : 5;
    const outerBorderWidth = "border-[3px]";
    const innerBorderWidth = size === "sm" ? "border-2" : "border-[3px]";
    const containerRadius =
      size === "sm" ? "rounded-md" : size === "md" ? "rounded-[10px]" : "rounded-xl";

    const screwW = size === "sm" ? "w-2" : size === "md" ? "w-3" : "w-4";
    const screwH = size === "sm" ? "h-1" : size === "md" ? "h-1.5" : "h-2";

    const holes = {
      sm: [
        { className: "left-[7px] top-[5px]" },
        { className: "right-[7px] top-[5px]" },
        { className: "left-[7px] bottom-[5px]" },
        { className: "right-[7px] bottom-[5px]" },
      ],
      md: [
        { className: "left-[10px] top-[7px]" },
        { className: "right-[10px] top-[7px]" },
        { className: "left-[10px] bottom-[7px]" },
        { className: "right-[10px] bottom-[7px]" },
      ],
      lg: [
        { className: "left-[13px] top-[9px]" },
        { className: "right-[13px] top-[9px]" },
        { className: "left-[13px] bottom-[9px]" },
        { className: "right-[13px] bottom-[9px]" },
      ],
    }[size];

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-black ${outerBorderWidth} ${containerRadius} bg-yellow-400 text-black ${className}`}
        style={shell}
      >
        {/* Inner offset double border */}
        <div
          className={`pointer-events-none absolute rounded-sm border-black ${innerBorderWidth}`}
          style={{
            top: `${insetPx}px`,
            left: `${insetPx}px`,
            right: `${insetPx}px`,
            bottom: `${insetPx}px`,
          }}
        />

        {/* 4 horizontal capsule screw holes */}
        {holes.map((hole, i) => (
          <span
            key={i}
            className={`absolute ${hole.className} ${screwW} ${screwH} rounded-full bg-black`}
          />
        ))}

        <span className="z-10 font-black leading-none mt-1" style={topStyle}>
          {kh}
        </span>
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={valueStyle}
        >
          <PlateValue value={value} />
        </span>
        <span
          className="z-10 font-black leading-none tracking-[0.14em] mb-1"
          style={bottomStyle}
        >
          {en}
        </span>
      </div>
    );
  }

  // --- Official MPWT Plate (Premium Cambodian License Plate look with navy border, gray labels & bold navy number) ---
  if (style === "official") {
    const navy = "#11355c"; // Premium authentic navy blue
    const gray = "#78889b"; // Elegant low-opacity gray-blue for labels

    return (
      <div
        className={`relative flex select-none flex-col items-center justify-between overflow-hidden bg-white text-center ${className}`}
        style={{
          ...shell,
          boxShadow: shadow ? "4px 4px 0 #000" : undefined,
          border: `${size === "sm" ? "2px" : "3px"} solid ${navy}`,
          borderRadius: size === "sm" ? 5 : size === "md" ? 8 : 10,
          paddingTop: size === "sm" ? 3 : size === "md" ? 4 : 5,
        }}
      >
        {/* Top Text (Khmer Province/Country) in Low Opacity Gray */}
        <span
          className="z-10 font-bold leading-none"
          style={{ fontSize: d.top, color: gray }}
        >
          {kh}
        </span>

        {/* Middle Text (Score) in Bold Navy */}
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={{ fontSize: d.value, color: navy }}
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
              paddingTop: size === "sm" ? 2 : size === "md" ? 3 : 4,
              paddingBottom: size === "sm" ? 2 : size === "md" ? 3 : 4,
            }}
          >
            <span
              className="font-bold leading-none tracking-[0.14em]"
              style={{ fontSize: d.bottom, color: gray }}
            >
              {en}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Plain Minimal Plate (Simple white card, thin black border, clean text) ---
  if (style === "plain") {
    return (
      <div
        className={`relative flex select-none flex-col items-center justify-center border-2 border-black bg-white px-2 py-1 text-black ${className}`}
        style={{ ...shell, borderRadius: 2 }}
      >
        <span
          className="z-10 font-mono font-black leading-none tabular-nums"
          style={valueStyle}
        >
          <PlateValue value={value} />
        </span>
      </div>
    );
  }

  // --- Default/Original Road Plate (Yellow background, square holes, flat corners) ---
  return (
    <div
      className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-[3px] border-black bg-yellow-400 px-3 py-1 text-black ${className}`}
      style={shell}
    >
      <div className="pointer-events-none absolute inset-[5px] border-[3px] border-black" />
      {[
        ["left-2", "top-1.5"],
        ["right-2", "top-1.5"],
        ["left-2", "bottom-1.5"],
        ["right-2", "bottom-1.5"],
      ].map(([x, y]) => (
        <span key={`${x}-${y}`} className={`absolute ${x} ${y} size-1.5 bg-black`} />
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
