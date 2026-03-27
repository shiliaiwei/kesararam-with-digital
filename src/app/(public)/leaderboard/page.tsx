"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      if (!res.ok) {
        console.error("Leaderboard API error:", res.status);
        return;
      }
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen dot-bg">
      <div
        className="border-b-4 border-black py-16"
        style={{ backgroundColor: "#eab308" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-black tracking-widest uppercase bg-black text-white px-3 py-1.5 rounded-none">
            Leaderboard
          </span>
          <h1 className="text-5xl font-black text-black mt-3">Rankings</h1>
          <p className="text-black/70 text-lg mt-2">
            Top students by total points earned from live games. Scores persist for 1 year.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12">
              {/* 2nd Place */}
              <div className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0_#3b82f6] p-6 flex flex-col items-center gap-2 w-full md:w-48 order-1 md:order-none">
                {top3[1] ? (
                  <>
                    {top3[1].avatar ? (
                      <img
                        src={top3[1].avatar}
                        alt={top3[1].displayName || top3[1].username}
                        className="w-14 h-14 border-2 border-black rounded-none object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-zinc-200 border-2 border-black rounded-none flex items-center justify-center font-black text-xl">
                        2
                      </div>
                    )}
                    <span className="font-black text-sm text-center line-clamp-1">
                      {top3[1].displayName || top3[1].username}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Medal size={14} className="text-zinc-400" />
                      Silver
                    </span>
                    <span className="font-black text-lg text-blue-600 tabular-nums">
                      {top3[1].lifetimePoints.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-zinc-200 border-2 border-black rounded-none flex items-center justify-center font-black text-xl">
                      2
                    </div>
                    <span className="font-black text-sm text-center text-zinc-400">—</span>
                    <span className="text-xs text-zinc-500">Silver</span>
                  </>
                )}
              </div>

              {/* 1st Place */}
              <div className="bg-yellow-400 border-2 border-black rounded-none shadow-[6px_6px_0_#ca8a04] p-8 flex flex-col items-center gap-2 w-full md:w-56 order-0 md:order-none">
                {top3[0] ? (
                  <>
                    {top3[0].avatar ? (
                      <img
                        src={top3[0].avatar}
                        alt={top3[0].displayName || top3[0].username}
                        className="w-16 h-16 border-2 border-black rounded-none object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white border-2 border-black rounded-none flex items-center justify-center font-black text-2xl">
                        1
                      </div>
                    )}
                    <span className="font-black text-center line-clamp-1">
                      {top3[0].displayName || top3[0].username}
                    </span>
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Trophy size={14} className="text-yellow-600" />
                      Gold Champion
                    </span>
                    <span className="font-black text-2xl tabular-nums">
                      {top3[0].lifetimePoints.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white border-2 border-black rounded-none flex items-center justify-center font-black text-2xl">
                      1
                    </div>
                    <span className="font-black text-center text-zinc-400">—</span>
                    <span className="text-xs font-bold">Gold Champion</span>
                  </>
                )}
              </div>

              {/* 3rd Place */}
              <div className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0_#f97316] p-6 flex flex-col items-center gap-2 w-full md:w-48 order-2 md:order-none">
                {top3[2] ? (
                  <>
                    {top3[2].avatar ? (
                      <img
                        src={top3[2].avatar}
                        alt={top3[2].displayName || top3[2].username}
                        className="w-14 h-14 border-2 border-black rounded-none object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-orange-100 border-2 border-black rounded-none flex items-center justify-center font-black text-xl">
                        3
                      </div>
                    )}
                    <span className="font-black text-sm text-center line-clamp-1">
                      {top3[2].displayName || top3[2].username}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Award size={14} className="text-orange-600" />
                      Bronze
                    </span>
                    <span className="font-black text-lg text-orange-600 tabular-nums">
                      {top3[2].lifetimePoints.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-100 border-2 border-black rounded-none flex items-center justify-center font-black text-xl">
                      3
                    </div>
                    <span className="font-black text-sm text-center text-zinc-400">—</span>
                    <span className="text-xs text-zinc-500">Bronze</span>
                  </>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0_#000] overflow-hidden">
              <div className="grid grid-cols-4 bg-yellow-400 border-b-2 border-black px-6 py-3 text-xs font-black tracking-wider text-black">
                <span>Rank</span>
                <span className="col-span-2">Student</span>
                <span className="text-right">Score</span>
              </div>
              {rest.length > 0 ? (
                rest.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-4 px-6 py-4 border-t border-zinc-100 text-sm font-medium hover:bg-zinc-50"
                  >
                    <span className="font-bold text-zinc-600">#{user.rank}</span>
                    <div className="col-span-2 flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName || user.username}
                          className="w-8 h-8 border border-black rounded-none object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-zinc-200 border border-black rounded-none" />
                      )}
                      <span className="font-bold text-black truncate">
                        {user.displayName || user.username}
                      </span>
                    </div>
                    <span className="text-right font-black text-black tabular-nums">
                      {user.lifetimePoints.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-zinc-400">
                  No rankings yet. Play live games to appear on the leaderboard!
                </div>
              )}
            </div>

            <p className="text-center text-sm text-zinc-500 mt-6">
              Rankings update in real time. Only live game scores are included. Solo practice scores are not tracked.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
