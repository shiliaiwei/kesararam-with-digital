"use client";

import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from "lucide-react";

interface StatsData {
  totalContent: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  thisWeek: number;
  approvalRate: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData>({
    totalContent: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    thisWeek: 0,
    approvalRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/staff/analytics");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics");
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Content",
      value: stats.totalContent,
      icon: FileText,
      color: "bg-blue-400",
      borderColor: "border-blue-600",
    },
    {
      title: "Pending Approval",
      value: stats.pendingApproval,
      icon: Clock,
      color: "bg-yellow-400",
      borderColor: "border-yellow-600",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "bg-green-400",
      borderColor: "border-green-600",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "bg-red-400",
      borderColor: "border-red-600",
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      icon: TrendingUp,
      color: "bg-purple-400",
      borderColor: "border-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border-2 border-black p-6 animate-pulse"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-yellow-100 border-2 border-yellow-600 p-6"
        style={{ boxShadow: "4px 4px 0 #facc15" }}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="text-yellow-900" size={24} />
          <div>
            <p className="font-bold text-yellow-900">Unable to load statistics</p>
            <p className="text-sm text-yellow-800">
              {error}. Your content is safe, but stats are temporarily unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white border-2 border-black p-6 ${stat.borderColor}`}
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} border-2 border-black flex items-center justify-center`}
                >
                  <Icon size={24} className="text-black" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-600 uppercase mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-black">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval Rate */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-black">Approval Rate</h3>
          <span className="text-2xl font-black text-green-600">
            {stats.approvalRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 border-2 border-black h-8">
          <div
            className="bg-green-400 h-full border-r-2 border-black transition-all duration-500"
            style={{ width: `${stats.approvalRate}%` }}
          />
        </div>
        <p className="text-sm text-zinc-600 mt-2">
          {stats.approved} approved out of {stats.approved + stats.rejected} reviewed
        </p>
      </div>
    </div>
  );
}
