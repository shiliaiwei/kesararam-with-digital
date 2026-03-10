import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Student Profile" };

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen dot-bg py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Profile card */}
        <div className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0_#000] overflow-hidden">
          <div className="h-3 bg-yellow-400 border-b-2 border-black" />
          <div className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-black border-2 border-black rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black">{session.name}</h1>
                <p className="text-sm text-zinc-500">{session.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 border border-green-500 rounded-lg text-xs font-bold text-green-700">
                  Student
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-black">
              {[
                { label: "Total Score", value: "—", color: "#eab308" },
                { label: "Challenges", value: "—", color: "#22c55e" },
                { label: "Current Rank", value: "—", color: "#3b82f6" },
                { label: "Flashcards Done", value: "—", color: "#a855f7" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0_#000]"
                >
                  <span className="text-2xl font-black" style={{ color }}>
                    {value}
                  </span>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
