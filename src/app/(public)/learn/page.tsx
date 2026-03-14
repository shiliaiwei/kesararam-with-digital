import type { Metadata } from "next";
import { CategoryGrid } from "@/components/categories/category-grid";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Choose a learning format: flashcards, quizzes, infographics, practice tests, and more.",
};

export default function LearnPage() {
  return (
    <div className="min-h-screen dot-bg">
      <div className="bg-black text-white border-b-4 border-yellow-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-black tracking-widest uppercase bg-yellow-400 text-black px-3 py-1.5 rounded-lg">
            Study Hub
          </span>
          <h1 className="text-5xl font-black mt-3">Learn</h1>
          <p className="text-zinc-400 text-lg mt-2 max-w-xl">
            Choose a learning format and a knowledge category to begin studying.
          </p>
        </div>
      </div>

      {/* Learning modes */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {[
            { mode: "Flashcards", href: "/learn/flashcard", color: "#eab308" },
            { mode: "Quizzes", href: "/learn/quiz", color: "#22c55e" },
            { mode: "Practice Test", href: "/learn/test", color: "#3b82f6" },
            {
              mode: "Infographic",
              href: "/learn/infographic",
              color: "#a855f7",
            },
          ].map(({ mode, color }) => (
            <div
              key={mode}
              className="bg-white border-2 border-[#a8a8a8] rounded-3xl p-5 flex flex-col gap-2 shadow-[4px_4px_0_#000] cursor-pointer hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] transition-all"
            >
              <div
                className="w-10 h-10 border-2 border-[#a8a8a8] rounded-xl"
                style={{ backgroundColor: color }}
              />
              <span className="font-black text-sm">{mode}</span>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-black mb-6">Select a Category</h2>
      </div>

      <CategoryGrid />
    </div>
  );
}
