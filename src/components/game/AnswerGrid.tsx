"use client";

import type { AnswerOption } from "@/lib/game-event-bus";

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
  const khFont = lang === "kh" ? { fontFamily: "Siemreap, sans-serif" } : {};
  const cols = answers.length <= 2 ? 1 : 2;
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
          const bottomBandBg = isCorrect ? CORRECT_BG : isMyWrong ? WRONG_BG : isOtherWrong ? "#d4d4d8" : cfg.bg;

          return (
            <button
              key={ans.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(ans.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                overflow: "hidden",
                border: `3px solid ${borderColor}`,
                borderRadius: 0,
                backgroundColor: "#ffffff",
                cursor: disabled ? "default" : "pointer",
                transform: scale,
                transition: "transform 0.12s ease, border-color 0.15s",
                position: "relative",
                height: "115px",
                padding: 0,
                outline: "none",
                opacity: isOtherWrong ? 0.35 : 1,
              }}
            >
              {/* Colored top band — ABCD identity */}
              <div style={{
                height: "4px",
                width: "100%",
                backgroundColor: topBandBg,
                flexShrink: 0,
              }} />

              {/* Sign image area — white background */}
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                backgroundColor: "#ffffff",
                padding: "4px 6px",
              }}>
                {ans.imageUrl ? (
                  <img
                    src={ans.imageUrl}
                    alt={text}
                    style={{
                      maxHeight: "62px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      display: "block",
                      opacity: isOtherWrong ? 0.4 : 1,
                    }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#1a1a1a", textAlign: "center", padding: "0 4px", ...khFont }}>
                    {text}
                  </span>
                )}
              </div>

              {/* Colored bottom label band */}
              <div style={{
                backgroundColor: bottomBandBg,
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 955,
                padding: "6px 8px",
                width: "100%",
                textAlign: "left",
                flexShrink: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.02em",
                ...khFont,
              }}>
                <span style={{ marginRight: "4px", opacity: 0.95 }}>{cfg.label}</span>
              </div>

              {/* Result badge */}
              {(isCorrect || isMyWrong) && (
                <div style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "18px",
                  height: "18px",
                  backgroundColor: isCorrect ? CORRECT_BG : WRONG_BG,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 900,
                  borderRadius: 0,
                  border: "1.5px solid #fff",
                }}>
                  {isCorrect ? "✓" : "✗"}
                </div>
              )}
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
              gap: "12px",
              padding: "10px 14px",
              backgroundColor: tileBg,
              border: `3px solid ${borderColor}`,
              borderRadius: 0,
              cursor: disabled ? "default" : "pointer",
              minHeight: "52px",
              transform: scale,
              transition: "transform 0.12s ease, background-color 0.15s",
              outline: "none",
              userSelect: "none",
              opacity: isOtherWrong ? 0.35 : 1,
              ...khFont,
            }}
          >
            {/* Answer letter label */}
            <span style={{
              fontSize: "16px",
              lineHeight: 1,
              fontWeight: 900,
              color: isOtherWrong ? "rgba(24,24,27,0.7)" : "rgba(255,255,255,0.95)",
              flexShrink: 0,
              width: "22px",
              textAlign: "center",
            }}>
              {cfg.label}
            </span>

            {/* Answer text */}
            <span style={{
              color: isOtherWrong ? "#18181b" : "#ffffff",
              fontWeight: 900,
              fontSize: "clamp(12px, 3.5vw, 16px)",
              lineHeight: 1.25,
              flex: 1,
              textAlign: "left",
            }}>
              {text}
            </span>

            {/* Result icon */}
            {isCorrect && (
              <span style={{ color: isOtherWrong ? "#18181b" : "#fff", fontSize: "16px", fontWeight: 900, flexShrink: 0 }}>✓</span>
            )}
            {isMyWrong && (
              <span style={{ color: "#fff", fontSize: "16px", fontWeight: 900, flexShrink: 0 }}>✗</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
