"use client";

/**
 * Kesararam With Digital Brand Kit — road-sign shapes + caution-tape patterns.
 *
 * Everything is pure vector SVG → renders crisp at ANY size (4K slides, print,
 * favicons). Flat brutalist look: solid black border, hard offset shadow, NO blur,
 * NO gradient fills, NO neon. Colors stay on the traffic-sign palette.
 *
 * Easy to call:
 *   <CautionTape variant="caution" />          // caution | chevron | checker | dashed | line
 *   <SignShape shape="diamond" body="#eab308"> // diamond | octagon | circle | sign | triangle | banner
 *     <TriangleAlert className="text-black" />
 *   </SignShape>
 *
 * Icons inside shapes must be library icons (Lucide / Material Symbols) — never emoji.
 * See .claude/skills/kwd-brand-design.
 */

import { useId, type ReactNode } from "react";

const Y = "#eab308"; // brand yellow
const K = "#0a0a0a"; // near-black (border / pattern)

/* ─────────────────────────  CAUTION TAPE  ───────────────────────── */

export type TapeVariant = "caution" | "chevron" | "checker" | "dashed" | "line";

export const TAPES: { variant: TapeVariant; en: string; kh: string }[] = [
  { variant: "caution", en: "Caution", kh: "ការប្រុងប្រយ័ត្ន" },
  { variant: "chevron", en: "Chevron", kh: "សញ្ញាព្រួញ" },
  { variant: "checker", en: "Checker", kh: "ក្រឡាចត្រង្គ" },
  { variant: "dashed", en: "Dashed", kh: "បន្ទាត់ដាច់" },
  { variant: "line", en: "Line", kh: "បន្ទាត់" },
];

export function CautionTape({
  variant = "caution",
  height = 28,
  className = "",
}: {
  variant?: TapeVariant;
  height?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const pid = `kwd-tape-${variant}-${uid}`;
  const h = height;

  let pattern: ReactNode;
  switch (variant) {
    case "chevron": {
      const cw = h * 0.75;
      const t = h * 0.3;
      pattern = (
        <pattern id={pid} width={cw} height={h} patternUnits="userSpaceOnUse">
          <rect width={cw} height={h} fill={Y} />
          <path
            d={`M${h * 0.05},${t / 2} L${h * 0.05 + h * 0.42},${h / 2} L${h * 0.05},${h - t / 2}`}
            fill="none"
            stroke={K}
            strokeWidth={t}
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
        </pattern>
      );
      break;
    }
    case "checker": {
      const s = h / 2;
      pattern = (
        <pattern id={pid} width={s * 2} height={s * 2} patternUnits="userSpaceOnUse">
          <rect width={s * 2} height={s * 2} fill={Y} />
          <rect width={s} height={s} fill={K} />
          <rect x={s} y={s} width={s} height={s} fill={K} />
        </pattern>
      );
      break;
    }
    case "dashed": {
      const dash = h * 0.55;
      const gap = h * 0.45;
      pattern = (
        <pattern id={pid} width={dash + gap} height={h} patternUnits="userSpaceOnUse">
          <rect width={dash + gap} height={h} fill={Y} />
          <rect x={0} y={h * 0.42} width={dash} height={h * 0.16} fill={K} />
        </pattern>
      );
      break;
    }
    case "line": {
      pattern = (
        <pattern id={pid} width={h} height={h} patternUnits="userSpaceOnUse">
          <rect width={h} height={h} fill={Y} />
          <rect x={0} y={h * 0.26} width={h} height={h * 0.07} fill={K} />
          <rect x={0} y={h * 0.67} width={h} height={h * 0.07} fill={K} />
        </pattern>
      );
      break;
    }
    case "caution":
    default: {
      pattern = (
        <pattern
          id={pid}
          width={h}
          height={h}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width={h} height={h} fill={Y} />
          <rect width={h / 2} height={h} fill={K} />
        </pattern>
      );
    }
  }

  return (
    <svg
      width="100%"
      height={h}
      role="img"
      aria-hidden
      className={className}
      style={{ display: "block" }}
    >
      <defs>{pattern}</defs>
      <rect width="100%" height={h} fill={`url(#${pid})`} />
    </svg>
  );
}

/* ─────────────────────────  ROAD-SIGN SHAPES  ───────────────────────── */

export type SignShapeName =
  | "diamond"
  | "octagon"
  | "circle"
  | "sign"
  | "triangle"
  | "banner";

export const SHAPES: {
  shape: SignShapeName;
  en: string;
  kh: string;
  meaningEn: string;
  meaningKh: string;
}[] = [
  { shape: "diamond", en: "Diamond", kh: "ពេជ្រ", meaningEn: "Warning", meaningKh: "ព្រមាន" },
  { shape: "octagon", en: "Octagon", kh: "ប៉ែតជ្រុង", meaningEn: "Stop", meaningKh: "ឈប់" },
  { shape: "circle", en: "Circle", kh: "រង្វង់", meaningEn: "Prohibitory", meaningKh: "ហាមឃាត់" },
  { shape: "sign", en: "Sign", kh: "ផ្ទាំង", meaningEn: "Information", meaningKh: "ព័ត៌មាន" },
  { shape: "triangle", en: "Triangle", kh: "ត្រីកោណ", meaningEn: "Caution", meaningKh: "ប្រុងប្រយ័ត្ន" },
  { shape: "banner", en: "Banner", kh: "ផ្លាកធំ", meaningEn: "Guide", meaningKh: "ណែនាំ" },
];

const POLY: Partial<Record<SignShapeName, string>> = {
  diamond: "52,3 101,52 52,101 3,52",
  octagon: "33,3 71,3 101,33 101,71 71,101 33,101 3,71 3,33",
  triangle: "52,5 99,99 5,99",
};

export function SignShape({
  shape = "sign",
  body = Y,
  border = K,
  size = 96,
  shadow = true,
  className = "",
  contentClassName = "",
  children,
}: {
  shape?: SignShapeName;
  body?: string;
  border?: string;
  size?: number;
  shadow?: boolean;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}) {
  const isBanner = shape === "banner";
  const vbW = isBanner ? 208 : 104;
  const vbH = 104;
  const off = 6; // hard offset shadow
  const sw = 3.5; // border width

  const draw = (fill: string, stroke: string) => {
    if (shape === "circle")
      return <circle cx={52} cy={52} r={48} fill={fill} stroke={stroke} strokeWidth={sw} />;
    if (shape === "sign")
      return (
        <rect x={4} y={4} width={96} height={96} rx={12} fill={fill} stroke={stroke} strokeWidth={sw} />
      );
    if (isBanner)
      return (
        <>
          <rect x={46} y={70} width={7} height={32} fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x={155} y={70} width={7} height={32} fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x={4} y={6} width={200} height={66} rx={10} fill={fill} stroke={stroke} strokeWidth={sw} />
        </>
      );
    return (
      <polygon
        points={POLY[shape]}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  };

  return (
    <div
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: isBanner ? size * 2 : size, height: size }}
    >
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" height="100%" role="img" aria-hidden>
        {shadow && <g transform={`translate(${off},${off})`}>{draw(border, "none")}</g>}
        {draw(body, border)}
      </svg>
      {children && (
        <div
          className={`pointer-events-none absolute inset-0 grid place-items-center ${
            isBanner ? "pb-[24%]" : ""
          } ${contentClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
