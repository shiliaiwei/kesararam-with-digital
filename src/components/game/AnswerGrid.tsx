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
            className={`relative flex items-center transition-all duration-100 active:scale-95 text-left font-black text-white ${
              isImagePick ? "p-0 border-4 rounded-xl overflow-hidden aspect-square justify-center" : "gap-3 p-4 border-2 border-black rounded-none"
            }`}
            style={{
              backgroundColor: isImagePick ? "#000" : bgColor,
              borderColor: isImagePick ? (isSelected ? "#ffd700" : "transparent") : borderColor,
              opacity,
              boxShadow: isImagePick 
                ? (isSelected && correctId === null ? "0 0 0 4px #ffd700" : "0 8px 20px rgba(0,0,0,0.3)") 
                : (isSelected && correctId === null ? "4px 4px 0 #fff" : "4px 4px 0 #000"),
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
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white">
                <img
                  src={ans.imageUrl}
                  alt={text}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                    }
                  }}
                />
                <span className="text-sm leading-tight hidden text-center text-black px-2">{text} (Image Broken)</span>
              </div>
            ) : !isImagePick && (
              <span className="flex-1 text-sm sm:text-base leading-tight">{text}</span>
            )}
            
            {isCorrect && (
              <span className={`absolute ${isImagePick ? "top-2 right-2 w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center" : "top-1 right-2"} text-white font-black z-10`}>
                {isImagePick ? "✓" : "+"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
