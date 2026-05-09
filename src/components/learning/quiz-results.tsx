"use client";

import { Trophy, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface QuizResultsProps {
  score: number;
  total: number;
  onRetry: () => void;
}

export function QuizResults({ score, total, onRetry }: QuizResultsProps) {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70;

  const getMessage = () => {
    if (percentage === 100) return "Perfect Score! 🎉";
    if (percentage >= 90) return "Excellent! 🌟";
    if (percentage >= 80) return "Great Job! 👏";
    if (percentage >= 70) return "Good Work! 👍";
    if (percentage >= 50) return "Keep Practicing! 💪";
    return "Try Again! 📚";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="bg-white border-4 border-black p-12 text-center"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Trophy Icon */}
        <div
          className={`w-24 h-24 mx-auto mb-6 ${
            passed ? "bg-yellow-400" : "bg-gray-400"
          } border-4 border-black flex items-center justify-center`}
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <Trophy size={48} className="text-black" />
        </div>

        {/* Message */}
        <h2 className="text-4xl font-black mb-4">{getMessage()}</h2>

        {/* Score */}
        <div className="mb-8">
          <div className="text-6xl font-black mb-2">
            {score}/{total}
          </div>
          <div className="text-2xl font-bold text-zinc-600">
            {percentage}% Correct
          </div>
        </div>

        {/* Pass/Fail Badge */}
        <div
          className={`inline-block px-6 py-3 border-2 border-black font-black text-xl mb-8 ${
            passed ? "bg-green-400" : "bg-red-400"
          }`}
        >
          {passed ? "PASSED ✓" : "FAILED ✗"}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 border-2 border-black h-8">
            <div
              className={`h-full border-r-2 border-black transition-all duration-500 ${
                passed ? "bg-green-400" : "bg-red-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="bg-blue-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Try Again
          </button>
          <Link
            href="/learn"
            className="bg-white border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Back to Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
