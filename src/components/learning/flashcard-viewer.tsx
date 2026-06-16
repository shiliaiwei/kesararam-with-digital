"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";

interface Flashcard {
  id: number;
  questionEn: string;
  questionKm: string;
  answerEn: string;
  answerKm: string;
  imageUrl?: string;
  audioUrlEn?: string;
  audioUrlKm?: string;
  hintEn?: string;
  hintKm?: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  language: "en" | "km";
}

export function FlashcardViewer({ flashcards, language }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600">No flashcards available</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 border-2 border-black h-4">
          <div
            className="bg-green-400 h-full border-r-2 border-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative bg-white border-4 border-black p-8 min-h-[400px] cursor-pointer"
        style={{ boxShadow: "8px 8px 0 #000" }}
        onClick={handleFlip}
      >
        <div className="absolute top-4 right-4">
          <span className="bg-blue-400 border-2 border-black px-3 py-1 text-sm font-bold">
            {isFlipped ? "ANSWER" : "QUESTION"}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-6">
          {/* Image */}
          {currentCard.imageUrl && !isFlipped && (
            <img
              src={currentCard.imageUrl}
              alt="Question"
              className="max-w-md border-2 border-black"
              style={{ boxShadow: "4px 4px 0 #000" }}
            />
          )}

          {/* Text */}
          <div className="text-center space-y-4">
            <p className="text-3xl font-black font-learning">
              {isFlipped
                ? language === "en"
                  ? currentCard.answerEn
                  : currentCard.answerKm
                : language === "en"
                ? currentCard.questionEn
                : currentCard.questionKm}
            </p>

            {/* Audio Button */}
            {!isFlipped &&
              ((language === "en" && currentCard.audioUrlEn) ||
                (language === "km" && currentCard.audioUrlKm)) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(
                      language === "en"
                        ? currentCard.audioUrlEn!
                        : currentCard.audioUrlKm!
                    );
                  }}
                  className="bg-purple-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
                >
                  <Volume2 size={20} />
                  Play Audio
                </button>
              )}
          </div>

          {/* Hint */}
          {!isFlipped &&
            ((language === "en" && currentCard.hintEn) ||
              (language === "km" && currentCard.hintKm)) && (
              <div className="w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  {showHint ? "Hide Hint" : "Show Hint"}
                </button>
                {showHint && (
                  <div className="mt-2 p-4 bg-yellow-100 border-2 border-yellow-600">
                    <p className="text-sm font-medium font-learning">
                      💡{" "}
                      {language === "en"
                        ? currentCard.hintEn
                        : currentCard.hintKm}
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* Flip Instruction */}
          <p className="text-sm text-zinc-600 italic">
            Click card to {isFlipped ? "see question" : "reveal answer"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="bg-white border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setShowHint(false);
          }}
          className="bg-yellow-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Restart
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="bg-white border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
