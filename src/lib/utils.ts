import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Traffic-light category color map */
export const CATEGORY_COLORS: Record<string, string> = {
  "road-sign": "#eab308", // yellow
  "road-traffic": "#3b82f6", // blue
  priority: "#ef4444", // red
  driving: "#22c55e", // green
  technical: "#f97316", // orange
  "loading-people-goods": "#06b6d4", // cyan
  "general-knowledge": "#a855f7", // purple
  emergency: "#fda4af", // rose
};

export const CATEGORY_SHADOW: Record<string, string> = {
  "road-sign": "4px 4px 0px #ca8a04",
  "road-traffic": "4px 4px 0px #1d4ed8",
  priority: "4px 4px 0px #b91c1c",
  driving: "4px 4px 0px #15803d",
  technical: "4px 4px 0px #c2410c",
  "loading-people-goods": "4px 4px 0px #0e7490",
  "general-knowledge": "4px 4px 0px #7e22ce",
  emergency: "4px 4px 0px #e11d48",
};

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}
