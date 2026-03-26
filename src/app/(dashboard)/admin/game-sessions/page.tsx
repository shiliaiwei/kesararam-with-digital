import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { users } from "@/db/schema/users";
import { eq, desc, count, sql } from "drizzle-orm";
import Link from "next/link";
import { Gamepad2, Users, Play, Square, Clock, BarChart2, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

async function terminateSession(sessionId: number) {
  "use server";
  await db
    .update(gameSessions)
    .set({ status: "ended", endedAt: new Date() })
    .where(eq(gameSessions.id, sessionId));
}

export default async function AdminGameSessionsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const rows = await db
    .select({
      id: gameSessions.id,
      sessionCode: gameSessions.sessionCode,
      sessionName: gameSessions.sessionName,
      status: gameSessions.status,
      gameType: gameSessions.gameType,
      questionCount: gameSessions.questionCount,
      timePerQuestion: gameSessions.timePerQuestion,
      scoringMode: gameSessions.scoringMode,
      isSoloPractice: gameSessions.isSoloPractice,
      currentQuestionIndex: gameSessions.currentQuestionIndex,
      startedAt: gameSessions.startedAt,
      endedAt: gameSessions.endedAt,
      createdAt: gameSessions.createdAt,
      hostName: users.displayName,
      hostEmail: users.email,
    })
    .from(gameSessions)
    .leftJoin(users, eq(gameSessions.hostId, users.id))
    .orderBy(desc(gameSessions.createdAt))
    .limit(100);

  // Participant counts per session
  const participantCounts = await db
    .select({
      sessionId: gameParticipants.sessionId,
      count: count(),
    })
    .from(gameParticipants)
    .groupBy(gameParticipants.sessionId);

  const countMap = new Map(participantCounts.map((p) => [p.sessionId, p.count]));

  const total = rows.length;
  const active = rows.filter((r) => r.status === "active" || r.status === "paused").length;
  const ended = rows.filter((r) => r.status === "ended").length;
  const lobby = rows.filter((r) => r.status === "lobby").length;
  const soloCount = rows.filter((r) => r.isSoloPractice).length;

  const STATUS_COLOR: Record<string, string> = {
    lobby: "#3b82f6",
    active: "#22c55e",
    paused: "#f97316",
    ended: "#6b7280",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-4 border-black pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Gamepad2 size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
              Game Sessions
            </h1>
            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
              All live and solo game sessions
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: total, color: "#3b82f6", icon: Gamepad2 },
          { label: "Active", value: active, color: "#22c55e", icon: Play },
          { label: "Lobby", value: lobby, color: "#3b82f6", icon: Clock },
          { label: "Ended", value: ended, color: "#6b7280", icon: Square },
          { label: "Solo", value: soloCount, color: "#a855f7", icon: Zap },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000] flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div
                className="w-8 h-8 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000]"
                style={{ backgroundColor: color }}
              >
                <Icon size={14} className="text-black" />
              </div>
              <span className="text-2xl font-black">{value}</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
        <div className="border-b-2 border-black bg-purple-400 p-4 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            All Sessions
          </h2>
          <span className="text-sm font-bold text-black/70">{rows.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black bg-zinc-50">
                {["Code", "Name", "Host", "Type", "Status", "Players", "Progress", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-3 text-xs font-black uppercase tracking-widest text-black"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const statusColor = STATUS_COLOR[row.status] ?? "#6b7280";
                const playerCount = countMap.get(row.id) ?? 0;
                const progress =
                  row.questionCount > 0
                    ? Math.round(
                        (((row.currentQuestionIndex ?? -1) + 1) / row.questionCount) * 100
                      )
                    : 0;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-200 hover:bg-yellow-50 transition-colors"
                  >
                    {/* Code */}
                    <td className="py-3 px-3">
                      <code className="px-2 py-1 text-xs font-black uppercase border-2 border-black bg-black text-yellow-400 tracking-widest">
                        {row.sessionCode}
                      </code>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-sm text-black max-w-[160px] truncate">
                        {row.sessionName}
                      </div>
                      {row.isSoloPractice && (
                        <span className="text-[10px] font-black uppercase text-purple-600">
                          solo
                        </span>
                      )}
                    </td>

                    {/* Host */}
                    <td className="py-3 px-3 text-xs font-bold text-zinc-600 max-w-[120px] truncate">
                      {row.hostName ?? row.hostEmail ?? "—"}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="text-xs font-black uppercase text-zinc-500">
                        {row.gameType}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-1 text-xs font-black uppercase border border-black"
                        style={{ backgroundColor: statusColor, color: "#fff" }}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Players */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-zinc-400" />
                        <span className="text-sm font-black">{playerCount}</span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-3">
                      {row.status !== "lobby" && row.questionCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-zinc-200 border border-black">
                            <div
                              className="h-full bg-black"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-zinc-500">
                            {(row.currentQuestionIndex ?? -1) + 1}/{row.questionCount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="py-3 px-3 text-xs font-bold text-zinc-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString()}{" "}
                      {new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {row.status !== "ended" && !row.isSoloPractice && (
                          <form
                            action={async () => {
                              "use server";
                              await terminateSession(row.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="px-2 py-1 bg-red-500 text-white text-xs font-black border border-black hover:bg-red-600 transition-colors"
                              style={{ boxShadow: "1px 1px 0 #000" }}
                            >
                              End
                            </button>
                          </form>
                        )}
                        {row.status === "ended" && !row.isSoloPractice && (
                          <Link
                            href={`/teacher/sessions/${row.sessionCode}/analytics`}
                            className="px-2 py-1 bg-black text-yellow-400 text-xs font-black border border-black hover:bg-zinc-800 transition-colors flex items-center gap-1"
                            style={{ boxShadow: "1px 1px 0 #000" }}
                          >
                            <BarChart2 size={10} />
                            Stats
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-sm font-bold text-zinc-500 uppercase tracking-wide"
                  >
                    No game sessions yet.
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
