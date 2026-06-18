import * as React from "react";
import type { Metadata } from "next";
import { RoadAvatarBorder } from "@/components/rank/RoadAvatarBorder";
import { RoadBorderSandbox } from "@/components/rank/RoadBorderSandbox";

export const metadata: Metadata = {
    title: "KWD Road Avatar Border — Rookie & Rising",
    description: "Premium skeuomorphic road-safety avatar border for the Rookie and Rising ranks.",
};

export default function RoadBorderPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <header className="border-b-2 border-black bg-white">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 text-center">
                    <div className="mb-3 inline-block border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase tracking-widest text-[#eab308]">
                        Kesararam With Digital
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
                        Road Avatar Border
                    </h1>
                    <p className="mt-2 text-sm font-bold uppercase tracking-wider text-zinc-600">
                        Rookie (yellow) &amp; Rising (green) — same frame, premium color swap
                    </p>
                </div>
            </header>

            {/* Static Rookie vs Rising comparison */}
            <section className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="grid gap-8 sm:grid-cols-2">
                    <div className="flex flex-col items-center gap-3 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                        <RoadAvatarBorder src={null} alt="Rookie example" username="Sophea" score={120} size="lg" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Rookie · 120 pts · IV</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                        <RoadAvatarBorder src={null} alt="Rising example" username="Dara" score={1100} size="lg" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Rising · 1,100 pts · IV</span>
                    </div>
                </div>
            </section>

            {/* Interactive sandbox */}
            <section className="mx-auto w-full max-w-6xl px-4 pb-16">
                <h2 className="mb-5 text-xl font-black uppercase tracking-wide">Sandbox — slide the score</h2>
                <RoadBorderSandbox />
            </section>
        </main>
    );
}
