"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Trophy, Zap } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  score: number;
  answered: boolean;
}

interface LiveChallengeProps {
  challengeId: string;
  teacherName: string;
  categoryName: string;
  language: "en" | "km";
}

export function LiveChallenge({
  challengeId,
  teacherName,
  categoryName,
  language,
}: LiveChallengeProps) {
  const [status, setStatus] = useState<"waiting" | "active" | "completed">("waiting");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState(0);

  // Simulate real-time updates (replace with actual WebSocket/SSE)
  useEffect(() => {
    if (status === "active" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [status, timeLeft]);

  const handleAnswerSelect = (answerId: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerId);
    // Send answer to server
  };

  if (status === "waiting") {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-white border-4 border-black p-8"
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-red-400 border-2 border-black px-4 py-2 font-black mb-4 animate-pulse">
              🔴 LIVE
            </div>
            <h1 className="text-4xl font-black mb-2">Live Challenge</h1>
            <p className="text-xl font-bold text-zinc-600">{categoryName}</p>
            <p className="text-lg text-zinc-600">
              Hosted by <span className="font-bold">{teacherName}</span>
            </p>
          </div>

          {/* Waiting Message */}
          <div
            className="bg-yellow-100 border-2 border-yellow-600 p-8 text-center mb-8"
            style={{ boxShadow: "4px 4px 0 #ca8a04" }}
          >
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-2xl font-black mb-2">Waiting for teacher to start...</p>
            <p className="text-zinc-600">
              The challenge will begin shortly. Get ready!
            </p>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} />
              <span className="font-bold">
                {participants.length} Participants Joined
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-50 border-2 border-black p-3 text-center"
                >
                  <div className="w-12 h-12 bg-blue-400 border-2 border-black rounded-full mx-auto mb-2 flex items-center justify-center font-black">
                    {p.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold truncate">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "active" && currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-400 border-2 border-black px-4 py-2 font-black animate-pulse">
              🔴 LIVE
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span className="font-bold">{participants.length} Players</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy size={20} />
              <span className="font-bold">Score: {myScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={20} />
              <span className="font-bold">Rank: #{myRank}</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`border-4 border-black p-4 text-center ${
            timeLeft <= 5 ? "bg-red-400 animate-pulse" : "bg-yellow-400"
          }`}
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <div className="flex items-center justify-center gap-3">
            <Clock size={32} />
            <span className="text-5xl font-black">{timeLeft}s</span>
          </div>
        </div>

        {/* Question */}
        <div
          className="bg-white border-4 border-black p-8"
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
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

          <h2 className="text-2xl font-black mb-6 font-learning">
            {language === "en"
              ? currentQuestion.questionEn
              : currentQuestion.questionKm}
          </h2>

          {/* Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.answers.map((answer: any, index: number) => {
              const isSelected = selectedAnswer === answer.id;
              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={selectedAnswer !== null}
                  className={`p-6 border-2 border-black font-bold text-left transition-all ${
                    isSelected
                      ? "bg-blue-400 shadow-[6px_6px_0_#000] scale-105"
                      : "bg-white hover:shadow-[4px_4px_0_#000]"
                  } ${selectedAnswer !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-gray-100 border-2 border-black flex items-center justify-center font-black text-xl">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-learning">
                      {language === "en" ? answer.answerEn : answer.answerKm}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <div className="mt-6 text-center">
              <div className="inline-block bg-green-400 border-2 border-black px-6 py-3 font-black">
                ✓ Answer Submitted!
              </div>
            </div>
          )}
        </div>

        {/* Live Leaderboard */}
        <div
          className="bg-white border-4 border-black p-6"
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <Trophy size={24} />
            Live Leaderboard
          </h3>
          <div className="space-y-2">
            {participants
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((p, index) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 border-2 border-black ${
                    index === 0
                      ? "bg-yellow-400"
                      : index === 1
                      ? "bg-gray-300"
                      : index === 2
                      ? "bg-orange-300"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center font-black">
                      {index + 1}
                    </span>
                    <span className="font-bold">{p.name}</span>
                  </div>
                  <span className="font-black">{p.score} pts</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
