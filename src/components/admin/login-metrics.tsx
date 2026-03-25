"use client";

import { useEffect, useState } from "react";
import { LogIn, Users, Activity, TrendingUp, Clock } from "lucide-react";

interface LoginMetrics {
  totalLogins: number;
  uniqueUsers: number;
  activeSessions: number;
  todayLogins: number;
  loginsByRole: Record<string, number>;
  loginTrend: Array<{ date: string; logins: number }>;
}

interface Session {
  id: number;
  userId: number;
  username: string;
  email: string;
  displayName: string | null;
  role: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  loginAt: string;
  logoutAt: string | null;
  lastActivityAt: string;
}

export function LoginMetrics() {
  const [metrics, setMetrics] = useState<LoginMetrics | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/login-metrics");
      const data = await response.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setSessions(data.recentSessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch login metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <Activity size={32} className="text-zinc-400" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Failed to load metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-zinc-600">
              Total Logins (30d)
            </span>
            <LogIn size={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-black">
            {metrics.totalLogins}
          </p>
        </div>

        {/* Unique Users */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-zinc-600">
              Unique Users
            </span>
            <Users size={18} className="text-green-500" />
          </div>
          <p className="text-3xl font-black text-black">
            {metrics.uniqueUsers}
          </p>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-zinc-600">
              Active Sessions
            </span>
            <Activity size={18} className="text-purple-500" />
          </div>
          <p className="text-3xl font-black text-black">
            {metrics.activeSessions}
          </p>
        </div>

        {/* Today's Logins */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-zinc-600">
              Today's Logins
            </span>
            <TrendingUp size={18} className="text-orange-500" />
          </div>
          <p className="text-3xl font-black text-black">
            {metrics.todayLogins}
          </p>
        </div>
      </div>

      {/* Logins by Role */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
        <h3 className="text-sm font-black uppercase mb-4 text-black">
          Logins by Role
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(metrics.loginsByRole).map(([role, count]) => (
            <div
              key={role}
              className="bg-zinc-50 border border-zinc-200 p-3 rounded"
            >
              <p className="text-xs font-bold uppercase text-zinc-600 mb-1">
                {role}
              </p>
              <p className="text-2xl font-black text-black">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Login Trend */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
        <h3 className="text-sm font-black uppercase mb-4 text-black">
          7-Day Login Trend
        </h3>
        <div className="flex items-end gap-2 h-32">
          {metrics.loginTrend.map((day, idx) => {
            const maxLogins = Math.max(
              ...metrics.loginTrend.map((d) => d.logins),
              1
            );
            const height = (day.logins / maxLogins) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 border border-black"
                  style={{ height: `${height}%`, minHeight: "4px" }}
                />
                <span className="text-[10px] font-bold text-zinc-600">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_#000]">
        <h3 className="text-sm font-black uppercase mb-4 text-black">
          Recent Sessions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-2 font-black uppercase text-xs">
                  User
                </th>
                <th className="text-left py-2 px-2 font-black uppercase text-xs">
                  Role
                </th>
                <th className="text-left py-2 px-2 font-black uppercase text-xs">
                  IP Address
                </th>
                <th className="text-left py-2 px-2 font-black uppercase text-xs">
                  Login Time
                </th>
                <th className="text-left py-2 px-2 font-black uppercase text-xs">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-zinc-200 hover:bg-zinc-50"
                >
                  <td className="py-2 px-2">
                    <div>
                      <p className="font-bold text-black">
                        {session.displayName || session.username}
                      </p>
                      <p className="text-xs text-zinc-500">{session.email}</p>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className="inline-block px-2 py-1 bg-zinc-100 border border-zinc-300 rounded text-xs font-bold uppercase">
                      {session.role}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs font-mono text-zinc-600">
                    {session.ipAddress || "N/A"}
                  </td>
                  <td className="py-2 px-2 text-xs">
                    {new Date(session.loginAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                        session.isActive
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-300"
                      }`}
                    >
                      {session.isActive ? "Active" : "Logged Out"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
