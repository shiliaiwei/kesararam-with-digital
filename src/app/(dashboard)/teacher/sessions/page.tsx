import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { gameSessions } from "@/db/schema/game";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { Tv2, Play, Pause, Square, Clock, Users, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherSessionsPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const mySessions = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.hostId, session.id))
    .orderBy(desc(gameSessions.createdAt))
    .limit(50);

  const totalSessions = mySessions.length;
  const activeSessions = mySessions.filter(s => s.status === "lobby" || s.status === "active").length;
  const completedSessions = mySessions.filter(s => s.status === "ended").length;

  const stats = [
    { label: "Total Sessions", value: totalSessions, icon: Tv2, color: "#3b82f6" },
    { label: "Active / Lobby", value: activeSessions, icon: Play, color: "#22c55e" },
    { label: "Completed", value: completedSessions, icon: Square, color: "#f97316" },
  ];

  const statusColor: Record<string, string> = {
    lobby: "#3b82f6", active: "#22c55e", paused: "#f97316", ended: "#6b7280",
  };
  const statusIcon: Record<string, typeof Play> = {
    lobby: Clock, active: Play, paused: Pause, ended: Square,
  };

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Tv2 size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Sessions</h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">Live game sessions you have hosted</p>
            </div>
          </div>
          <Link href="/teacher/sessions/host"
            className="flex items-center gap-2 px-4 py-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <Zap size={20} className="text-black" />
            <span className="font-black text-sm uppercase text-black">Host Live Game</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]" style={{ backgroundColor: stat.color }}>
                <stat.icon size={20} className="text-black" />
              </div>
              <span className="text-3xl font-black">{stat.value}</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
        <div className="border-b-2 border-black bg-blue-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter">Session History</h2>
          <p className="text-sm font-bold text-black/70">{mySessions.length} sessions total</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                {["Code", "Mode", "Category", "Status", "Questions", "Date"].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mySessions.map((s) => {
                const Icon = statusIcon[s.status] ?? Clock;
                const color = statusColor[s.status] ?? "#6b7280";
                return (
                  <tr key={s.id} className="border-b border-zinc-200 hover:bg-yellow-50">
                    <td className="py-3 px-2">
                      <code className="px-2 py-1 text-xs font-black border-2 border-black bg-black text-white tracking-widest">
                        {s.sessionCode}
                      </code>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold uppercase">{s.gameMode}</td>
                    <td className="py-3 px-2 text-sm font-bold text-zinc-600">{s.category ?? "—"}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 text-xs font-black uppercase border border-black inline-flex items-center gap-1"
                        style={{ backgroundColor: color }}>
                        <Icon size={10} className="text-black" /> {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold">{s.questionIds?.length ?? 0}</td>
                    <td className="py-3 px-2 text-xs font-bold text-zinc-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {mySessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm font-bold text-zinc-500 uppercase">
                    No sessions yet. Host your first game!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
