"use client";

import { useState } from "react";
import { Check, X, ChevronRight, Volume2, Lightbulb } from "lucide-react";

interface Answer {
  id: number;
  answerEn: string;
  answerKm: string;
  isCorrect: boolean;
  imageUrl?: string;
}

interface Question {
  id: number;
  questionEn: string;
  questionKm: string;
  imageUrl?: string;
  audioUrlEn?: string;
  audioUrlKm?: string;
  hintEn?: string;
  hintKm?: string;
  answers: Answer[];
}

interface QuizViewerProps {
  questions: Question[];
  language: "en" | "km";
  onComplete: (score: number, total: number) => void;
}

export function QuizViewer({ questions, language, onComplete }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answerId: number; correct: boolean }[]>([]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerId: number) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const answer = currentQuestion.answers.find((a) => a.id === selectedAnswer);
    const isCorrect = answer?.isCorrect || false;

    setShowResult(true);
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        answerId: selectedAnswer,
        correct: isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(score + (showResult && selectedAnswer ? 1 : 0), questions.length);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const correctAnswer = currentQuestion.answers.find((a) => a.isCorrect);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-bold">
            Score: {score}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 border-2 border-black h-4">
          <div
            className="bg-blue-400 h-full border-r-2 border-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        className="bg-white border-4 border-black p-8"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Question Image */}
        {currentQuestion.imageUrl && (
          <div className="mb-6">
            <img
              src={currentQuestion.imageUrl}
              alt="Question"
              className="max-w-md mx-auto border-2 border-black"
              style={{ boxShadow: "4px 4px 0 #000" }}
            />
          </div>
        )}

        {/* Question Text */}
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-4">
            {language === "en"
              ? currentQuestion.questionEn
              : currentQuestion.questionKm}
          </h2>

          {/* Audio Button */}
          {((language === "en" && currentQuestion.audioUrlEn) ||
            (language === "km" && currentQuestion.audioUrlKm)) && (
            <button
              onClick={() =>
                playAudio(
                  language === "en"
                    ? currentQuestion.audioUrlEn!
                    : currentQuestion.audioUrlKm!
                )
              }
              className="bg-purple-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
            >
              <Volume2 size={18} />
              Play Audio
            </button>
          )}
        </div>

        {/* Hint */}
        {!showResult &&
          ((language === "en" && currentQuestion.hintEn) ||
            (language === "km" && currentQuestion.hintKm)) && (
            <div className="mb-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-2"
              >
                <Lightbulb size={16} />
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
              {showHint && (
                <div className="mt-2 p-4 bg-yellow-100 border-2 border-yellow-600">
                  <p className="text-sm font-medium">
                    💡{" "}
                    {language === "en"
                      ? currentQuestion.hintEn
                      : currentQuestion.hintKm}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrectAnswer = answer.isCorrect;
            const showCorrect = showResult && isCorrectAnswer;
            const showWrong = showResult && isSelected && !isCorrectAnswer;

            return (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={showResult}
                className={`w-full text-left p-4 border-2 border-black font-bold transition-all ${
                  showCorrect
                    ? "bg-green-400 shadow-[4px_4px_0_#000]"
                    : showWrong
                    ? "bg-red-400 shadow-[4px_4px_0_#000]"
                    : isSelected
                    ? "bg-blue-400 shadow-[4px_4px_0_#000]"
                    : "bg-white hover:shadow-[4px_4px_0_#000]"
                } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 border-2 border-black flex items-center justify-center font-black ${
                      showCorrect || showWrong ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    {showCorrect ? (
                      <Check size={20} className="text-green-600" />
                    ) : showWrong ? (
                      <X size={20} className="text-red-600" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </span>
                  <span className="flex-1">
                    {language === "en" ? answer.answerEn : answer.answerKm}
                  </span>
                  {answer.imageUrl && (
                    <img
                      src={answer.imageUrl}
                      alt="Answer"
                      className="w-16 h-16 object-cover border-2 border-black"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Result Message */}
        {showResult && (
          <div
            className={`mt-6 p-4 border-2 border-black ${
              selectedAnswer === correctAnswer?.id
                ? "bg-green-100 border-green-600"
                : "bg-red-100 border-red-600"
            }`}
          >
            <p className="font-bold text-lg mb-2">
              {selectedAnswer === correctAnswer?.id
                ? "✓ Correct!"
                : "✗ Incorrect"}
            </p>
            {selectedAnswer !== correctAnswer?.id && (
              <p className="text-sm">
                The correct answer is:{" "}
                <span className="font-bold">
                  {language === "en"
                    ? correctAnswer?.answerEn
                    : correctAnswer?.answerKm}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="bg-green-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-blue-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
