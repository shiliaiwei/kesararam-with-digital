"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { Tv2, Play, Pause, Square, Clock, Zap, ExternalLink } from "lucide-react";

interface SessionRow {
    id: number;
    sessionCode: string;
    gameMode: string;
    category: string | null;
    status: string;
    questionIds: number[] | null;
    createdAt: string;
}

interface SessionsContentProps {
    sessions: SessionRow[];
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
}

const statusColor: Record<string, string> = {
    lobby: "#3b82f6", active: "#22c55e", paused: "#f97316", ended: "#6b7280",
};
const statusIcon: Record<string, typeof Play> = {
    lobby: Clock, active: Play, paused: Pause, ended: Square,
};

export function SessionsContent({ sessions, totalSessions, activeSessions, completedSessions }: SessionsContentProps) {
    const { lang } = useLang();
    const kh = lang === "kh";

    const stats = [
        { label: kh ? "វគ្គសរុប" : "Total Sessions", value: totalSessions, icon: Tv2, color: "#3b82f6" },
        { label: kh ? "សកម្ម / រង់ចាំ" : "Active / Lobby", value: activeSessions, icon: Play, color: "#22c55e" },
        { label: kh ? "បានបញ្ចប់" : "Completed", value: completedSessions, icon: Square, color: "#f97316" },
    ];

    const headers = kh
        ? ["កូដ", "រចនាប័ទ្ម", "ប្រភេទ", "ស្ថានភាព", "សំណួរ", "កាលបរិច្ឆេទ", ""]
        : ["Code", "Mode", "Category", "Status", "Questions", "Date", ""];

    return (
        <div className="space-y-6">
            <div className="border-b-4 border-black pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
                            <Tv2 size={24} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">
                                {kh ? "វគ្គផ្ទាល់" : "Sessions"}
                            </h1>
                            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                                {kh ? "វគ្គហ្គេមផ្ទាល់ដែលអ្នកបានបង្កើត" : "Live game sessions you have hosted"}
                            </p>
                        </div>
                    </div>
                    <Link href="/teacher/sessions/host"
                        className="flex items-center gap-2 px-4 py-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                        <Zap size={20} className="text-black" />
                        <span className="font-black text-sm uppercase text-black">
                            {kh ? "បង្កើតហ្គេមផ្ទាល់" : "Host Live Game"}
                        </span>
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
                    <h2 className="text-xl font-black uppercase tracking-tighter">
                        {kh ? "ប្រវត្តិវគ្គ" : "Session History"}
                    </h2>
                    <p className="text-sm font-bold text-black/70">
                        {sessions.length} {kh ? "វគ្គសរុប" : "sessions total"}
                    </p>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black">
                                {headers.map(h => (
                                    <th key={h} className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s) => {
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
                                        <td className="py-3 px-2">
                                            {(s.status === "lobby" || s.status === "active" || s.status === "paused") && (
                                                <Link
                                                    href="/teacher/sessions/host"
                                                    className="px-3 py-1.5 bg-yellow-400 border-2 border-black text-xs font-black hover:shadow-[2px_2px_0_#000] inline-flex items-center gap-1 transition-all"
                                                >
                                                    <ExternalLink size={11} /> {kh ? "ចូលម្ដងទៀត" : "Rejoin"}
                                                </Link>
                                            )}
                                            {s.status === "ended" && (
                                                <Link
                                                    href={`/teacher/sessions/${s.sessionCode}/analytics`}
                                                    className="px-3 py-1.5 bg-zinc-100 border-2 border-black text-xs font-black hover:shadow-[2px_2px_0_#000] inline-flex items-center gap-1 transition-all"
                                                >
                                                    <ExternalLink size={11} /> {kh ? "លទ្ធផល" : "Results"}
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-sm font-bold text-zinc-500 uppercase">
                                        {kh ? "មិនទាន់មានវគ្គទេ។ បង្កើតហ្គេមដំបូងរបស់អ្នក!" : "No sessions yet. Host your first game!"}
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
