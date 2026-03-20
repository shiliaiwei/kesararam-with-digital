"use client";

import { useState } from "react";
import { QuizViewer } from "./quiz-viewer";
import { QuizResults } from "./quiz-results";
import { Play, Info } from "lucide-react";

interface Question {
  id: number;
  questionEn: string;
  questionKm: string;
  imageUrl?: string;
  audioUrlEn?: string;
  audioUrlKm?: string;
  hintEn?: string;
  hintKm?: string;
  answers: Array<{
    id: number;
    answerEn: string;
    answerKm: string;
    isCorrect: boolean;
    imageUrl?: string;
  }>;
}

interface PracticeTestProps {
  questions: Question[];
  categoryName: string;
  language: "en" | "km";
}

export function PracticeTest({
  questions,
  categoryName,
  language,
}: PracticeTestProps) {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const handleStart = () => {
    setStarted(true);
    setCompleted(false);
  };

  const handleComplete = (finalScore: number, finalTotal: number) => {
    setScore(finalScore);
    setTotal(finalTotal);
    setCompleted(true);
  };

  const handleRetry = () => {
    setStarted(false);
    setCompleted(false);
    setScore(0);
    setTotal(0);
  };

  if (completed) {
    return <QuizResults score={score} total={total} onRetry={handleRetry} />;
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="bg-white border-4 border-black p-8"
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">Practice Test</h1>
            <p className="text-xl font-bold text-zinc-600">{categoryName}</p>
          </div>

          {/* Info */}
          <div
            className="bg-blue-100 border-2 border-blue-600 p-6 mb-8"
            style={{ boxShadow: "4px 4px 0 #2563eb" }}
          >
            <div className="flex items-start gap-3">
              <Info size={24} className="text-blue-900 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="font-bold text-blue-900">
                  Practice Mode - No Login Required
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Test your knowledge without creating an account</li>
                  <li>• {questions.length} questions to answer</li>
                  <li>• Instant feedback on each answer</li>
                  <li>• Your score will not be saved</li>
                  <li>• Perfect for quick practice sessions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 border-2 border-black">
              <div className="text-3xl font-black">{questions.length}</div>
              <div className="text-sm font-bold text-zinc-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border-2 border-black">
              <div className="text-3xl font-black">~{questions.length * 30}s</div>
              <div className="text-sm font-bold text-zinc-600">Duration</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border-2 border-black">
              <div className="text-3xl font-black">70%</div>
              <div className="text-sm font-bold text-zinc-600">Pass Mark</div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full bg-green-400 border-2 border-black px-8 py-4 font-black text-xl hover:shadow-[6px_6px_0_#000] transition-all inline-flex items-center justify-center gap-3"
          >
            <Play size={24} />
            Start Practice Test
          </button>

          {/* Note */}
          <p className="text-center text-sm text-zinc-600 mt-4">
            Want to track your progress?{" "}
            <a href="/login" className="font-bold text-blue-600 hover:text-blue-800">
              Sign in
            </a>{" "}
            or{" "}
            <a href="/register" className="font-bold text-blue-600 hover:text-blue-800">
              create an account
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <QuizViewer
      questions={questions}
      language={language}
      onComplete={handleComplete}
    />
  );
}
