import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Live student rankings based on quiz scores and challenge sessions.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen dot-bg">
      <div
        className="border-b-4 border-black py-16"
        style={{ backgroundColor: "#eab308" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-black tracking-widest uppercase bg-black text-white px-3 py-1.5 rounded-lg">
            Leaderboard
          </span>
          <h1 className="text-5xl font-black text-black mt-3">Rankings</h1>
          <p className="text-black/70 text-lg mt-2">
            Top students by total points earned. Resets every 3 months.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top 3 podium */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12">
          {/* 2nd */}
          <div className="bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0_#3b82f6] p-6 flex flex-col items-center gap-2 w-full md:w-48 order-1 md:order-none">
            <div className="w-14 h-14 bg-zinc-200 border-2 border-black rounded-full flex items-center justify-center font-black text-xl">
              2
            </div>
            <span className="font-black text-sm text-center">—</span>
            <span className="text-xs text-zinc-500">Silver</span>
          </div>
          {/* 1st */}
          <div className="bg-yellow-400 border-2 border-black rounded-3xl shadow-[6px_6px_0_#ca8a04] p-8 flex flex-col items-center gap-2 w-full md:w-56 order-0 md:order-none">
            <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center font-black text-2xl">
              1
            </div>
            <span className="font-black text-center">—</span>
            <span className="text-xs font-bold">Gold Champion</span>
          </div>
          {/* 3rd */}
          <div className="bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0_#f97316] p-6 flex flex-col items-center gap-2 w-full md:w-48 order-2 md:order-none">
            <div className="w-14 h-14 bg-orange-100 border-2 border-black rounded-full flex items-center justify-center font-black text-xl">
              3
            </div>
            <span className="font-black text-sm text-center">—</span>
            <span className="text-xs text-zinc-500">Bronze</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0_#000] overflow-hidden">
          <div className="grid grid-cols-4 bg-yellow-400 border-b-2 border-black px-6 py-3 text-xs font-black tracking-wider text-black">
            <span>Rank</span>
            <span className="col-span-2">Student</span>
            <span className="text-right">Score</span>
          </div>
          {Array.from({ length: 7 }, (_, i) => i + 4).map((rank) => (
            <div
              key={rank}
              className="grid grid-cols-4 px-6 py-4 border-t border-zinc-100 text-sm font-medium hover:bg-zinc-50"
            >
              <span className="font-bold text-zinc-400">#{rank}</span>
              <span className="col-span-2 text-zinc-400 italic">—</span>
              <span className="text-right text-zinc-400">—</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Rankings update in real time. Scores from live challenge sessions are
          not included in this public ranking.
        </p>
      </div>
    </div>
  );
}
