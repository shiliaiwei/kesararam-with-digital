"use client";

import type { AnswerOption } from "@/lib/game-event-bus";
import { cloudinaryOptimize } from "@/lib/cloudinary";

/**
 * Kahoot-psychology 2D flat answer grid
 * - Zero border-radius (sharp 2D UI)
 * - Distinct color-coded tiles per psychological learning principles
 * - White background for sign images (image_pick) so signs are clear
 */

const ANSWER_CONFIG = [
  { bg: "#e21b3c", label: "A" }, // Red
  { bg: "#1368ce", label: "B" }, // Blue
  { bg: "#d89e00", label: "C" }, // Gold
  { bg: "#26890c", label: "D" }, // Green
];

// Correct/wrong override colors
const CORRECT_BG = "#26890c";
const WRONG_BG = "#e21b3c";

interface AnswerGridProps {
  answers: AnswerOption[];
  selectedId: number | null;
  correctId: number | null;
  disabled: boolean;
  lang: "en" | "kh";
  gameType: "mcq" | "true_false" | "image_pick";
  onSelect: (id: number) => void;
}

export function AnswerGrid({
  answers,
  selectedId,
  correctId,
  disabled,
  lang,
  gameType,
  onSelect,
}: AnswerGridProps) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
        Loading answers...
      </div>
    );
  }

  const isImagePick = gameType === "image_pick";
  const khFont = lang === "kh" ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};
  // Image-pick (priority / right-of-way scenarios) → single full-width column
  // with large images so the intersection diagrams are easy to see.
  // MCQ / true-false keep the compact 1- or 2-column text layout.
  const cols = isImagePick ? 1 : answers.length <= 2 ? 1 : 2;
  const revealed = correctId !== null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "6px",
      }}
    >
      {answers.map((ans, i) => {
        const cfg = ANSWER_CONFIG[i % ANSWER_CONFIG.length];
        const isSelected = selectedId === ans.id;
        const isCorrect = revealed && ans.id === correctId;
        const isMyWrong = revealed && isSelected && !isCorrect;
        const isOtherWrong = revealed && !isCorrect && !isMyWrong;
        const text = lang === "kh" ? (ans.answerKm || ans.answerEn) : ans.answerEn;

        // Active tile color
        const tileBg = isCorrect
          ? CORRECT_BG
          : isMyWrong
            ? WRONG_BG
            : isOtherWrong
              ? "#f4f4f5"
              : cfg.bg;

        const borderColor = isCorrect
          ? CORRECT_BG
          : isMyWrong
            ? WRONG_BG
            : isOtherWrong
              ? "#e4e4e7"
              : isSelected && !revealed
                ? "#ffffff"
                : "#000000";

        const scale = isCorrect ? "scale(1.02)" : isSelected && !revealed ? "scale(0.98)" : "scale(1)";

        // ── IMAGE PICK (sign challenge) ─────────────────────────────────────
        if (isImagePick) {
          const topBandBg = isCorrect ? CORRECT_BG : isMyWrong ? WRONG_BG : isOtherWrong ? "#d4d4d8" : cfg.bg;

          return (
            <button
              key={ans.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(ans.id)}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "flex-start",
                overflow: "hidden",
                border: `3px solid ${borderColor}`,
                borderRadius: 0,
                backgroundColor: "#ffffff",
                cursor: disabled ? "default" : "pointer",
                transform: scale,
                transition: "transform 0.12s ease, border-color 0.15s",
                position: "relative",
                minHeight: "150px",
                padding: 0,
                outline: "none",
                opacity: isOtherWrong ? 0.35 : 1,
                boxShadow: isSelected || isCorrect ? "4px 4px 0 #000" : "none",
              }}
            >
              {/* Colored left band — ABCD identity */}
              <div style={{
                width: "44px",
                backgroundColor: topBandBg,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 955,
                flexShrink: 0,
              }}>
                {cfg.label}
              </div>

              {/* Sign image area — white background, large image */}
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                backgroundColor: "#ffffff",
                padding: "10px 12px",
              }}>
                {ans.imageUrl ? (
                  <img
                    src={cloudinaryOptimize(ans.imageUrl, 800)}
                    alt={text}
                    style={{
                      maxHeight: "150px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      display: "block",
                      opacity: isOtherWrong ? 0.4 : 1,
                    }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a", textAlign: "center", padding: "0 4px", ...khFont }}>
                    {text}
                  </span>
                )}
              </div>

              {/* Bottom-band removed: label moved to left band for a bigger image */}
            </button>
          );
        }

        // ── MCQ / TRUE-FALSE ────────────────────────────────────────────────
        return (
          <button
            key={ans.id}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(ans.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              backgroundColor: tileBg,
              border: `3px solid ${borderColor}`,
              borderRadius: 0,
              cursor: disabled ? "default" : "pointer",
              minHeight: "52px",
              transform: scale,
              transition: "transform 0.12s ease, background-color 0.15s",
              outline: "none",
              userSelect: "none",
              opacity: isOtherWrong ? 0.45 : 1,
              ...khFont,
            }}
          >
            {/* Answer letter label */}
            <span style={{
              fontSize: "15px",
              lineHeight: 1,
              fontWeight: 900,
              color: isOtherWrong ? "rgba(24,24,27,0.7)" : "rgba(255,255,255,0.95)",
              flexShrink: 0,
              width: "20px",
              textAlign: "center",
            }}>
              {cfg.label}
            </span>

            {/* Answer text — smaller, left-aligned, wraps cleanly (no mid-word cut) */}
            <span style={{
              color: isOtherWrong ? "#71717a" : "#ffffff",
              // Correct answer is bold; wrong answers are greyed.
              fontWeight: isCorrect ? 900 : isOtherWrong ? 600 : 800,
              fontSize: "clamp(11px, 3vw, 14px)",
              lineHeight: 1.3,
              flex: 1,
              textAlign: "left",
              whiteSpace: "normal",
              overflowWrap: "break-word",
              wordBreak: "normal",
              hyphens: "auto",
            }}>
              {text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
