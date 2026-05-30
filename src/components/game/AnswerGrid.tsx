"use client";

import type { AnswerOption } from "@/lib/game-event-bus";

/** Kahoot-style answer shapes */
const ANSWER_STYLES = [
  { bg: "#ef4444", hoverBg: "#dc2626", shape: "▲", label: "A", shadow: "#991b1b" },
  { bg: "#3b82f6", hoverBg: "#2563eb", shape: "◆", label: "B", shadow: "#1d4ed8" },
  { bg: "#22c55e", hoverBg: "#16a34a", shape: "●", label: "C", shadow: "#15803d" },
  { bg: "#f97316", hoverBg: "#ea580c", shape: "■", label: "D", shadow: "#c2410c" },
];

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
      <div className="text-center py-8 text-white/50 font-bold">
        Loading answers...
      </div>
    );
  }

  const isImagePick = gameType === "image_pick";
  const khFont = lang === "kh" ? { fontFamily: "Siemreap, sans-serif" } : {};
  const isTwoCol = answers.length <= 2;

  return (
    <div className={`grid gap-2 sm:gap-3 ${isTwoCol ? "grid-cols-1" : "grid-cols-2"}`}>
      {answers.map((ans, i) => {
        const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
        const isSelected = selectedId === ans.id;
        const isCorrect = correctId !== null && ans.id === correctId;
        const isWrong = correctId !== null && ans.id !== correctId;
        const isMyWrong = isSelected && isWrong;
        const text = lang === "kh" ? (ans.answerKm || ans.answerEn) : ans.answerEn;

        // Derive colors and visibility states
        let bg = style.bg;
        let opacity = 1;
        let scale = "scale(1)";
        let displayStyle: "flex" | "none" = "flex";
        let textWeightClass = "font-bold animate-fade-in";

        if (correctId !== null) {
          if (isCorrect) {
            bg = "#22c55e"; // Correct green
            scale = "scale(1.02)";
            textWeightClass = "font-black";
          } else if (isSelected) {
            bg = "#ef4444"; // Selected wrong red
            scale = "scale(1.02)";
            textWeightClass = "font-black";
          } else {
            // Completely hide irrelevant wrong options to focus on selected/correct ones
            displayStyle = "none";
            opacity = 0;
          }
        } else if (isSelected) {
          scale = "scale(0.97)";
          bg = style.hoverBg;
        }

        if (isImagePick) {
          return (
            <button
              key={ans.id}
              disabled={disabled}
              onClick={() => !disabled && onSelect(ans.id)}
              type="button"
              className="relative overflow-hidden aspect-square border border-black/10 rounded-xl transition-all duration-200 active:scale-95"
              style={{
                display: displayStyle,
                opacity,
                backgroundColor: bg,
                transform: scale,
                boxShadow: "none",
              }}
            >
              {ans.imageUrl ? (
                <img
                  src={ans.imageUrl}
                  alt={text}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-white text-xs sm:text-sm font-bold text-center p-2 leading-tight" style={khFont}>
                  {text}
                </span>
              )}
              {isCorrect && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-white border border-black/10 rounded-full flex items-center justify-center text-green-600 font-black text-sm">✓</span>
              )}
              {isMyWrong && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-white border border-black/10 rounded-full flex items-center justify-center text-red-600 font-black text-sm">✗</span>
              )}
            </button>
          );
        }

        return (
          <button
            key={ans.id}
            disabled={disabled}
            onClick={() => !disabled && onSelect(ans.id)}
            type="button"
            className="relative flex items-center justify-between gap-3 px-4 py-3 border border-black/10 transition-all duration-150 active:scale-95 text-left text-white select-none"
            style={{
              display: displayStyle,
              backgroundColor: bg,
              opacity,
              transform: scale,
              boxShadow: "none",
              borderRadius: "10px",
              minHeight: "52px",
              ...khFont,
            }}
          >
            {/* Answer text - focused and responsive */}
            <span className={`flex-1 text-xs sm:text-sm md:text-base leading-snug text-white ${textWeightClass}`}>
              {text}
            </span>

            {/* Result indicator */}
            {isCorrect && (
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded-full border border-black/10 text-green-600 font-black text-xs">✓</span>
            )}
            {isMyWrong && (
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded-full border border-black/10 text-red-600 font-black text-xs">✗</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
