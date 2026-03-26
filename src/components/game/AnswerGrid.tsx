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
            onClick={() => onSelect(ans.id)}
            className="relative flex items-center gap-3 p-4 border-2 border-black rounded-none font-black text-white text-left transition-all duration-100 active:scale-95"
            style={{
              backgroundColor: bgColor,
              borderColor,
              opacity,
              boxShadow: isSelected && correctId === null ? "4px 4px 0 #fff" : "4px 4px 0 #000",
              transform: isSelected && correctId === null ? "translate(-2px,-2px)" : undefined,
              fontFamily: lang === "kh" ? "Siemreap, sans-serif" : undefined,
            }}
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-white/50 rounded-none">
              <Icon size={14} className="text-white" />
            </span>
            {isImagePick && ans.imageUrl ? (
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <img
                  src={ans.imageUrl}
                  alt={text}
                  className="w-full h-20 object-contain border border-white/30"
                />
                <span className="text-sm truncate">{text}</span>
              </div>
            ) : (
              <span className="flex-1 text-sm leading-tight">{text}</span>
            )}
            {isCorrect && (
              <span className="absolute top-1 right-2 text-white text-xs font-black">
                +
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
