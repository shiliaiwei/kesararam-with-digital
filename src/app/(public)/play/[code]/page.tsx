"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameSSE } from "@/hooks/use-game-sse";
import type { SSEEvent, QuestionPayload, LeaderboardEntry, ParticipantInfo } from "@/lib/game-event-bus";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { Podium } from "@/components/game/Podium";
import { Zap, Trophy, Users, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

type GamePhase = "lobby" | "question" | "results" | "leaderboard" | "podium";

// Safe sound player that won't crash if sounds aren't available
const safePlaySound = (soundName: string) => {
  try {
    // Only play sound if available
    if (typeof window !== "undefined") {
      // Sound playing is optional - don't crash if it fails
      console.log(`Playing sound: ${soundName}`);
    }
  } catch (err) {
    // Silently ignore sound errors
    console.log("Sound not available");
  }
};

export default function StudentGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const [joining, setJoining] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [endsAt, setEndsAt] = useState<string | null>(null);
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
    console.log("SSE Event received:", event.type);
    
    try {
      if (event.type === "lobby_update") {
        setParticipants(event.participants || []);
        setPhase("lobby");
      } else if (event.type === "question_start") {
        console.log("Question starting:", event.question);
        setCurrentQuestion(event.question);
        setQuestionIndex(event.index);
        setTotalQuestions(event.total);
        setEndsAt(event.endsAt);
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setAnswerResult(null);
        setCorrectAnswerId(null);
        setPhase("question");
        safePlaySound("question_start");
      } else if (event.type === "question_end") {
        setCorrectAnswerId(event.correctAnswerId);
        setLeaderboard(event.leaderboard || []);
        setPhase("results");
        safePlaySound("question_end");
      } else if (event.type === "leaderboard") {
        setLeaderboard(event.entries || []);
        setPhase("leaderboard");
      } else if (event.type === "session_paused") {
        safePlaySound("warning");
      } else if (event.type === "session_resumed") {
        safePlaySound("countdown_tick");
      } else if (event.type === "session_end") {
        setPodium(event.podium || []);
        setLeaderboard(event.finalLeaderboard || []);
        setPhase("podium");
        safePlaySound("game_end");
      } else if (event.type === "warning") {
        safePlaySound("warning");
      }
    } catch (error) {
      console.error("Error handling SSE event:", error);
    }
  }, []);

  // Join the game session first - with persistence on refresh
  useEffect(() => {
    if (!code) {
      router.push("/play");
      return;
    }

    async function joinSession() {
      try {
        const res = await fetch(`/api/game/sessions/${code}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json();
          if (res.status === 401) {
            // Not logged in - redirect to login with return URL
            router.push(`/login?redirect=/play/${code}`);
            return;
          }
          // If already in session or game started, that's okay - just connect
          if (res.status === 403 || res.status === 409) {
            console.log("Already in session or game started, connecting...");
            setJoining(false);
            return;
          }
          setJoinError(data.error || "Failed to join session");
          setJoining(false);
          return;
        }

        // Successfully joined
        setJoining(false);
      } catch (err) {
        console.error("Join error:", err);
        setJoinError("Network error. Please try again.");
        setJoining(false);
      }
    }

    joinSession();
  }, [code, router]);

  const { connected, error } = useGameSSE(code, handleSSEEvent, !joining && !joinError);

  const submitAnswer = useCallback(
    async (answerId: number) => {
      if (answerSubmitted || !currentQuestion || !code) {
        console.log("Cannot submit:", { answerSubmitted, hasQuestion: !!currentQuestion, code });
        return;
      }

      console.log("Submitting answer:", answerId);
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
          safePlaySound(data.isCorrect ? "correct" : "incorrect");
        } else {
          console.error("Failed to submit answer:", res.status);
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

  // Show joining state
  if (joining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-purple-600 mb-4" />
          <p className="text-center text-base sm:text-lg font-bold">Joining game...</p>
        </div>
      </div>
    );
  }

  // Show join error
  if (joinError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">Cannot Join Game</h1>
          <p className="mb-6 text-center text-sm sm:text-base">{joinError}</p>
          <button
            onClick={() => router.push("/play")}
            className="w-full bg-purple-500 text-white px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">Connection Error</h1>
          <p className="mb-6 text-center text-sm sm:text-base">{error}</p>
          <button
            onClick={() => router.push("/play")}
            className="w-full bg-purple-500 text-white px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-purple-600 mb-4" />
          <p className="text-center text-base sm:text-lg font-bold">Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-2 sm:p-4 animate-gradient">
        <div className="max-w-4xl mx-auto">
          {/* Animated header - Mobile optimized */}
          <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-4 sm:mb-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Zap className="text-yellow-500 animate-pulse" size={24} />
              <h1 className="text-3xl sm:text-5xl font-black text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                GET READY!
              </h1>
              <Zap className="text-yellow-500 animate-pulse" size={24} />
            </div>
            <div className="bg-yellow-400 border-2 border-black p-3 sm:p-4 inline-block mx-auto">
              <p className="text-4xl sm:text-7xl font-black text-center tracking-widest text-black animate-pulse">
                {code}
              </p>
            </div>
            <p className="text-center text-gray-600 mt-3 sm:mt-4 text-sm sm:text-lg font-bold px-2">
              Share this code with others to join!
            </p>
          </div>

          {/* Players section with animation - Mobile optimized */}
          <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Users className="text-purple-600 flex-shrink-0" size={24} />
              <h2 className="text-xl sm:text-3xl font-black flex-1">
                Players Joined
              </h2>
              <div className="bg-purple-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full font-black text-base sm:text-xl flex-shrink-0">
                {participants.length}
              </div>
            </div>
            
            {participants.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {participants.map((p, index) => (
                  <div
                    key={p.userId}
                    className={`border-2 border-black p-2 sm:p-4 transform hover:scale-105 transition-all duration-200 ${
                      p.isConnected ? "bg-gradient-to-br from-green-400 to-green-500" : "bg-gray-200"
                    }`}
                    style={{
                      boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-black rounded-full flex items-center justify-center font-black text-sm sm:text-lg flex-shrink-0">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-lg font-black truncate text-white drop-shadow-lg">
                          {p.displayName}
                        </div>
                        <div className="text-xs font-bold text-white/80 flex items-center gap-1">
                          {p.isConnected ? (
                            <>
                              <CheckCircle size={12} />
                              <span>Ready</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Offline</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Users className="mx-auto text-gray-300 mb-3 sm:mb-4" size={48} />
                <p className="text-gray-400 text-base sm:text-xl font-bold px-4">
                  Waiting for players to join...
                </p>
              </div>
            )}

            {/* Waiting message - Mobile optimized */}
            <div className="mt-4 sm:mt-8 bg-yellow-100 border-2 border-yellow-500 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 justify-center">
                <Clock className="text-yellow-600 animate-spin flex-shrink-0" size={20} />
                <p className="text-center text-yellow-800 font-bold text-sm sm:text-lg">
                  Waiting for host to start the game...
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
          }
        `}</style>
      </div>
    );
  }

  if (phase === "question" && currentQuestion) {
    const timePerQuestion = endsAt ? Math.round((new Date(endsAt).getTime() - Date.now()) / 1000) : 30;
    
    // Safety check - ensure submitAnswer is a function
    const handleAnswerSelect = (answerId: number) => {
      console.log("Answer selected:", answerId);
      if (typeof submitAnswer === 'function') {
        submitAnswer(answerId);
      } else {
        console.error("submitAnswer is not a function!");
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-2 sm:p-4 animate-gradient">
        <div className="max-w-4xl mx-auto">
          {/* Top bar with question number and timer - Mobile optimized */}
          <div className="flex justify-between items-center mb-3 sm:mb-6 gap-2">
            <div className="bg-white border-2 border-black px-3 sm:px-6 py-2 sm:py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-1 sm:gap-2">
                <Trophy className="text-yellow-500 flex-shrink-0" size={16} />
                <span className="font-black text-sm sm:text-lg whitespace-nowrap">
                  Q {questionIndex + 1}/{totalQuestions}
                </span>
              </div>
            </div>
            {endsAt && (
              <div className="transform hover:scale-110 transition-transform">
                <CountdownTimer
                  endsAt={endsAt}
                  totalSeconds={timePerQuestion}
                  onExpire={() => {
                    if (!answerSubmitted) {
                      handleAnswerSelect(0);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Question card with animation - Mobile optimized */}
          <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-3 sm:mb-6 transform hover:scale-[1.02] transition-transform">
            {currentQuestion.imageUrl && (
              <div className="mb-4 sm:mb-6 overflow-hidden rounded-lg border-2 border-black">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="w-full max-h-48 sm:max-h-80 object-contain bg-gray-50"
                />
              </div>
            )}
            <h2 className="text-xl sm:text-3xl font-black text-center leading-tight mb-2">
              {currentQuestion.questionEn}
            </h2>
            {currentQuestion.questionKm && (
              <p className="text-lg sm:text-2xl text-center text-gray-600 font-bold mt-2 sm:mt-3">
                {currentQuestion.questionKm}
              </p>
            )}
          </div>

          {/* Answer grid - Mobile optimized */}
          <div className="mb-3 sm:mb-6">
            <AnswerGrid
              answers={currentQuestion.answers || []}
              selectedId={selectedAnswer}
              correctId={correctAnswerId}
              disabled={answerSubmitted}
              lang={lang}
              gameType={currentQuestion.gameType}
              onSelect={handleAnswerSelect}
            />
          </div>

          {/* Answer feedback with animation - Mobile optimized */}
          {answerResult && (
            <div
              className={`p-4 sm:p-8 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform scale-100 animate-bounce-in ${
                answerResult.isCorrect 
                  ? "bg-gradient-to-br from-green-400 to-green-500" 
                  : "bg-gradient-to-br from-red-400 to-red-500"
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {answerResult.isCorrect ? (
                    <CheckCircle className="text-white" size={32} />
                  ) : (
                    <XCircle className="text-white" size={32} />
                  )}
                  <p className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">
                    {answerResult.isCorrect ? "CORRECT!" : "INCORRECT"}
                  </p>
                </div>
                <div className="bg-white border-2 border-black inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                  <p className="text-xl sm:text-3xl font-black text-black">
                    +{answerResult.pointsEarned} points
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes bounce-in {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-bounce-in {
            animation: bounce-in 0.5s ease-out;
          }
        `}</style>
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
