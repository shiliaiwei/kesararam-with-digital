"use client";

import { useState, useEffect } from "react";

interface StudentProfileStatsProps {
  userId: number;
  initialHighestScore: number;
  initialTotalGamesPlayed: number;
  initialLifetimePoints: number;
}

export function StudentProfileStats({
  userId,
  initialHighestScore,
  initialTotalGamesPlayed,
  initialLifetimePoints,
}: StudentProfileStatsProps) {
  const [stats, setStats] = useState({
    highestScore: initialHighestScore,
    totalGamesPlayed: initialTotalGamesPlayed,
    lifetimePoints: initialLifetimePoints,
    currentRank: null as number | null,
  });

  useEffect(() => {
    // Fetch current rank from API
    async function fetchRank() {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            highestScore: data.stats?.highestScore || initialHighestScore,
            totalGamesPlayed: data.stats?.totalGamesPlayed || initialTotalGamesPlayed,
            lifetimePoints: data.stats?.lifetimePoints || initialLifetimePoints,
            currentRank: data.stats?.currentRank || null,
          });
        }
      } catch (error) {
        console.log("Could not fetch rank:", error);
      }
    }

    fetchRank();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRank, 30000);
    return () => clearInterval(interval);
  }, [userId, initialHighestScore, initialTotalGamesPlayed, initialLifetimePoints]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Total Score", value: stats.lifetimePoints.toLocaleString(), color: "#eab308" },
        { label: "Challenges", value: stats.totalGamesPlayed.toString(), color: "#22c55e" },
        { label: "Current Rank", value: stats.currentRank ? `#${stats.currentRank}` : "—", color: "#3b82f6" },
        { label: "Highest Score", value: stats.highestScore.toLocaleString(), color: "#a855f7" },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            background: "#ffffff",
            border: "2px solid #000",
            boxShadow: "3px 3px 0 #000",
            padding: "16px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 900, color }}>
            {value}
          </span>
          <p
            style={{
              fontSize: "12px",
              color: "#71717a",
              fontWeight: 600,
              marginTop: "4px",
            }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
