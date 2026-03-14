import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sessions, quizzes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Tv2, Play, Pause, Square, Clock, Users, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherSessionsPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const mySessions = await db
    .select({
      id: sessions.id,
      roomCode: sessions.roomCode,
      challengeType: sessions.challengeType,
      status: sessions.status,
      maxStudents: sessions.maxStudents,
      createdAt: sessions.createdAt,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
      quizTitle: quizzes.title,
    })
    .from(sessions)
    .leftJoin(quizzes, eq(sessions.quizId, quizzes.id))
    .where(eq(sessions.teacherId, session.id))
    .orderBy(desc(sessions.createdAt))
    .limit(50);

  // Calculate stats
  const totalSessions = mySessions.length;
  const activeSessions = mySessions.filter(s => s.status === 'active').length;
  const completedSessions = mySessions.filter(s => s.status === 'ended').length;
  const totalStudents = mySessions.reduce((sum, s) => sum + (s.maxStudents || 0), 0);

  const stats = [
    { label: "Total Sessions", value: totalSessions.toString(), icon: Tv2, color: "#3b82f6" },
    { label: "Active", value: activeSessions.toString(), icon: Play, color: "#22c55e" },
    { label: "Completed", value: completedSessions.toString(), icon: Square, color: "#f97316" },
    { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "#a855f7" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'paused': return '#f97316';
      case 'ended': return '#ef4444';
      case 'waiting': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'paused': return Pause;
      case 'ended': return Square;
      case 'waiting': return Clock;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Tv2 size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
                Sessions
              </h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                Live quiz and play sessions you have run
              </p>
            </div>
          </div>
          
          {/* New Session Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100">
            <Plus size={20} className="text-black" />
            <span className="font-black text-sm uppercase tracking-wide text-black">
              New Session
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3"
            style={{ borderRadius: "0px" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: stat.color, borderRadius: "0px" }}
              >
                <stat.icon size={20} className="text-black" />
              </div>
              <span className="text-3xl font-black text-black">
                {stat.value}
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Sessions Table Card */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-blue-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            Session History
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            {mySessions.length} session{mySessions.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Room Code
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Quiz
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Type
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black hidden md:table-cell">
                    Max Students
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {mySessions.map((s) => {
                  const StatusIcon = getStatusIcon(s.status);
                  const statusColor = getStatusColor(s.status);
                  
                  return (
                    <tr key={s.id} className="border-b border-zinc-200 hover:bg-yellow-50">
                      <td className="py-3 px-2">
                        <code className="px-2 py-1 text-xs font-black uppercase border-2 border-black bg-black text-white font-mono tracking-widest">
                          {s.roomCode}
                        </code>
                      </td>
                      <td className="py-3 px-2 font-bold text-sm text-black">
                        {s.quizTitle ?? "—"}
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-zinc-600 uppercase">
                        {s.challengeType}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 border border-black flex items-center justify-center"
                            style={{ backgroundColor: statusColor, borderRadius: "0px" }}
                          >
                            <StatusIcon size={12} className="text-black" />
                          </div>
                          <span
                            className="px-2 py-1 text-xs font-black uppercase border border-black"
                            style={{ backgroundColor: statusColor, color: "#000000", borderRadius: "0px" }}
                          >
                            {s.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-black hidden md:table-cell">
                        {s.maxStudents}
                      </td>
                      <td className="py-3 px-2 text-xs font-bold text-zinc-500 hidden lg:table-cell">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {mySessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-sm font-bold text-zinc-500 uppercase tracking-wide"
                    >
                      No sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
