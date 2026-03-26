"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameSSE } from "@/hooks/use-game-sse";
import type { SSEEvent, QuestionPayload, LeaderboardEntry, ParticipantInfo } from "@/lib/game-event-bus";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { Podium } from "@/components/game/Podium";
import { playSound } from "@/lib/game-sounds";

type GamePhase = "lobby" | "question" | "results" | "leaderboard" | "podium";

export default function StudentGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
  } | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [podium, setPodium] = useState<LeaderboardEntry[]>([]);
  const [lang] = useState<"en" | "kh">("en");

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === "lobby_update") {
      setParticipants(event.participants);
      setPhase("lobby");
    } else if (event.type === "question_start") {
      setCurrentQuestion(event.question);
      setQuestionIndex(event.index);
      setTotalQuestions(event.total);
      setEndsAt(event.endsAt);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setAnswerResult(null);
      setCorrectAnswerId(null);
      setPhase("question");
      playSound("question_start");
    } else if (event.type === "question_end") {
      setCorrectAnswerId(event.correctAnswerId);
      setLeaderboard(event.leaderboard);
      setPhase("results");
      playSound("question_end");
    } else if (event.type === "leaderboard") {
      setLeaderboard(event.entries);
      setPhase("leaderboard");
    } else if (event.type === "session_paused") {
      playSound("warning");
    } else if (event.type === "session_resumed") {
      playSound("countdown_tick");
    } else if (event.type === "session_end") {
      setPodium(event.podium);
      setLeaderboard(event.finalLeaderboard);
      setPhase("podium");
      playSound("game_end");
    } else if (event.type === "warning") {
      playSound("warning");
    }
  }, []);

  const { connected, error } = useGameSSE(code, handleSSEEvent);

  const submitAnswer = useCallback(
    async (answerId: number) => {
      if (answerSubmitted || !currentQuestion) return;

      setSelectedAnswer(answerId);
      setAnswerSubmitted(true);

      try {
        const res = await fetch(`/api/game/sessions/${code}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            answerId,
            answeredAt: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAnswerResult({
            isCorrect: data.isCorrect,
            pointsEarned: data.pointsEarned,
          });
          playSound(data.isCorrect ? "correct" : "incorrect");
        }
      } catch (err) {
        console.error("Failed to submit answer:", err);
      }
    },
    [answerSubmitted, currentQuestion, code]
  );

  useEffect(() => {
    if (!code) {
      router.push("/play");
    }
  }, [code, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
          <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/play")}
            className="w-full bg-purple-500 text-white px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg font-bold">Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <h1 className="text-4xl font-bold text-center mb-2">Game Code</h1>
            <p className="text-6xl font-bold text-center tracking-widest text-purple-600">
              {code}
            </p>
          </div>

          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold mb-4">
              Players ({participants.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className={`border-2 border-black p-4 ${
                    p.isConnected ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <div className="text-lg font-bold truncate">{p.displayName}</div>
                  <div className="text-sm text-gray-600">
                    {p.isConnected ? "Connected" : "Disconnected"}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-6">
              Waiting for host to start the game...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "question" && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-bold">
                Question {questionIndex + 1} / {totalQuestions}
              </span>
            </div>
            {endsAt && (
              <CountdownTimer
                endsAt={endsAt}
                totalSeconds={timePerQuestion}
                onExpire={() => {
                  if (!answerSubmitted) {
                    submitAnswer(0);
                  }
                }}
              />
            )}
          </div>

          <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="w-full max-h-64 object-contain mb-4 border-2 border-black"
              />
            )}
            <h2 className="text-2xl font-bold text-center">
              {currentQuestion.questionEn}
            </h2>
            {currentQuestion.questionKm && (
              <p className="text-xl text-center text-gray-600 mt-2">
                {currentQuestion.questionKm}
              </p>
            )}
          </div>

          <AnswerGrid
            answers={currentQuestion.answers}
            selectedId={selectedAnswer}
            correctId={correctAnswerId}
            disabled={answerSubmitted}
            lang={lang}
            gameType={currentQuestion.gameType}
            onSelect={submitAnswer}
          />

          {answerResult && (
            <div
              className={`mt-6 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                answerResult.isCorrect ? "bg-green-400" : "bg-red-400"
              }`}
            >
              <p className="text-2xl font-bold text-center">
                {answerResult.isCorrect ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-xl text-center mt-2">
                +{answerResult.pointsEarned} points
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "results" || phase === "leaderboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-bold text-center mb-6">Leaderboard</h2>
            <LeaderboardPanel entries={leaderboard} lang={lang} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "podium") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <h1 className="text-4xl font-bold text-center mb-8">Game Over!</h1>
            <Podium podium={podium} finalLeaderboard={leaderboard} lang={lang} />
          </div>

          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <h2 className="text-2xl font-bold mb-4">Final Standings</h2>
            <LeaderboardPanel entries={leaderboard} lang={lang} />
          </div>

          <button
            onClick={() => router.push("/play")}
            className="w-full bg-purple-500 text-white px-6 py-4 text-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
