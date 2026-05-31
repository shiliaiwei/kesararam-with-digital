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
              className="relative overflow-hidden border-2 transition-all duration-200 active:scale-95 flex flex-col items-center justify-center"
              style={{
                display: displayStyle,
                opacity,
                backgroundColor: "#ffffff",
                transform: scale,
                borderColor: isCorrect ? "#22c55e" : isMyWrong ? "#ef4444" : isSelected ? style.bg : "rgba(0,0,0,0.15)",
                boxShadow: isCorrect
                  ? "0 0 0 2px #22c55e"
                  : isMyWrong
                  ? "0 0 0 2px #ef4444"
                  : isSelected
                  ? `0 0 0 2px ${style.bg}`
                  : "none",
                borderRadius: "10px",
                height: "108px",
              }}
            >
              {/* Colored label strip at top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[8px]" style={{ backgroundColor: style.bg }} />

              {ans.imageUrl ? (
                <img
                  src={ans.imageUrl}
                  alt={text}
                  className="object-contain select-none pointer-events-none"
                  style={{ height: "72px", width: "auto", maxWidth: "100%", padding: "4px 8px" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-zinc-800 text-xs sm:text-sm font-bold text-center px-2 leading-tight" style={khFont}>
                  {text}
                </span>
              )}

              {/* Label badge */}
              <div className="absolute bottom-1 left-1 px-1.5 py-0 text-white font-black text-[9px] rounded" style={{ backgroundColor: style.bg, lineHeight: "1.4" }}>
                {style.label}
              </div>

              {isCorrect && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-green-500 border border-white rounded-full flex items-center justify-center text-white font-black text-xs shadow">✓</span>
              )}
              {isMyWrong && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 border border-white rounded-full flex items-center justify-center text-white font-black text-xs shadow">✗</span>
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
