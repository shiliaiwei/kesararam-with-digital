"use client";

import { Triangle, Circle, Square, Diamond } from "lucide-react";
import type { AnswerOption } from "@/lib/game-event-bus";

const ANSWER_STYLES = [
  { bg: "#ef4444", icon: Triangle, label: "A" },
  { bg: "#3b82f6", icon: Circle, label: "B" },
  { bg: "#22c55e", icon: Square, label: "C" },
  { bg: "#f97316", icon: Diamond, label: "D" },
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
  const isTrueFalse = gameType === "true_false";
  const isImagePick = gameType === "image_pick";

  const gridClass = isTrueFalse
    ? "grid grid-cols-2 gap-4"
    : isImagePick
      ? "grid grid-cols-2 gap-4"
      : "grid grid-cols-2 gap-4";

  // Safety check - ensure answers is an array
  if (!Array.isArray(answers) || answers.length === 0) {
    return (
      <div className="text-center py-8 text-white">
        <p>Loading answers...</p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {answers.map((ans, i) => {
        const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
        const Icon = style.icon;
        const isSelected = selectedId === ans.id;
        const isCorrect = correctId === ans.id;
        const isWrong = isSelected && correctId !== null && !isCorrect;

        let borderColor = "#000";
        let bgColor = style.bg;
        let opacity = 1;

        if (correctId !== null) {
          if (isCorrect) {
            bgColor = "#22c55e";
            borderColor = "#000";
          } else if (isWrong) {
            bgColor = "#ef4444";
          } else {
            opacity = 0.4;
          }
        } else if (isSelected) {
          borderColor = "#fff";
        }

        const text = lang === "kh" ? ans.answerKm || ans.answerEn : ans.answerEn;

        return (
          <button
            key={ans.id}
            disabled={disabled}
            onClick={() => {
              if (!disabled && onSelect) {
                onSelect(ans.id);
              }
            }}
            type="button"
            className={`relative flex items-center transition-all duration-300 ease-out active:scale-95 text-left font-black text-white ${isImagePick
                ? "overflow-hidden aspect-square justify-center rounded-2xl bg-white"
                : "gap-3 p-4 border-2 border-black rounded-none"
              }`}
            style={isImagePick ? {
              opacity,
              boxShadow: isCorrect
                ? "0 0 0 4px #22c55e, 0 10px 30px rgba(34,197,94,0.4)"
                : isWrong
                  ? "0 0 0 4px #ef4444, 0 10px 30px rgba(239,68,68,0.4)"
                  : isSelected && correctId === null
                    ? "0 0 0 4px #eab308, 0 10px 30px rgba(234,179,8,0.25)"
                    : "0 4px 20px rgba(0,0,0,0.1)",
              transform: isSelected && correctId === null ? "translateY(-4px) scale(1.02)" : isCorrect ? "scale(1.05)" : "scale(1)",
            } : {
              backgroundColor: bgColor,
              borderColor: borderColor,
              opacity,
              boxShadow: isSelected && correctId === null ? "4px 4px 0 #fff" : "4px 4px 0 #000",
              transform: isSelected && correctId === null ? "translate(-2px,-2px) scale(1.02)" : undefined,
              fontFamily: lang === "kh" ? "Siemreap, sans-serif" : undefined,
            }}
          >
            {!isImagePick && (
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-white/50 rounded-none">
                <Icon size={14} className="text-white" />
              </span>
            )}

            {isImagePick && ans.imageUrl ? (
              <div className="w-full h-full flex items-center justify-center p-4 relative bg-white rounded-2xl">
                <img
                  src={ans.imageUrl}
                  alt={text}
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300"
                  style={{ transform: (isSelected || isCorrect) ? "scale(1.05)" : "scale(1)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (sib) sib.style.display = "flex";
                  }}
                />
                {/* Fallback text if image fails */}
                <span className="text-xs leading-tight hidden items-center justify-center text-center text-black px-4 absolute inset-0 bg-zinc-50 rounded-2xl">
                  {text}
                </span>
                {/* Correct overlay — green tick & subtle green tint */}
                {isCorrect && (
                  <>
                    <div className="absolute inset-0 bg-green-500/5 rounded-2xl pointer-events-none" />
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 border border-white/50 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(34,197,94,0.6)] z-10 scale-in-center">
                      ✓
                    </span>
                  </>
                )}
                {/* Wrong overlay — red cross & subtle red tint */}
                {isWrong && (
                  <>
                    <div className="absolute inset-0 bg-red-500/5 rounded-2xl pointer-events-none" />
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 border border-white/50 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(239,68,68,0.6)] z-10 scale-in-center">
                      ✗
                    </span>
                  </>
                )}
              </div>
            ) : isImagePick && !ans.imageUrl ? (
              /* No image — show text fallback */
              <div className="w-full h-full flex items-center justify-center bg-zinc-50 relative rounded-2xl">
                <span className="text-sm font-bold text-black text-center px-4 leading-tight">{text}</span>
                {isCorrect && (
                  <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 border border-white/50 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(34,197,94,0.6)] z-10">✓</span>
                )}
                {isWrong && (
                  <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 border border-white/50 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(239,68,68,0.6)] z-10">✗</span>
                )}
              </div>
            ) : (
              <span className="flex-1 text-sm sm:text-base leading-tight">{text}</span>
            )}

            {/* Correct tick for non-image answers */}
            {!isImagePick && isCorrect && (
              <span className="absolute top-1 right-2 text-white font-black z-10">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
