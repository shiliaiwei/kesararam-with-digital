import type { CSSProperties, ReactNode } from "react";
import { Flower2, Leaf, Star } from "lucide-react";
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
  sm: { width: 100, height: 54, value: 22, top: 8, bottom: 7 },
  md: { width: 136, height: 72, value: 30, top: 9, bottom: 8 },
  lg: { width: 168, height: 88, value: 38, top: 10, bottom: 9 },
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

  // Setup theme-specific styles
  let bgClass = "bg-yellow-400";
  let textClass = "text-black";
  let borderClass = "border-black";
  let innerBorderClass = "border-black";
  let decorLeft: ReactNode = null;
  let decorRight: ReactNode = null;

  if (style === "garden") {
    bgClass = "bg-green-500";
    textClass = "text-black";
    decorLeft = (
      <Leaf
        size={Math.max(8, d.top - 1)}
        className="text-black/80 shrink-0"
        strokeWidth={2.5}
      />
    );
    decorRight = (
      <Leaf
        size={Math.max(8, d.top - 1)}
        className="text-black/80 shrink-0 rotate-180"
        strokeWidth={2.5}
      />
    );
  } else if (style === "sky") {
    bgClass = "bg-blue-400";
    textClass = "text-black";
    decorLeft = (
      <Star
        size={Math.max(8, d.top - 1)}
        className="text-black/80 shrink-0 fill-black/30"
        strokeWidth={2.5}
      />
    );
    decorRight = (
      <Star
        size={Math.max(8, d.top - 1)}
        className="text-black/80 shrink-0 fill-black/30"
        strokeWidth={2.5}
      />
    );
  } else if (style === "rose") {
    bgClass = "bg-pink-400";
    textClass = "text-black";
    decorLeft = (
      <Flower2
        size={Math.max(8, d.top - 1)}
        className="text-black/80 shrink-0"
        strokeWidth={2.5}
      />
    );
    decorRight = (
      <Flower2
        size={Math.max(8, d.top - 1)}
        className="text-black/80 shrink-0"
        strokeWidth={2.5}
      />
    );
  }

  // Dimension-based sizes for inner inset, borders, and screw holes
  const insetPx = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const outerBorderWidth = "border-[3px]";
  const innerBorderWidth = size === "sm" ? "border-2" : "border-[3px]";
  const containerRadius = size === "sm" ? "rounded-md" : size === "md" ? "rounded-[10px]" : "rounded-xl";

  // Screw hole capsule size
  const screwW = size === "sm" ? "w-2" : size === "md" ? "w-3" : "w-4";
  const screwH = size === "sm" ? "h-1" : size === "md" ? "h-1.5" : "h-2";

  // Mathematically calculated absolute positions for screw holes in all sizes
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

  const shell: CSSProperties = {
    width: d.width,
    height: d.height,
    boxShadow: shadow ? "4px 4px 0 #000" : undefined,
  };
  const valueStyle: CSSProperties = { fontSize: d.value };
  const topStyle: CSSProperties = { fontSize: d.top };
  const bottomStyle: CSSProperties = { fontSize: d.bottom };

  return (
    <div
      className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-black ${outerBorderWidth} ${containerRadius} ${bgClass} ${textClass} ${className}`}
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

      {/* Plate Content */}
      <span
        className="z-10 flex items-center justify-center gap-1 font-black leading-none mt-1"
        style={topStyle}
      >
        {decorLeft}
        <span>{kh}</span>
        {decorRight}
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
