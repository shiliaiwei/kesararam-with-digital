"use client";

import { ArrowLeft } from "lucide-react";
import { useLang } from "@/context/lang-context";

export interface CategoryHeroConfig {
    /** Tailwind bg class for the hero band */
    heroBg: string;
    /** Tailwind text class for the main title */
    titleColor: string;
    /** Tailwind text class for the Khmer subtitle */
    subtitleColor: string;
    /** Tailwind text class for the description */
    descColor: string;
    /** Tailwind border class for the icon box shadow */
    iconShadow: string;
    /** Tailwind bg class for the active pill */
    pillActiveBg: string;
    /** Tailwind text class for the active pill */
    pillActiveText: string;
    /** Tailwind bg class for the active pill count badge */
    pillBadgeBg: string;
    /** Tailwind text class for the active pill count badge */
    pillBadgeText: string;
    /** Tailwind hover bg for inactive pills */
    pillHoverBg: string;
    /** SVG icon rendered inside the white box */
    icon: React.ReactNode;
    /** Emoji shown on mobile next to the category label */
    emoji: string;
}

interface CategoryHeroProps {
    config: CategoryHeroConfig;
    titleEn: string;
    titleKm: string;
    descEn: string;
    descKm: string;
    totalCount: number;
    filteredCount: number;
    /** e.g. "questions" / "signs" / "scenarios" */
    itemLabelEn: string;
    itemLabelKm: string;
    onBack: () => void;
}

export function CategoryHero({
    config,
    titleEn,
    titleKm,
    descEn,
    descKm,
    totalCount,
    filteredCount,
    itemLabelEn,
    itemLabelKm,
    onBack,
}: CategoryHeroProps) {
    const { lang } = useLang();
    const isKh = lang === "kh";
    const kf = isKh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};

    const title = isKh ? titleKm : titleEn;
    const titleAlt = isKh ? titleEn : titleKm;
    const desc = isKh ? descKm : descEn;
    const itemLabel = isKh ? itemLabelKm : itemLabelEn;

    // Progress: how many of total are shown
    const pct = totalCount > 0 ? Math.round((filteredCount / totalCount) * 100) : 0;

    return (
        <div className={`${config.heroBg} border-b-4 border-black`} style={{ boxShadow: "0 4px 0 #000" }}>
            <div className="max-w-4xl mx-auto px-4 pt-5 pb-8 md:pt-8 md:pb-10">

                {/* ── Row 1: Back button ── */}
                <button
                    onClick={onBack}
                    className="mb-5 inline-flex items-center gap-2 bg-white/90 hover:bg-white border-2 border-black px-3 py-1.5 font-bold text-xs transition-all hover:shadow-[2px_2px_0_#000]"
                    style={kf}
                >
                    <ArrowLeft size={14} />
                    {isKh ? "ត្រឡប់ទៅប្រភេទ" : "Back to Categories"}
                </button>

                {/* ── Row 2: Main content + icon ── */}
                <div className="flex items-start justify-between gap-6">

                    {/* Left: text */}
                    <div className="flex-1 min-w-0">

                        {/* Category label pill */}
                        <div className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 mb-3" style={kf}>
                            <span>{config.emoji}</span>
                            {isKh ? "ប្រភេទចំណេះដឹង" : "KNOWLEDGE CATEGORY"}
                        </div>

                        {/* Main title — largest element, first eye stop */}
                        <h1
                            className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-1 ${config.titleColor}`}
                            style={kf}
                        >
                            {title}
                        </h1>

                        {/* Alt-language subtitle — secondary, smaller */}
                        <p className={`text-base md:text-lg font-bold mb-3 ${config.subtitleColor}`} style={kf}>
                            {titleAlt}
                        </p>

                        {/* Description — tertiary, readable */}
                        <p className={`text-sm md:text-base leading-relaxed max-w-xl mb-5 ${config.descColor}`} style={kf}>
                            {desc}
                        </p>

                        {/* ── Progress bar + count — instant cognitive anchor ── */}
                        <div className="flex items-center gap-3">
                            {/* Count badge */}
                            <div className="bg-white/90 border-2 border-black px-3 py-1.5 flex items-center gap-2 shrink-0">
                                <span className="text-xl font-black text-black leading-none">{filteredCount}</span>
                                <span className="text-[10px] font-bold text-zinc-500 leading-tight" style={kf}>
                                    {isKh ? "នៃ" : "of"}<br />{totalCount} {itemLabel}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="flex-1 h-3 bg-black/20 border border-black/30 overflow-hidden rounded-sm">
                                <div
                                    className="h-full bg-white transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            {/* Percent */}
                            <span className="text-xs font-black text-black/70 shrink-0">{pct}%</span>
                        </div>
                    </div>

                    {/* Right: icon box — visual anchor, hidden on small screens */}
                    <div className="hidden sm:flex flex-shrink-0">
                        <div
                            className="w-28 h-28 md:w-36 md:h-36 bg-white border-4 border-black flex items-center justify-center"
                            style={{ boxShadow: `6px 6px 0 #000` }}
                        >
                            {config.icon}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
