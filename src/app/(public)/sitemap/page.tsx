"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";

/* ──────────────────────────────────────────────────────────
   BILINGUAL LABEL + TYPES
─────────────────────────────────────────────────────────── */
type BL = { en: string; kh: string };

interface RouteNode {
    path: string;
    label: BL;
    priority?: number;
    live?: boolean;     // a real visitable page
    dynamic?: boolean;  // dynamic segment (no direct link)
    children?: RouteNode[];
}

interface DomainGroup {
    id: string;
    domain: string;
    label: BL;
    desc: BL;
    routes: RouteNode[];
}

type ViewMode = "tree" | "table" | "flow";

/* ──────────────────────────────────────────────────────────
   REAL PROJECT STRUCTURE  (studied from src/app)
─────────────────────────────────────────────────────────── */
const SITEMAP: DomainGroup[] = [
    {
        id: "public",
        domain: "kesararamwithdigital.tech",
        label: { en: "Public Site", kh: "គេហទំព័រសាធារណៈ" },
        desc: {
            en: "Root — public site, knowledge categories, learning, leaderboard",
            kh: "ទំព័រសាធារណៈ — ប្រភេទចំណេះដឹង ការរៀន តារាងចំណាត់ថ្នាក់",
        },
        routes: [
            { path: "/", label: { en: "Home", kh: "ទំព័រដើម" }, priority: 1.0, live: true },
            {
                path: "/learn",
                label: { en: "Learn", kh: "រៀន" },
                priority: 0.8,
                live: true,
                children: [
                    { path: "/learn/road-sign", label: { en: "Road Signs", kh: "សញ្ញាចរាចរណ៍" }, live: true },
                    { path: "/learn/road-traffic", label: { en: "Road Traffic", kh: "ចរាចរណ៍ផ្លូវ" }, live: true },
                    { path: "/learn/priority", label: { en: "Priority Rules", kh: "បទប្បញ្ញត្តិអាទិភាព" }, live: true },
                    { path: "/learn/driving", label: { en: "Road Safety", kh: "សុវត្ថិភាពចរាចរណ៍" }, live: true },
                    { path: "/learn/technical", label: { en: "Technical", kh: "បច្ចេកទេស" }, live: true },
                    { path: "/learn/loading-people-goods", label: { en: "Loading People & Goods", kh: "ផ្ទុកមនុស្ស និងទំនិញ" }, live: true },
                    { path: "/learn/general-knowledge", label: { en: "General Knowledge", kh: "ចំណេះដឹងទូទៅ" }, live: true },
                    { path: "/learn/emergency", label: { en: "Emergency", kh: "អាសន្ន" }, live: true },
                ],
            },
            {
                path: "/play",
                label: { en: "Play", kh: "លេង" },
                priority: 0.8,
                live: true,
                children: [
                    { path: "/play/solo", label: { en: "Solo Mode", kh: "ម៉ូដតែឯង" }, live: true },
                    { path: "/play/category-quiz", label: { en: "Category Quiz", kh: "កម្រងសំណួរតាមប្រភេទ" }, live: true },
                    { path: "/play/priority-puzzle", label: { en: "Who Goes First?", kh: "តើអ្នកណាទៅមុន?" }, live: true },
                    { path: "/play/sign-match", label: { en: "Sign Match", kh: "ផ្គូផ្គងសញ្ញា" }, live: true },
                    { path: "/play/catch-sign", label: { en: "Catch the Sign", kh: "ចាប់សញ្ញា" }, live: true },
                    { path: "/play/light-hero", label: { en: "Traffic Light Hero", kh: "បញ្ញាបរភ្លើងសញ្ញា" }, live: true },
                    { path: "/play/safety-adventure", label: { en: "Road Safety Adventure", kh: "ដំណើរសុវត្ថិភាព" }, live: true },
                    { path: "/play/[code]", label: { en: "Live Game (by code)", kh: "ហ្គេមផ្ទាល់ (តាមកូដ)" }, dynamic: true },
                ],
            },
            { path: "/leaderboard", label: { en: "Leaderboard", kh: "តារាងចំណាត់ថ្នាក់" }, priority: 0.6, live: true },
            { path: "/suar/ai", label: { en: "Suar AI", kh: "សួរ AI" }, priority: 0.6, live: true },
            {
                path: "/about",
                label: { en: "About", kh: "អំពីយើង" },
                priority: 0.5,
                live: true,
                children: [
                    { path: "/team", label: { en: "Team", kh: "ក្រុមការងារ" }, live: true },
                    { path: "/built-with", label: { en: "Built With", kh: "បង្កើតដោយ" }, live: true },
                    { path: "/brand", label: { en: "Brand", kh: "ម៉ាកយីហោ" }, live: true },
                ],
            },
            { path: "/pricing", label: { en: "Pricing", kh: "តម្លៃ" }, priority: 0.5, live: true },
            {
                path: "/profile/student",
                label: { en: "Student Profile", kh: "ទម្រង់សិស្ស" },
                priority: 0.4,
                live: true,
                children: [
                    { path: "/u/[username]", label: { en: "Public Profile (by username)", kh: "ទម្រង់សាធារណៈ (តាមឈ្មោះ)" }, dynamic: true },
                ],
            },
            {
                path: "/login",
                label: { en: "Authentication", kh: "ការផ្ទៀងផ្ទាត់" },
                priority: 0.4,
                live: true,
                children: [
                    { path: "/register", label: { en: "Register", kh: "ចុះឈ្មោះ" }, live: true },
                    { path: "/team/[token]", label: { en: "Team Invite (by token)", kh: "អញ្ជើញចូលក្រុម (តាមថូខឹន)" }, dynamic: true },
                ],
            },
            {
                path: "/terms",
                label: { en: "Legal", kh: "ផ្លូវច្បាប់" },
                priority: 0.3,
                live: true,
                children: [
                    { path: "/privacy", label: { en: "Privacy Policy", kh: "គោលការណ៍ឯកជនភាព" }, live: true },
                ],
            },
        ],
    },
];

/* ──────────────────────────────────────────────────────────
   STATS
─────────────────────────────────────────────────────────── */
function countRoutes(group: DomainGroup) {
    const main = group.routes.length;
    let sub = 0;
    let live = 0;
    let dynamic = 0;
    group.routes.forEach((r) => {
        if (r.live) live++;
        if (r.dynamic) dynamic++;
        if (r.children) {
            sub += r.children.length;
            r.children.forEach((c) => {
                if (c.live) live++;
                if (c.dynamic) dynamic++;
            });
        }
    });
    return { main, sub, total: main + sub, live, dynamic };
}

/* Flatten the tree into rows for the table view. */
function flattenRoutes(group: DomainGroup) {
    const rows: { node: RouteNode; depth: number; parent: string | null }[] = [];
    group.routes.forEach((r) => {
        rows.push({ node: r, depth: 0, parent: null });
        r.children?.forEach((c) => rows.push({ node: c, depth: 1, parent: r.path }));
    });
    return rows;
}

/* KWD brand palette — used ONLY as small accent rules, never as fills. */
const ACCENT = "#eab308"; // brand yellow

/* ──────────────────────────────────────────────────────────
   STATUS TAG — text only, no icon, no fill
─────────────────────────────────────────────────────────── */
function Tag({ kind, kh }: { kind: "live" | "dynamic"; kh: boolean }) {
    const label =
        kind === "live"
            ? kh ? "ដំណើរការ" : "LIVE"
            : kh ? "ថាមវន្ត" : "DYNAMIC";
    return (
        <span
            className="text-[9px] font-bold uppercase tracking-widest border border-black px-1.5 py-0.5 text-black"
            style={{ borderColor: kind === "dynamic" ? ACCENT : "#000" }}
        >
            {label}
        </span>
    );
}

/* ──────────────────────────────────────────────────────────
   TREE VIEW — indented label list, brand-yellow connector rules
─────────────────────────────────────────────────────────── */
function TreeView({ group, kh }: { group: DomainGroup; kh: boolean }) {
    return (
        <div className="border-2 border-black">
            {group.routes.map((r, i) => {
                const label = kh ? r.label.kh : r.label.en;
                return (
                    <div key={r.path} className={i > 0 ? "border-t-2 border-black" : ""}>
                        {/* parent row */}
                        <div className="flex items-baseline gap-2 px-3 sm:px-4 py-3 flex-wrap">
                            <span className="text-base sm:text-lg font-bold text-black">{label}</span>
                            <code className="text-[11px] sm:text-xs font-mono text-black/55">{r.path}</code>
                            {r.live && <Tag kind="live" kh={kh} />}
                            {r.dynamic && <Tag kind="dynamic" kh={kh} />}
                            {r.priority !== undefined && (
                                <span className="text-[10px] font-mono text-black/40 ml-auto">
                                    {kh ? "អាទិភាព" : "prio"} {r.priority.toFixed(1)}
                                </span>
                            )}
                        </div>
                        {/* children */}
                        {r.children && (
                            <div
                                className="ml-4 sm:ml-6 pl-3 sm:pl-4 pb-2"
                                style={{ borderLeft: `3px solid ${ACCENT}` }}
                            >
                                {r.children.map((c) => {
                                    const cLabel = kh ? c.label.kh : c.label.en;
                                    const inner = (
                                        <div className="flex items-baseline gap-2 py-2 flex-wrap">
                                            <span className="text-black/40">—</span>
                                            <span className="text-sm sm:text-base font-medium text-black">{cLabel}</span>
                                            <code className="text-[10px] sm:text-[11px] font-mono text-black/50">{c.path}</code>
                                            {c.live && <Tag kind="live" kh={kh} />}
                                            {c.dynamic && <Tag kind="dynamic" kh={kh} />}
                                        </div>
                                    );
                                    return c.live ? (
                                        <Link key={c.path} href={c.path} className="block hover:bg-black/[0.03]">
                                            {inner}
                                        </Link>
                                    ) : (
                                        <div key={c.path}>{inner}</div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   TABLE VIEW — Information Architecture as a data table
─────────────────────────────────────────────────────────── */
function TableView({ group, kh }: { group: DomainGroup; kh: boolean }) {
    const rows = flattenRoutes(group);
    return (
        <div className="border-2 border-black overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black">
                            {kh ? "ទំព័រ" : "Page"}
                        </th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black">
                            {kh ? "ផ្លូវ (URL)" : "Path"}
                        </th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black hidden sm:table-cell">
                            {kh ? "កម្រិត" : "Level"}
                        </th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black">
                            {kh ? "ស្ថានភាព" : "Status"}
                        </th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black hidden md:table-cell">
                            {kh ? "អាទិភាព" : "Priority"}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ node, depth }, i) => {
                        const label = kh ? node.label.kh : node.label.en;
                        return (
                            <tr
                                key={node.path}
                                className={i > 0 ? "border-t border-black/20" : ""}
                                style={depth > 0 ? { borderLeft: `3px solid ${ACCENT}` } : undefined}
                            >
                                <td className="px-3 py-2.5 align-top">
                                    <span
                                        className={`text-black ${depth > 0 ? "text-sm font-medium" : "text-sm sm:text-base font-bold"}`}
                                        style={{ paddingLeft: depth * 14 }}
                                    >
                                        {depth > 0 && <span className="text-black/40 mr-1">—</span>}
                                        {label}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    <code className="text-[10px] sm:text-xs font-mono text-black/65">{node.path}</code>
                                </td>
                                <td className="px-3 py-2.5 align-top hidden sm:table-cell">
                                    <span className="text-xs font-mono text-black/60">
                                        {depth === 0 ? (kh ? "ចម្បង" : "Main") : (kh ? "រង" : "Sub")}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                    <div className="flex gap-1 flex-wrap">
                                        {node.live && <Tag kind="live" kh={kh} />}
                                        {node.dynamic && <Tag kind="dynamic" kh={kh} />}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 align-top hidden md:table-cell">
                                    <span className="text-xs font-mono text-black/60">
                                        {node.priority !== undefined ? node.priority.toFixed(1) : "—"}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   FLOWCHART VIEW — root → branches → leaves, connector lines
   Pure CSS boxes + brand-yellow connectors. No icons, no fills.
─────────────────────────────────────────────────────────── */
function FlowNode({ label, path, accent }: { label: string; path?: string; accent?: boolean }) {
    return (
        <div
            className="inline-flex flex-col items-center border-2 border-black bg-white px-3 py-2 text-center"
            style={accent ? { boxShadow: `4px 4px 0 ${ACCENT}` } : undefined}
        >
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap">{label}</span>
            {path && <code className="text-[9px] font-mono text-black/50">{path}</code>}
        </div>
    );
}

function FlowView({ group, kh }: { group: DomainGroup; kh: boolean }) {
    return (
        <div className="border-2 border-black p-4 sm:p-6 overflow-x-auto">
            <div className="flex flex-col items-center min-w-[640px]">
                {/* root */}
                <FlowNode label={kh ? group.label.kh : group.label.en} path={group.domain} accent />
                {/* vertical stem */}
                <div className="w-[2px] h-6" style={{ background: ACCENT }} />

                {/* main routes row */}
                <div className="w-full flex items-start justify-center gap-4 flex-wrap">
                    {group.routes.map((r) => {
                        const label = kh ? r.label.kh : r.label.en;
                        return (
                            <div key={r.path} className="flex flex-col items-center">
                                <FlowNode label={label} path={r.path} />
                                {r.children && r.children.length > 0 && (
                                    <>
                                        <div className="w-[2px] h-5 bg-black/60" />
                                        <div className="flex flex-col gap-2 pl-3" style={{ borderLeft: `2px solid ${ACCENT}` }}>
                                            {r.children.map((c) => {
                                                const cLabel = kh ? c.label.kh : c.label.en;
                                                return (
                                                    <div
                                                        key={c.path}
                                                        className="border border-black bg-white px-2 py-1 text-left"
                                                    >
                                                        <span className="text-[11px] font-medium text-black whitespace-nowrap">
                                                            {cLabel}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   PAGE
─────────────────────────────────────────────────────────── */
export default function SitemapPage() {
    const { lang, setLang } = useLang();
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-kh-header), 'Google Sans Khmer', sans-serif" } : { fontFamily: "'GoogleSans', 'Google Sans', sans-serif" };

    const [view, setView] = useState<ViewMode>("tree");
    const group = SITEMAP[0];
    const stats = countRoutes(group);

    const VIEWS: { id: ViewMode; en: string; kh: string }[] = [
        { id: "tree", en: "Tree", kh: "មែកធាង" },
        { id: "table", en: "Table", kh: "តារាង" },
        { id: "flow", en: "Flowchart", kh: "ដ្យាក្រាម" },
    ];

    return (
        <div className="min-h-screen bg-white text-black" style={khFont}>
            {/* ── header ── */}
            <header className="border-b-2 border-black bg-white sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-bold uppercase tracking-[0.15em] leading-none" style={{ borderBottom: `3px solid ${ACCENT}`, display: "inline-block", paddingBottom: 4 }}>
                            {kh ? "ផែនទីគេហទំព័រ" : "SITEMAP"}
                        </h1>
                        <p className="text-[10px] sm:text-xs font-mono text-black/55 mt-2">
                            {kh ? "ស្ថាបត្យកម្មព័ត៌មាន · រចនាសម្ព័ន្ធគេហទំព័រ" : "Information Architecture · Site Structure"}
                        </p>
                    </div>
                    <button
                        onClick={() => setLang(kh ? "en" : "kh")}
                        className="text-xs font-bold uppercase tracking-widest border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors flex-shrink-0"
                        aria-label="Toggle language"
                    >
                        {kh ? "EN" : "ខ្មែរ"}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
                {/* domain line */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 mb-1">
                        {kh ? "ដែន" : "Domain"}
                    </div>
                    <div className="border-2 border-black p-4">
                        <div className="text-lg sm:text-2xl font-bold">{kh ? group.label.kh : group.label.en}</div>
                        <code className="text-[11px] sm:text-sm font-mono text-black/60 block mt-1">{group.domain}</code>
                        <p className="text-xs sm:text-sm text-black/70 mt-2">{kh ? group.desc.kh : group.desc.en}</p>
                    </div>
                </div>

                {/* stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { v: stats.main, l: kh ? "ផ្លូវចម្បង" : "Main Routes" },
                        { v: stats.sub, l: kh ? "ផ្លូវរង" : "Sub Routes" },
                        { v: stats.total, l: kh ? "ទំព័រសរុប" : "Total Pages" },
                        { v: stats.live, l: kh ? "ទំព័រដំណើរការ" : "Live Pages" },
                    ].map((s, i) => (
                        <div key={i} className="border-2 border-black p-3" style={{ borderTop: `4px solid ${ACCENT}` }}>
                            <div className="text-2xl sm:text-4xl font-bold font-mono leading-none">{String(s.v).padStart(2, "0")}</div>
                            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black/55 mt-2">{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* view switcher */}
                <div className="flex items-center gap-0 border-2 border-black w-fit">
                    {VIEWS.map((v, i) => {
                        const active = view === v.id;
                        return (
                            <button
                                key={v.id}
                                onClick={() => setView(v.id)}
                                className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-2 transition-colors ${i > 0 ? "border-l-2 border-black" : ""} ${active ? "bg-black text-white" : "bg-white text-black hover:bg-black/[0.06]"}`}
                            >
                                {kh ? v.kh : v.en}
                            </button>
                        );
                    })}
                </div>

                {/* active view */}
                {view === "tree" && <TreeView group={group} kh={kh} />}
                {view === "table" && <TableView group={group} kh={kh} />}
                {view === "flow" && <FlowView group={group} kh={kh} />}
            </main>

            <footer className="border-t-2 border-black mt-10 py-5">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/50">
                        {kh ? "កេសារារាម វិត ឌីជីថល · ផែនទីគេហទំព័រ" : "Kesararam With Digital · Sitemap"}
                    </span>
                    <Link href="/" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
                        {kh ? "ត្រឡប់ទៅដើម" : "Back Home"}
                    </Link>
                </div>
            </footer>
        </div>
    );
}
