"use client";

import { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";

interface MatrixData {
  totalUsers: number;
  activeStudents: number;
  completedQuizzes: number;
  averageScore: number;
  usersTrend: number;
  quizzesTrend: number;
  scoreTrend: number;
  activeTrend: number;
  timestamp: Date;
}

// Mock data generator - replace with real API calls
function generateMockData(): MatrixData {
  return {
    totalUsers: Math.floor(Math.random() * 5000) + 1000,
    activeStudents: Math.floor(Math.random() * 500) + 100,
    completedQuizzes: Math.floor(Math.random() * 10000) + 5000,
    averageScore: Math.round((Math.random() * 40 + 60) * 100) / 100,
    usersTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
    quizzesTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
    scoreTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
    activeTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
    timestamp: new Date(),
  };
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ElementType;
  color: string;
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
}: MetricCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="border-2 border-[#a8a8a8] bg-white shadow-[4px_4px_0_#000] p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest text-[#a8a8a8] mb-1">
            {title}
          </p>
          <p className="text-2xl font-black text-black mb-2">{value}</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" style={{ color: "#22c55e" }} />
            ) : (
              <ArrowDownRight
                className="h-3 w-3"
                style={{ color: "#ef4444" }}
              />
            )}
            <span
              className="text-xs font-bold"
              style={{
                color: isPositive ? "#22c55e" : "#ef4444",
              }}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        </div>
        <div
          className="p-2 rounded-none"
          style={{
            background: color,
            border: "2px solid #000",
          }}
        >
          <Icon className="h-5 w-5 text-black" />
        </div>
      </div>
    </div>
  );
}

export function RealtimeMatrix() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Initial data load
    setData(generateMockData());
    setLastUpdate(new Date());

    if (!isLive) return;

    // Update data every 3 seconds when live
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  if (!data) {
    return (
      <div className="border-2 border-[#a8a8a8] bg-white shadow-[4px_4px_0_#000] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] rounded-none">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">
              Real-Time Matrix
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1">
              Live Platform Metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-[#22c55e] animate-pulse" : "bg-[#a8a8a8]"
              }`}
            />
            <span className="text-xs font-bold uppercase text-[#a8a8a8]">
              {isLive ? "Live" : "Paused"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control bar */}
        <div className="flex items-center gap-2 pb-4 border-b-2 border-[#a8a8a8]">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-[#a8a8a8] rounded-none ${
              isLive
                ? "bg-[#ef4444] text-white shadow-[2px_2px_0_#000]"
                : "bg-white text-black shadow-[2px_2px_0_#000]"
            }`}
          >
            {isLive ? "Pause" : "Resume"}
          </button>
          <div className="flex-1" />
          <span className="text-xs text-[#a8a8a8] font-medium">
            Last updated: {lastUpdate?.toLocaleTimeString()}
          </span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={data.totalUsers.toLocaleString()}
            trend={data.usersTrend}
            icon={Users}
            color="#3b82f6"
          />
          <MetricCard
            title="Active Students"
            value={data.activeStudents.toLocaleString()}
            trend={data.activeTrend}
            icon={Activity}
            color="#06b6d4"
          />
          <MetricCard
            title="Completed Quizzes"
            value={data.completedQuizzes.toLocaleString()}
            trend={data.quizzesTrend}
            icon={BarChart3}
            color="#a855f7"
          />
          <MetricCard
            title="Average Score"
            value={`${data.averageScore}%`}
            trend={data.scoreTrend}
            icon={TrendingUp}
            color="#22c55e"
          />
        </div>

        {/* Info footer */}
        <div className="border-l-4 border-[#3b82f6] bg-[#e7f4fd] p-3">
          <p className="text-xs font-bold text-[#1e40af]">
            Updates every 3 seconds • All times in UTC
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
