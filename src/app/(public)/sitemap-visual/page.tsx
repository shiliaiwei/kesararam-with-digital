"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import {
    Home, BookOpen, Gamepad2, Trophy, Bot, Info,
    GraduationCap, FileText,
    ChevronDown, Globe, CircleUser, Sparkles, Palette, Wrench,
    ScrollText, Lock, UserPlus, LogIn,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   BILINGUAL LABEL
─────────────────────────────────────────────────────────── */
type BL = { en: string; kh: string };

interface RouteNode {
    path: string;
    label: BL;
    icon?: LucideIcon;
    priority?: number;
    live?: boolean;          // is it a real visitable page
    dynamic?: boolean;       // dynamic segment (no direct link)
    children?: RouteNode[];
}

interface DomainGroup {
    id: string;
    domain: string;
    label: BL;
    desc: BL;
    icon: LucideIcon;
    routes: RouteNode[];
}

/* ──────────────────────────────────────────────────────────
   REAL PROJECT STRUCTURE  (studied from src/app)
─────────────────────────────────────────────────────────── */
const SITEMAP: DomainGroup[] = [
    {
        id: "public",
        domain: "kesararamwithdigital.tech",
        icon: Globe,
        label: { en: "Public Site", kh: "គេហទំព័រសាធារណៈ" },
        desc: {
            en: "Root — public site, knowledge categories, learning, leaderboard",
            kh: "ទំព័រសាធារណៈ — ប្រភេទចំណេះដឹង ការរៀន តារាងចំណាត់ថ្នាក់",
        },
        routes: [
            { path: "/", label: { en: "Home", kh: "ទំព័រដើម" }, icon: Home, priority: 1.0, live: true },
            {
                path: "/learn",
                label: { en: "Learn", kh: "រៀន" },
                icon: BookOpen,
                priority: 0.8,
                live: true,
                children: [
                    { path: "/learn/road-sign", label: { en: "Road Signs", kh: "សញ្ញាចរាចរណ៍" }, live: true },
                    { path: "/learn/road-traffic", label: { en: "Road Traffic", kh: "ចរាចរណ៍ផ្លូវ" }, live: true },
                    { path: "/learn/priority", label: { en: "Priority Rules", kh: "បទប្បញ្ញត្តិអាទិភាព" }, live: true },
                    { path: "/learn/driving", label: { en: "Driving", kh: "ការបើកបរ" }, live: true },
                    { path: "/learn/technical", label: { en: "Technical", kh: "បច្ចេកទេស" }, live: true },
                    { path: "/learn/loading-people-goods", label: { en: "Loading People & Goods", kh: "ផ្ទុកមនុស្ស និងទំនិញ" }, live: true },
                    { path: "/learn/general-knowledge", label: { en: "General Knowledge", kh: "ចំណេះដឹងទូទៅ" }, live: true },
                    { path: "/learn/emergency", label: { en: "Emergency", kh: "អាសន្ន" }, live: true },
                ],
            },
            {
                path: "/play",
                label: { en: "Play", kh: "លេង" },
                icon: Gamepad2,
                priority: 0.8,
                live: true,
                children: [
                    { path: "/play/solo", label: { en: "Solo Mode", kh: "ម៉ូដតែឯង" }, live: true },
                    { path: "/play/category-quiz", label: { en: "Category Quiz", kh: "កម្រងសំណួរតាមប្រភេទ" }, live: true },
                    { path: "/play/[code]", label: { en: "Live Game (by code)", kh: "ហ្គេមផ្ទាល់ (តាមកូដ)" }, dynamic: true },
                ],
            },
            { path: "/leaderboard", label: { en: "Leaderboard", kh: "តារាងចំណាត់ថ្នាក់" }, icon: Trophy, priority: 0.6, live: true },
            { path: "/suar/ai", label: { en: "Suar AI", kh: "សួរ AI" }, icon: Bot, priority: 0.6, live: true },
            {
                path: "/about",
                label: { en: "About", kh: "អំពីយើង" },
                icon: Info,
                priority: 0.5,
                live: true,
                children: [
                    { path: "/team", label: { en: "Team", kh: "ក្រុមការងារ" }, live: true },
                    { path: "/built-with", label: { en: "Built With", kh: "បង្កើតដោយ" }, icon: Wrench, live: true },
                    { path: "/brand", label: { en: "Brand", kh: "ម៉ាកយីហោ" }, icon: Palette, live: true },
                ],
            },
            { path: "/pricing", label: { en: "Pricing", kh: "តម្លៃ" }, icon: GraduationCap, priority: 0.5, live: true },
            {
                path: "/profile/student",
                label: { en: "Student Profile", kh: "ទម្រង់សិស្ស" },
                icon: CircleUser,
                priority: 0.4,
                live: true,
                children: [
                    { path: "/u/[username]", label: { en: "Public Profile (by username)", kh: "ទម្រង់សាធារណៈ (តាមឈ្មោះ)" }, dynamic: true },
                ],
            },
            {
                path: "/login",
                label: { en: "Authentication", kh: "ការផ្ទៀងផ្ទាត់" },
                icon: LogIn,
                priority: 0.4,
                live: true,
                children: [
                    { path: "/register", label: { en: "Register", kh: "ចុះឈ្មោះ" }, icon: UserPlus, live: true },
                    { path: "/team/[token]", label: { en: "Team Invite (by token)", kh: "អញ្ជើញចូលក្រុម (តាមថូខឹន)" }, dynamic: true },
                ],
            },
            {
                path: "/terms",
                label: { en: "Legal", kh: "ផ្លូវច្បាប់" },
                icon: ScrollText,
                priority: 0.3,
                live: true,
                children: [
                    { path: "/privacy", label: { en: "Privacy Policy", kh: "គោលការណ៍ឯកជនភាព" }, icon: Lock, live: true },
                ],
            },
        ],
    },
];

/* aggregate static numbers */
function countRoutes(group: DomainGroup) {
    let main = group.routes.length;
    let sub = 0;
    let live = 0;
    group.routes.forEach((r) => {
        if (r.live) live++;
        if (r.children) {
            sub += r.children.length;
            r.children.forEach((c) => { if (c.live) live++; });
        }
    });
    return { main, sub, total: main + sub, live };
}

/* ──────────────────────────────────────────────────────────
   HUD CALLOUT BAR  — corner-cut, connector dot, black/white
─────────────────────────────────────────────────────────── */
function CalloutLabel({ text, index }: { text: string; index: number }) {
    return (
        <div className="flex items-center gap-0 select-none">
            {/* connector dot */}
            <span className="relative flex items-center">
                <span className="block w-3 h-3 border-2 border-black rounded-full bg-white" />
                <span className="block h-[2px] w-4 bg-black" />
            </span>
            {/* angled label */}
            <span
                className="bg-black text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-3 py-1"
                style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
                {text}
            </span>
            <span className="text-[10px] font-mono text-black/40 ml-2">[{String(index).padStart(2, "0")}]</span>
        </div>
    );
}

/* The corner-cut HUD frame used by every node */
function HudFrame({
    children,
    filled = false,
    className = "",
}: {
    children: React.ReactNode;
    filled?: boolean;
    className?: string;
}) {
    return (
        <div
            className={`relative border-2 border-black ${filled ? "bg-black text-white" : "bg-white text-black"} ${className}`}
            style={{
                clipPath:
                    "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
        >
            {children}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   ROUTE CARD (with movie-style dropdown)
─────────────────────────────────────────────────────────── */
function RouteCard({
    node,
    kh,
    openMap,
    toggle,
    idx,
}: {
    node: RouteNode;
    kh: boolean;
    openMap: Record<string, boolean>;
    toggle: (p: string) => void;
    idx: number;
}) {
    const Icon = node.icon ?? FileText;
    const hasChildren = !!node.children?.length;
    const isOpen = openMap[node.path];
    const label = kh ? node.label.kh : node.label.en;

    const TitleContent = (
        <div className="flex items-center gap-3 sm:gap-4 w-full">
            {/* icon block */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black bg-white flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-black" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-black truncate">
                        {label}
                    </h3>
                    {node.live && (
                        <span className="text-[8px] font-black uppercase tracking-widest border border-black px-1.5 py-0.5 bg-white text-black">
                            LIVE
                        </span>
                    )}
                    {node.dynamic && (
                        <span className="text-[8px] font-black uppercase tracking-widest border border-black px-1.5 py-0.5 bg-black text-white">
                            DYNAMIC
                        </span>
                    )}
                </div>
                <code className="text-[11px] sm:text-xs font-mono text-black/60 block truncate">
                    {node.path}
                </code>
            </div>

            {/* priority meter */}
            {node.priority !== undefined && (
                <div className="hidden md:flex items-center gap-2 flex-shrink-0 w-40">
                    <span className="text-[9px] font-mono uppercase text-black/40">
                        {kh ? "អាទិភាព" : "PRIO"}
                    </span>
                    <div className="flex-1 h-1.5 border border-black bg-white">
                        <div className="h-full bg-black" style={{ width: `${node.priority * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-black">{node.priority.toFixed(1)}</span>
                </div>
            )}

            {/* expand control */}
            {hasChildren && (
                <ChevronDown
                    size={20}
                    className={`text-black flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            )}
        </div>
    );

    return (
        <div>
            {/* Main row */}
            <HudFrame className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]">
                {hasChildren ? (
                    <button onClick={() => toggle(node.path)} className="w-full text-left p-3 sm:p-4">
                        {TitleContent}
                    </button>
                ) : node.live ? (
                    <Link href={node.path} className="block p-3 sm:p-4">
                        {TitleContent}
                    </Link>
                ) : (
                    <div className="p-3 sm:p-4 opacity-90">{TitleContent}</div>
                )}
            </HudFrame>

            {/* Children — movie-style drop animation */}
            {hasChildren && (
                <div
                    className="grid transition-all duration-300 ease-out"
                    style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        opacity: isOpen ? 1 : 0,
                    }}
                >
                    <div className="overflow-hidden">
                        <div className="ml-5 sm:ml-9 mt-2 pl-4 sm:pl-6 border-l-2 border-black/30 space-y-2 pb-2">
                            {node.children!.map((child, ci) => {
                                const cLabel = kh ? child.label.kh : child.label.en;
                                const CIcon = child.icon ?? FileText;
                                const inner = (
                                    <div
                                        className="flex items-center gap-3 p-2.5 sm:p-3 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors duration-150 group"
                                        style={{
                                            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
                                            animationDelay: `${ci * 40}ms`,
                                        }}
                                    >
                                        <CIcon size={15} className="flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide truncate">
                                                    {cLabel}
                                                </span>
                                                {child.dynamic && (
                                                    <span className="text-[7px] font-black uppercase tracking-widest border border-current px-1 py-0.5">
                                                        DYN
                                                    </span>
                                                )}
                                            </div>
                                            <code className="text-[10px] font-mono opacity-60 block truncate">{child.path}</code>
                                        </div>
                                    </div>
                                );
                                return (
                                    <div
                                        key={child.path}
                                        className={isOpen ? "animate-in fade-in slide-in-from-left-2 duration-300" : ""}
                                        style={{ animationDelay: `${ci * 50}ms`, animationFillMode: "both" }}
                                    >
                                        {child.live ? (
                                            <Link href={child.path}>{inner}</Link>
                                        ) : (
                                            inner
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   PAGE
─────────────────────────────────────────────────────────── */
export default function SitemapVisualPage() {
    const { lang, setLang } = useLang();
    const kh = lang === "kh";

    const [activeDomain] = useState("public");
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

    const group = SITEMAP.find((g) => g.id === activeDomain)!;
    const stats = countRoutes(group);

    const toggle = (p: string) => setOpenMap((m) => ({ ...m, [p]: !m[p] }));

    const expandAll = () => {
        const all: Record<string, boolean> = {};
        group.routes.forEach((r) => { if (r.children) all[r.path] = true; });
        setOpenMap(all);
    };
    const collapseAll = () => setOpenMap({});

    return (
        <div className="min-h-screen bg-white text-black">
            {/* ── HUD top bar ── */}
            <div className="border-b-2 border-black bg-white sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    {/* title row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="w-9 h-9 sm:w-11 sm:h-11 bg-black text-white flex items-center justify-center flex-shrink-0"
                                style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)" }}
                            >
                                <Sparkles size={20} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-black uppercase tracking-[0.15em] leading-none">
                                    {kh ? "ផែនទីគេហទំព័រ" : "SITEMAP"}
                                </h1>
                                <p className="text-[10px] sm:text-xs font-mono text-black/50 mt-1 truncate">
                                    {kh ? "រចនាសម្ព័ន្ធប្រព័ន្ធ // KWD" : "SYSTEM ARCHITECTURE // KWD"}
                                </p>
                            </div>
                        </div>

                        {/* lang switch — single button toggles */}
                        <button
                            onClick={() => setLang(kh ? "en" : "kh")}
                            className="flex items-center gap-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors px-3 py-1.5 flex-shrink-0"
                            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
                            aria-label="Toggle language"
                        >
                            <Globe size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">
                                {kh ? "EN" : "ខ្មែរ"}
                            </span>
                        </button>
                    </div>

                    {/* domain indicator (single public domain only) */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            className="flex items-center gap-2 px-3 py-2 border-2 border-black text-[11px] sm:text-xs font-bold bg-black text-white"
                            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" }}
                        >
                            <group.icon size={14} />
                            <span className="font-mono truncate max-w-[200px] sm:max-w-none">{group.domain}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── body ── */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* domain hero callout */}
                <div>
                    <CalloutLabel text={kh ? "ដែន" : "DOMAIN"} index={0} />
                    <HudFrame filled className="mt-3 p-5 sm:p-7">
                        <div className="flex items-start gap-4">
                            <group.icon size={32} className="flex-shrink-0 mt-1" />
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-3xl font-black uppercase tracking-wide mb-1 break-words">
                                    {kh ? group.label.kh : group.label.en}
                                </h2>
                                <code className="text-[11px] sm:text-sm font-mono text-white/60 block mb-2 break-all">
                                    {group.domain}
                                </code>
                                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                                    {kh ? group.desc.kh : group.desc.en}
                                </p>
                            </div>
                        </div>
                    </HudFrame>
                </div>

                {/* stats row */}
                <div>
                    <CalloutLabel text={kh ? "ស្ថិតិ" : "STATISTICS"} index={1} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        {[
                            { v: stats.main, l: kh ? "ផ្លូវចម្បង" : "Main Routes" },
                            { v: stats.sub, l: kh ? "ផ្លូវរង" : "Sub Routes" },
                            { v: stats.total, l: kh ? "សរុប" : "Total Pages" },
                            { v: stats.live, l: kh ? "ដំណើរការ" : "Live Pages" },
                        ].map((s, i) => (
                            <HudFrame key={i} className="p-4">
                                <div className="text-2xl sm:text-4xl font-black font-mono leading-none mb-2">
                                    {String(s.v).padStart(2, "0")}
                                </div>
                                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    {s.l}
                                </div>
                            </HudFrame>
                        ))}
                    </div>
                </div>

                {/* tree */}
                <div>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <CalloutLabel text={kh ? "រចនាសម្ព័ន្ធ" : "STRUCTURE"} index={2} />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={expandAll}
                                className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 bg-white hover:bg-black hover:text-white transition-colors"
                            >
                                {kh ? "បើកទាំងអស់" : "Expand All"}
                            </button>
                            <button
                                onClick={collapseAll}
                                className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 bg-white hover:bg-black hover:text-white transition-colors"
                            >
                                {kh ? "បិទទាំងអស់" : "Collapse"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {group.routes.map((node, i) => (
                            <RouteCard
                                key={node.path}
                                node={node}
                                kh={kh}
                                openMap={openMap}
                                toggle={toggle}
                                idx={i + 1}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* footer */}
            <footer className="border-t-2 border-black mt-12 py-6 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/50">
                        {kh ? "កេសារារាម វិត ឌីជីថល • ផែនទីប្រព័ន្ធ v2.0" : "KESARARAM WITH DIGITAL • SYSTEM MAP v2.0"}
                    </span>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                    >
                        <Home size={13} />
                        {kh ? "ត្រឡប់ទៅដើម" : "Back Home"}
                    </Link>
                </div>
            </footer>
        </div>
    );
}
