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
    auth?: boolean;     // requires login / role
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
   COMPLETE PROJECT STRUCTURE  (every page.tsx in src/app)
─────────────────────────────────────────────────────────── */
const SITEMAP: DomainGroup[] = [
    {
        id: "public",
        domain: "kesararamwithdigital.tech",
        label: { en: "Public Site", kh: "គេហទំព័រសាធារណៈ" },
        desc: {
            en: "Root — public pages, learning, games, leaderboard, account",
            kh: "ទំព័រសាធារណៈ — ការរៀន ហ្គេម តារាងចំណាត់ថ្នាក់ គណនី",
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
                    { path: "/play/daily", label: { en: "Daily Challenge", kh: "បញ្ហាប្រចាំថ្ងៃ" }, live: true },
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
                    { path: "/built-with", label: { en: "Bibliography", kh: "ឯកសារយោង" }, live: true },
                    { path: "/brand", label: { en: "Brand Guideline", kh: "ម៉ាករបស់យើង" }, live: true },
                ],
            },
            { path: "/pricing", label: { en: "Pricing", kh: "តម្លៃ" }, priority: 0.5, live: true },
            {
                path: "/profile/student",
                label: { en: "Student Profile", kh: "ទម្រង់សិស្ស" },
                priority: 0.4,
                live: true,
                auth: true,
                children: [
                    { path: "/u/[username]", label: { en: "Public Profile (username)", kh: "ទម្រង់សាធារណៈ (ឈ្មោះ)" }, dynamic: true },
                    { path: "/p/[memberId]", label: { en: "Member Card (id)", kh: "ប័ណ្ណសមាជិក (id)" }, dynamic: true },
                ],
            },
            {
                path: "/login",
                label: { en: "Authentication", kh: "ការផ្ទៀងផ្ទាត់" },
                priority: 0.4,
                live: true,
                children: [
                    { path: "/register", label: { en: "Register", kh: "ចុះឈ្មោះ" }, live: true },
                    { path: "/team/[token]", label: { en: "Team Invite (token)", kh: "អញ្ជើញចូលក្រុម (ថូខឹន)" }, dynamic: true },
                ],
            },
            {
                path: "/terms",
                label: { en: "Terms of Use", kh: "លក្ខខណ្ឌប្រើប្រាស់" },
                priority: 0.3,
                live: true,
                children: [
                    { path: "/privacy", label: { en: "Privacy Policy", kh: "គោលការណ៍ភាពឯកជន" }, live: true },
                ],
            },
            { path: "/sitemap", label: { en: "Sitemap", kh: "ផែនទីគេហទំព័រ" }, priority: 0.2, live: true },
        ],
    },
];

const DASHBOARD: DomainGroup[] = [
    {
        id: "shared",
        domain: "/dashboard · /settings · /chat",
        label: { en: "Shared Account Area", kh: "តំបន់គណនីរួម" },
        desc: {
            en: "Authenticated areas shared by all logged-in roles",
            kh: "តំបន់សម្រាប់អ្នកប្រើដែលបានចូលគ្រប់តួនាទី",
        },
        routes: [
            { path: "/dashboard", label: { en: "Dashboard", kh: "ផ្ទាំងគ្រប់គ្រង" }, live: true, auth: true },
            { path: "/chat", label: { en: "Chat", kh: "ជជែក" }, live: true, auth: true },
            {
                path: "/settings",
                label: { en: "Settings", kh: "ការកំណត់" },
                live: true,
                auth: true,
                children: [
                    { path: "/settings/notifications", label: { en: "Notifications", kh: "ការជូនដំណឹង" }, live: true, auth: true },
                ],
            },
        ],
    },
    {
        id: "admin",
        domain: "/admin",
        label: { en: "Admin Panel", kh: "ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ" },
        desc: {
            en: "System administration — content, users, media, logs, subscriptions",
            kh: "គ្រប់គ្រងប្រព័ន្ធ — មាតិកា អ្នកប្រើ មេឌៀ កំណត់ត្រា ការជាវ",
        },
        routes: [
            { path: "/admin", label: { en: "Admin Home", kh: "ទំព័រគ្រប់គ្រង" }, live: true, auth: true },
            { path: "/admin/overview", label: { en: "Overview", kh: "ទិដ្ឋភាពទូទៅ" }, live: true, auth: true },
            {
                path: "/admin/content",
                label: { en: "Content", kh: "មាតិកា" },
                live: true,
                auth: true,
                children: [
                    { path: "/admin/content/road-sign", label: { en: "Road Signs", kh: "សញ្ញាចរាចរណ៍" }, live: true, auth: true },
                    { path: "/admin/content/road-traffic", label: { en: "Road Traffic", kh: "ចរាចរណ៍ផ្លូវ" }, live: true, auth: true },
                    { path: "/admin/content/priority", label: { en: "Priority", kh: "អាទិភាព" }, live: true, auth: true },
                    { path: "/admin/content/driving", label: { en: "Road Safety", kh: "សុវត្ថិភាពចរាចរណ៍" }, live: true, auth: true },
                    { path: "/admin/content/technical", label: { en: "Technical", kh: "បច្ចេកទេស" }, live: true, auth: true },
                    { path: "/admin/content/loading-people-goods", label: { en: "Loading People & Goods", kh: "ផ្ទុកមនុស្ស និងទំនិញ" }, live: true, auth: true },
                    { path: "/admin/content/general-knowledge", label: { en: "General Knowledge", kh: "ចំណេះដឹងទូទៅ" }, live: true, auth: true },
                    { path: "/admin/content/emergency", label: { en: "Emergency", kh: "អាសន្ន" }, live: true, auth: true },
                    { path: "/admin/content/questions", label: { en: "Questions", kh: "សំណួរ" }, live: true, auth: true },
                ],
            },
            { path: "/admin/questions", label: { en: "Questions Bank", kh: "ឃ្លាំងសំណួរ" }, live: true, auth: true },
            { path: "/admin/review", label: { en: "Review Queue", kh: "ជួរត្រួតពិនិត្យ" }, live: true, auth: true },
            { path: "/admin/road-markings", label: { en: "Road Markings", kh: "សញ្ញាសម្គាល់ផ្លូវ" }, live: true, auth: true },
            { path: "/admin/media", label: { en: "Media Library", kh: "បណ្ណាល័យមេឌៀ" }, live: true, auth: true },
            { path: "/admin/users", label: { en: "Users", kh: "អ្នកប្រើប្រាស់" }, live: true, auth: true },
            { path: "/admin/subscriptions", label: { en: "Subscriptions", kh: "ការជាវ" }, live: true, auth: true },
            { path: "/admin/game-sessions", label: { en: "Game Sessions", kh: "សម័យហ្គេម" }, live: true, auth: true },
            { path: "/admin/logs", label: { en: "Audit Logs", kh: "កំណត់ត្រាសវនកម្ម" }, live: true, auth: true },
            { path: "/admin/profile", label: { en: "Admin Profile", kh: "ទម្រង់អ្នកគ្រប់គ្រង" }, live: true, auth: true },
        ],
    },
    {
        id: "staff",
        domain: "/staff",
        label: { en: "Staff Panel", kh: "ផ្ទាំងបុគ្គលិក" },
        desc: {
            en: "Content authoring — topics, learning resources, submissions",
            kh: "បង្កើតមាតិកា — ប្រធានបទ ធនធានរៀន ការដាក់ស្នើ",
        },
        routes: [
            { path: "/staff", label: { en: "Staff Home", kh: "ទំព័របុគ្គលិក" }, live: true, auth: true },
            {
                path: "/staff/content",
                label: { en: "Content", kh: "មាតិកា" },
                live: true,
                auth: true,
                children: [
                    { path: "/staff/content/create", label: { en: "Create Content", kh: "បង្កើតមាតិកា" }, live: true, auth: true },
                    { path: "/staff/content/[categorySlug]/[id]", label: { en: "Edit Item (dynamic)", kh: "កែមាតិកា (ថាមវន្ត)" }, dynamic: true },
                    { path: "/staff/content/road-sign", label: { en: "Road Signs", kh: "សញ្ញាចរាចរណ៍" }, live: true, auth: true },
                    { path: "/staff/content/priority", label: { en: "Priority", kh: "អាទិភាព" }, live: true, auth: true },
                    { path: "/staff/content/emergency", label: { en: "Emergency", kh: "អាសន្ន" }, live: true, auth: true },
                ],
            },
            {
                path: "/staff/topics",
                label: { en: "Topics", kh: "ប្រធានបទ" },
                live: true,
                auth: true,
                children: [
                    { path: "/staff/topics/create", label: { en: "Create Topic", kh: "បង្កើតប្រធានបទ" }, live: true, auth: true },
                ],
            },
            {
                path: "/staff/learning-resources",
                label: { en: "Learning Resources", kh: "ធនធានរៀន" },
                live: true,
                auth: true,
                children: [
                    { path: "/staff/learning-resources/create", label: { en: "Create Resource", kh: "បង្កើតធនធាន" }, live: true, auth: true },
                ],
            },
            { path: "/staff/classes", label: { en: "Classes", kh: "ថ្នាក់រៀន" }, live: true, auth: true },
            { path: "/staff/submissions", label: { en: "Submissions", kh: "ការដាក់ស្នើ" }, live: true, auth: true },
            { path: "/staff/media", label: { en: "Media", kh: "មេឌៀ" }, live: true, auth: true },
            { path: "/staff/profile", label: { en: "Staff Profile", kh: "ទម្រង់បុគ្គលិក" }, live: true, auth: true },
        ],
    },
    {
        id: "teacher",
        domain: "/teacher",
        label: { en: "Teacher Panel", kh: "ផ្ទាំងគ្រូបង្រៀន" },
        desc: {
            en: "Classes, live sessions, and student analytics",
            kh: "ថ្នាក់រៀន សម័យផ្ទាល់ និងវិភាគសិស្ស",
        },
        routes: [
            { path: "/teacher", label: { en: "Teacher Home", kh: "ទំព័រគ្រូ" }, live: true, auth: true },
            { path: "/teacher/overview", label: { en: "Overview", kh: "ទិដ្ឋភាពទូទៅ" }, live: true, auth: true },
            {
                path: "/teacher/classes",
                label: { en: "Classes", kh: "ថ្នាក់រៀន" },
                live: true,
                auth: true,
                children: [
                    { path: "/teacher/classes/[id]", label: { en: "Class Detail (dynamic)", kh: "ព័ត៌មានថ្នាក់ (ថាមវន្ត)" }, dynamic: true },
                ],
            },
            {
                path: "/teacher/sessions",
                label: { en: "Live Sessions", kh: "សម័យផ្ទាល់" },
                live: true,
                auth: true,
                children: [
                    { path: "/teacher/sessions/host", label: { en: "Host Session", kh: "បើកសម័យ" }, live: true, auth: true },
                    { path: "/teacher/sessions/[code]/analytics", label: { en: "Session Analytics (dynamic)", kh: "វិភាគសម័យ (ថាមវន្ត)" }, dynamic: true },
                ],
            },
            { path: "/teacher/profile", label: { en: "Teacher Profile", kh: "ទម្រង់គ្រូ" }, live: true, auth: true },
        ],
    },
];

const ALL_DOMAINS = [...SITEMAP, ...DASHBOARD];

/* ──────────────────────────────────────────────────────────
   STATS + HELPERS
─────────────────────────────────────────────────────────── */
function countRoutes(groups: DomainGroup[]) {
    let main = 0, sub = 0, live = 0, dynamic = 0;
    groups.forEach((g) => {
        main += g.routes.length;
        g.routes.forEach((r) => {
            if (r.live) live++;
            if (r.dynamic) dynamic++;
            r.children?.forEach((c) => {
                sub++;
                if (c.live) live++;
                if (c.dynamic) dynamic++;
            });
        });
    });
    return { main, sub, total: main + sub, live, dynamic };
}

function flattenRoutes(group: DomainGroup) {
    const rows: { node: RouteNode; depth: number }[] = [];
    group.routes.forEach((r) => {
        rows.push({ node: r, depth: 0 });
        r.children?.forEach((c) => rows.push({ node: c, depth: 1 }));
    });
    return rows;
}

/* KWD brand palette — accent rules only, never fills. */
const ACCENT = "#eab308"; // brand yellow

/* status tag — text only, no icon, no fill */
function Tag({ kind, kh }: { kind: "live" | "dynamic" | "auth"; kh: boolean }) {
    const map = {
        live: { t: kh ? "ដំណើរការ" : "LIVE", c: "#000" },
        dynamic: { t: kh ? "ថាមវន្ត" : "DYNAMIC", c: ACCENT },
        auth: { t: kh ? "ត្រូវចូល" : "AUTH", c: "#3b82f6" },
    } as const;
    const { t, c } = map[kind];
    return (
        <span
            className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5 text-black"
            style={{ borderColor: c }}
        >
            {t}
        </span>
    );
}

/* ──────────────────────────────────────────────────────────
   TREE VIEW — collapsible, animated grid-rows expand
─────────────────────────────────────────────────────────── */
function TreeRow({
    node,
    kh,
    openMap,
    toggle,
}: {
    node: RouteNode;
    kh: boolean;
    openMap: Record<string, boolean>;
    toggle: (p: string) => void;
}) {
    const label = kh ? node.label.kh : node.label.en;
    const hasChildren = !!node.children?.length;
    const isOpen = !!openMap[node.path];

    const header = (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-3 flex-wrap">
            {hasChildren && (
                <span
                    className="inline-block text-black/60 transition-transform duration-300 select-none"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    aria-hidden
                >
                    ▸
                </span>
            )}
            <span className="text-base sm:text-lg font-bold text-black">{label}</span>
            <code className="text-[11px] sm:text-xs font-mono text-black/55">{node.path}</code>
            {node.live && <Tag kind="live" kh={kh} />}
            {node.dynamic && <Tag kind="dynamic" kh={kh} />}
            {node.auth && <Tag kind="auth" kh={kh} />}
            {node.priority !== undefined && (
                <span className="text-[10px] font-mono text-black/40 ml-auto">
                    {kh ? "អាទិភាព" : "prio"} {node.priority.toFixed(1)}
                </span>
            )}
        </div>
    );

    return (
        <div>
            {hasChildren ? (
                <button
                    onClick={() => toggle(node.path)}
                    className="w-full text-left hover:bg-black/[0.03] transition-colors"
                >
                    {header}
                </button>
            ) : node.live ? (
                <Link href={node.path} className="block hover:bg-black/[0.03] transition-colors">
                    {header}
                </Link>
            ) : (
                <div className="opacity-90">{header}</div>
            )}

            {hasChildren && (
                <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                >
                    <div className="overflow-hidden">
                        <div
                            className="ml-4 sm:ml-6 pl-3 sm:pl-4 pb-2"
                            style={{ borderLeft: `3px solid ${ACCENT}` }}
                        >
                            {node.children!.map((c, ci) => {
                                const cLabel = kh ? c.label.kh : c.label.en;
                                const inner = (
                                    <div
                                        className="flex items-baseline gap-2 py-2 flex-wrap"
                                        style={{
                                            animation: isOpen ? `kwdSlideIn 0.3s ease both` : undefined,
                                            animationDelay: `${ci * 35}ms`,
                                        }}
                                    >
                                        <span className="text-black/40">—</span>
                                        <span className="text-sm sm:text-base font-medium text-black">{cLabel}</span>
                                        <code className="text-[10px] sm:text-[11px] font-mono text-black/50">{c.path}</code>
                                        {c.live && <Tag kind="live" kh={kh} />}
                                        {c.dynamic && <Tag kind="dynamic" kh={kh} />}
                                        {c.auth && <Tag kind="auth" kh={kh} />}
                                    </div>
                                );
                                return c.live ? (
                                    <Link key={c.path} href={c.path} className="block hover:bg-black/[0.03] transition-colors">
                                        {inner}
                                    </Link>
                                ) : (
                                    <div key={c.path}>{inner}</div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TreeView({
    group,
    kh,
    openMap,
    toggle,
}: {
    group: DomainGroup;
    kh: boolean;
    openMap: Record<string, boolean>;
    toggle: (p: string) => void;
}) {
    return (
        <div className="border-2 border-black divide-y-2 divide-black">
            {group.routes.map((r) => (
                <TreeRow key={r.path} node={r} kh={kh} openMap={openMap} toggle={toggle} />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   TABLE VIEW
─────────────────────────────────────────────────────────── */
function TableView({ group, kh }: { group: DomainGroup; kh: boolean }) {
    const rows = flattenRoutes(group);
    return (
        <div className="border-2 border-black overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{kh ? "ទំព័រ" : "Page"}</th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{kh ? "ផ្លូវ (URL)" : "Path"}</th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:table-cell">{kh ? "កម្រិត" : "Level"}</th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{kh ? "ស្ថានភាព" : "Status"}</th>
                        <th className="px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden md:table-cell">{kh ? "អាទិភាព" : "Priority"}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ node, depth }, i) => {
                        const label = kh ? node.label.kh : node.label.en;
                        return (
                            <tr
                                key={node.path}
                                className={`${i > 0 ? "border-t border-black/20" : ""} hover:bg-black/[0.03] transition-colors`}
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
                                <td className="px-3 py-2.5 align-top"><code className="text-[10px] sm:text-xs font-mono text-black/65">{node.path}</code></td>
                                <td className="px-3 py-2.5 align-top hidden sm:table-cell"><span className="text-xs font-mono text-black/60">{depth === 0 ? (kh ? "ចម្បង" : "Main") : (kh ? "រង" : "Sub")}</span></td>
                                <td className="px-3 py-2.5 align-top">
                                    <div className="flex gap-1 flex-wrap">
                                        {node.live && <Tag kind="live" kh={kh} />}
                                        {node.dynamic && <Tag kind="dynamic" kh={kh} />}
                                        {node.auth && <Tag kind="auth" kh={kh} />}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 align-top hidden md:table-cell"><span className="text-xs font-mono text-black/60">{node.priority !== undefined ? node.priority.toFixed(1) : "—"}</span></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   FLOWCHART VIEW
─────────────────────────────────────────────────────────── */
function FlowView({ group, kh }: { group: DomainGroup; kh: boolean }) {
    return (
        <div className="border-2 border-black p-4 sm:p-6 overflow-x-auto">
            <div className="flex flex-col items-center min-w-[640px]">
                <div className="inline-flex flex-col items-center border-2 border-black bg-white px-3 py-2 text-center" style={{ boxShadow: `4px 4px 0 ${ACCENT}` }}>
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{kh ? group.label.kh : group.label.en}</span>
                    <code className="text-[9px] font-mono text-black/50">{group.domain}</code>
                </div>
                <div className="w-[2px] h-6" style={{ background: ACCENT }} />
                <div className="w-full flex items-start justify-center gap-4 flex-wrap">
                    {group.routes.map((r) => {
                        const label = kh ? r.label.kh : r.label.en;
                        return (
                            <div key={r.path} className="flex flex-col items-center">
                                <div className="border-2 border-black bg-white px-3 py-2 text-center">
                                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{label}</span>
                                    <code className="text-[9px] font-mono text-black/50 block">{r.path}</code>
                                </div>
                                {r.children && r.children.length > 0 && (
                                    <>
                                        <div className="w-[2px] h-5 bg-black/60" />
                                        <div className="flex flex-col gap-2 pl-3" style={{ borderLeft: `2px solid ${ACCENT}` }}>
                                            {r.children.map((c) => (
                                                <div key={c.path} className="border border-black bg-white px-2 py-1 text-left">
                                                    <span className="text-[11px] font-medium whitespace-nowrap">{kh ? c.label.kh : c.label.en}</span>
                                                </div>
                                            ))}
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
    const khFont = kh
        ? { fontFamily: "var(--font-kh-header), 'Google Sans Khmer', sans-serif" }
        : { fontFamily: "'GoogleSans', 'Google Sans', sans-serif" };

    const [view, setView] = useState<ViewMode>("tree");
    const [activeDomain, setActiveDomain] = useState("public");
    // Expanded by default so every page (incl. Brand, Bibliography, Privacy) is visible.
    const initialOpen = (): Record<string, boolean> => {
        const all: Record<string, boolean> = {};
        SITEMAP[0].routes.forEach((r) => { if (r.children) all[r.path] = true; });
        return all;
    };
    const [openMap, setOpenMap] = useState<Record<string, boolean>>(initialOpen);

    const group = ALL_DOMAINS.find((g) => g.id === activeDomain)!;
    const stats = countRoutes(ALL_DOMAINS);

    const toggle = (p: string) => setOpenMap((m) => ({ ...m, [p]: !m[p] }));
    const expandAll = () => {
        const all: Record<string, boolean> = {};
        group.routes.forEach((r) => { if (r.children) all[r.path] = true; });
        setOpenMap(all);
    };
    const collapseAll = () => setOpenMap({});
    // When switching domains, auto-expand that domain's parents.
    const selectDomain = (id: string) => {
        setActiveDomain(id);
        const g = ALL_DOMAINS.find((x) => x.id === id)!;
        const all: Record<string, boolean> = {};
        g.routes.forEach((r) => { if (r.children) all[r.path] = true; });
        setOpenMap(all);
    };

    const VIEWS: { id: ViewMode; en: string; kh: string }[] = [
        { id: "tree", en: "Tree", kh: "មែកធាង" },
        { id: "table", en: "Table", kh: "តារាង" },
        { id: "flow", en: "Flowchart", kh: "ដ្យាក្រាម" },
    ];

    return (
        <div className="min-h-screen bg-white text-black" style={khFont}>
            {/* keyframes for child slide-in */}
            <style>{`@keyframes kwdSlideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}`}</style>

            {/* header */}
            <header className="border-b-2 border-black bg-white sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-bold uppercase tracking-[0.15em] leading-none inline-block" style={{ borderBottom: `3px solid ${ACCENT}`, paddingBottom: 4 }}>
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
                {/* stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { v: stats.main, l: kh ? "ផ្លូវចម្បង" : "Main" },
                        { v: stats.sub, l: kh ? "ផ្លូវរង" : "Sub" },
                        { v: stats.total, l: kh ? "សរុប" : "Total" },
                        { v: stats.live, l: kh ? "ដំណើរការ" : "Live" },
                        { v: stats.dynamic, l: kh ? "ថាមវន្ត" : "Dynamic" },
                    ].map((s, i) => (
                        <div key={i} className="border-2 border-black p-3" style={{ borderTop: `4px solid ${ACCENT}` }}>
                            <div className="text-2xl sm:text-3xl font-bold font-mono leading-none">{String(s.v).padStart(2, "0")}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-black/55 mt-2">{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* domain tabs */}
                <div className="flex flex-wrap gap-2">
                    {ALL_DOMAINS.map((g) => {
                        const active = g.id === activeDomain;
                        return (
                            <button
                                key={g.id}
                                onClick={() => selectDomain(g.id)}
                                className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest border-2 border-black px-3 py-1.5 transition-colors ${active ? "bg-black text-white" : "bg-white text-black hover:bg-black/[0.06]"}`}
                            >
                                {kh ? g.label.kh : g.label.en}
                            </button>
                        );
                    })}
                </div>

                {/* domain description */}
                <div className="border-2 border-black p-4" style={{ borderLeft: `5px solid ${ACCENT}` }}>
                    <code className="text-[11px] sm:text-sm font-mono text-black/60 block">{group.domain}</code>
                    <p className="text-xs sm:text-sm text-black/70 mt-1">{kh ? group.desc.kh : group.desc.en}</p>
                </div>

                {/* controls: view switch + expand/collapse */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center border-2 border-black w-fit">
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
                    {view === "tree" && (
                        <div className="flex items-center gap-2">
                            <button onClick={expandAll} className="text-[10px] font-bold uppercase tracking-widest border-2 border-black px-3 py-1.5 bg-white hover:bg-black hover:text-white transition-colors">
                                {kh ? "បើកទាំងអស់" : "Expand All"}
                            </button>
                            <button onClick={collapseAll} className="text-[10px] font-bold uppercase tracking-widest border-2 border-black px-3 py-1.5 bg-white hover:bg-black hover:text-white transition-colors">
                                {kh ? "បិទទាំងអស់" : "Collapse"}
                            </button>
                        </div>
                    )}
                </div>

                {/* active view */}
                {view === "tree" && <TreeView group={group} kh={kh} openMap={openMap} toggle={toggle} />}
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
