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
    <div className={`grid gap-3 ${isTwoCol ? "grid-cols-1" : "grid-cols-2"}`}>
      {answers.map((ans, i) => {
        const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
        const isSelected = selectedId === ans.id;
        const isCorrect = correctId !== null && ans.id === correctId;
        const isWrong = correctId !== null && ans.id !== correctId;
        const isMyWrong = isSelected && isWrong;
        const text = lang === "kh" ? (ans.answerKm || ans.answerEn) : ans.answerEn;

        // Derive colors
        let bg = style.bg;
        let opacity = 1;
        let scale = "scale(1)";
        let boxShadow = `0 6px 0 ${style.shadow}`;

        if (correctId !== null) {
          if (isCorrect) {
            bg = "#22c55e";
            boxShadow = "0 6px 0 #15803d";
            scale = "scale(1.03)";
          } else if (isMyWrong) {
            bg = "#ef4444";
            boxShadow = "0 4px 0 #991b1b";
          } else {
            opacity = 0.35;
            boxShadow = "none";
          }
        } else if (isSelected) {
          scale = "translateY(-3px) scale(1.02)";
          boxShadow = `0 9px 0 ${style.shadow}`;
        }

        if (isImagePick) {
          return (
            <button
              key={ans.id}
              disabled={disabled}
              onClick={() => !disabled && onSelect(ans.id)}
              type="button"
              className="relative overflow-hidden aspect-square border-4 border-black transition-all duration-200 active:scale-95"
              style={{
                opacity,
                backgroundColor: bg,
                transform: scale,
                boxShadow,
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
                <span className="text-white font-black text-sm text-center p-2 leading-tight" style={khFont}>
                  {text}
                </span>
              )}
              {isCorrect && (
                <span className="absolute top-2 right-2 w-8 h-8 bg-white border-2 border-black rounded-none flex items-center justify-center text-green-600 font-black text-lg">✓</span>
              )}
              {isMyWrong && (
                <span className="absolute top-2 right-2 w-8 h-8 bg-white border-2 border-black rounded-none flex items-center justify-center text-red-600 font-black text-lg">✗</span>
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
            className="relative flex items-center gap-3 px-4 py-5 border-2 border-black transition-all duration-150 active:scale-95 text-left font-black text-white select-none"
            style={{
              backgroundColor: bg,
              opacity,
              transform: scale,
              boxShadow,
              borderRadius: "12px",
              minHeight: "72px",
              ...khFont,
            }}
          >
            {/* Shape icon + letter label */}
            <span
              className="flex-shrink-0 w-10 h-10 flex flex-col items-center justify-center bg-black/20 rounded-lg border border-white/30 gap-0.5"
            >
              <span className="text-white/90 text-base leading-none">{style.shape}</span>
              <span className="text-white font-black text-[10px] tracking-wider">{style.label}</span>
            </span>

            {/* Answer text */}
            <span className="flex-1 text-sm sm:text-base leading-tight text-white font-black">
              {text}
            </span>

            {/* Result indicator */}
            {isCorrect && (
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full border-2 border-black text-green-600 font-black text-lg">✓</span>
            )}
            {isMyWrong && (
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full border-2 border-black text-red-600 font-black text-lg">✗</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
