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

const DIMENSIONS: Record<ScorePlateSize, { width: number; height: number; value: number; top: number; bottom: number }> = {
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
  const shell: CSSProperties = {
    width: d.width,
    height: d.height,
    boxShadow: shadow ? "4px 4px 0 #000" : undefined,
  };
  const valueStyle: CSSProperties = { fontSize: d.value };
  const topStyle: CSSProperties = { fontSize: d.top };
  const bottomStyle: CSSProperties = { fontSize: d.bottom };

  if (style === "garden") {
    const clip = "polygon(7% 0,18% 7%,30% 2%,43% 8%,50% 0,57% 8%,70% 2%,82% 7%,93% 0,100% 20%,94% 34%,100% 50%,94% 66%,100% 80%,93% 100%,82% 93%,70% 98%,57% 92%,50% 100%,43% 92%,30% 98%,18% 93%,7% 100%,0 80%,6% 66%,0 50%,6% 34%,0 20%)";
    return (
      <div className={`relative select-none bg-black p-[3px] ${className}`} style={{ ...shell, clipPath: clip }}>
        <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-green-100 px-3 py-1 text-green-950" style={{ clipPath: clip }}>
          <div className="pointer-events-none absolute inset-[4px] border-2 border-green-600" style={{ clipPath: clip }} />
          <Leaf size={Math.max(10, d.top + 3)} className="absolute left-2 top-1 text-green-700" strokeWidth={2.4} />
          <Leaf size={Math.max(10, d.top + 3)} className="absolute bottom-1 right-2 rotate-180 text-green-700" strokeWidth={2.4} />
          <span className="z-10 font-black leading-none" style={topStyle}>{kh}</span>
          <span className="z-10 font-mono font-black leading-none tabular-nums text-green-950" style={valueStyle}><PlateValue value={value} /></span>
          <span className="z-10 font-black leading-none tracking-[0.14em] text-green-800" style={bottomStyle}>{en}</span>
        </div>
      </div>
    );
  }

  if (style === "sky") {
    return (
      <div className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-[3px] border-black bg-blue-50 px-3 py-1 text-blue-950 ${className}`} style={shell}>
        <div className="pointer-events-none absolute inset-[4px] border-2 border-blue-500" />
        <Flower2 size={Math.max(18, d.value - 2)} className="absolute -left-1 -top-1 text-blue-700" strokeWidth={2.2} />
        <Star size={Math.max(9, d.top + 2)} className="absolute right-2 top-1 text-yellow-500" fill="currentColor" strokeWidth={2.2} />
        <Star size={Math.max(8, d.bottom + 2)} className="absolute bottom-1 left-2 text-yellow-500" fill="currentColor" strokeWidth={2.2} />
        <span className="z-10 font-black leading-none text-blue-700" style={topStyle}>{kh}</span>
        <span className="z-10 font-mono font-black leading-none tabular-nums text-blue-950" style={valueStyle}><PlateValue value={value} /></span>
        <span className="z-10 font-black leading-none tracking-[0.14em] text-blue-700" style={bottomStyle}>{en}</span>
      </div>
    );
  }

  if (style === "rose") {
    return (
      <div className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-[3px] border-black bg-rose-100 px-3 py-1 text-rose-950 ${className}`} style={shell}>
        <div className="pointer-events-none absolute inset-[4px] border border-rose-500" />
        <Flower2 size={Math.max(12, d.top + 5)} className="absolute left-2 top-1 text-rose-600" strokeWidth={2} />
        <Flower2 size={Math.max(12, d.top + 5)} className="absolute bottom-1 right-2 rotate-180 text-rose-600" strokeWidth={2} />
        <span className="z-10 font-black leading-none text-rose-700" style={topStyle}>{kh}</span>
        <span className="z-10 font-mono font-black leading-none tabular-nums text-rose-950" style={valueStyle}><PlateValue value={value} /></span>
        <span className="z-10 font-black leading-none tracking-[0.14em] text-rose-700" style={bottomStyle}>{en}</span>
      </div>
    );
  }

  return (
    <div className={`relative flex select-none flex-col items-center justify-between overflow-hidden border-[3px] border-black bg-yellow-400 px-3 py-1 text-black ${className}`} style={shell}>
      <div className="pointer-events-none absolute inset-[5px] border-[3px] border-black" />
      {[["left-2", "top-1.5"], ["right-2", "top-1.5"], ["left-2", "bottom-1.5"], ["right-2", "bottom-1.5"]].map(([x, y]) => (
        <span key={`${x}-${y}`} className={`absolute ${x} ${y} size-1.5 bg-black`} />
      ))}
      <span className="z-10 font-black leading-none" style={topStyle}>{kh}</span>
      <span className="z-10 font-mono font-black leading-none tabular-nums" style={valueStyle}><PlateValue value={value} /></span>
      <span className="z-10 font-black leading-none tracking-[0.14em]" style={bottomStyle}>{en}</span>
    </div>
  );
}
