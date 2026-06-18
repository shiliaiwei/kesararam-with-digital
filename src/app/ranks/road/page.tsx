import * as React from "react";
import type { Metadata } from "next";
import { RoadAvatarBorder } from "@/components/rank/RoadAvatarBorder";
import { GoldAvatarBorder } from "@/components/rank/GoldAvatarBorder";
import { PlatinumAvatarBorder } from "@/components/rank/PlatinumAvatarBorder";
import { RoadBorderSandbox } from "@/components/rank/RoadBorderSandbox";

export const metadata: Metadata = {
    title: "KWD Road Avatar Border — Rookie, Rising, Gold & Platinum",
    description: "Premium skeuomorphic road-safety avatar borders for Rookie, Rising, Gold, and Platinum ranks.",
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
                        Rookie (Yellow), Rising (Green), Gold (Diamond) &amp; Platinum (Shield) — Premium Road-Safety Frames
                    </p>
                </div>
            </header>

            {/* Static Rank Showcase */}
            <section className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="grid gap-8 sm:grid-cols-4">
                    <div className="flex flex-col items-center gap-3 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                        <RoadAvatarBorder src={null} alt="Rookie example" username="Sophea" score={120} size="lg" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Rookie · 120 pts · IV</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                        <RoadAvatarBorder src={null} alt="Rising example" username="Dara" score={1100} size="lg" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Rising · 1,100 pts · IV</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                        <GoldAvatarBorder src={null} alt="Gold example" username="Bopha" size="lg" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Gold · 2,500 pts · IV</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                        <PlatinumAvatarBorder src={null} alt="Platinum example" username="Kosal" size="lg" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Platinum · 3,500 pts · IV</span>
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
