"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { 
  BarChart2, BookOpen, Building2, Cpu, ExternalLink, Globe, 
  Landmark, Layers, LayoutGrid, Network, ShieldCheck, Smartphone, 
  Type, Zap, ChevronRight, LayoutList, Eye, EyeOff 
} from "lucide-react";
import { SiGoogleplay } from "react-icons/si";

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
];

const PUBLIC_HIDDEN_DOMAIN_IDS = ["admin", "staff"];

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

const ACCENT_GOLD = "#ffd700";
const ACCENT_CYAN = "#06b6d4";

/* Status Badge Component */
function Tag({ kind, kh }: { kind: "live" | "dynamic" | "auth"; kh: boolean }) {
  const map = {
    live: { t: kh ? "ដំណើរការ" : "LIVE", c: "border-emerald-500 text-emerald-400 bg-emerald-950/20" },
    dynamic: { t: kh ? "ថាមវន្ត" : "DYNAMIC", c: "border-cyan-500 text-cyan-400 bg-cyan-950/20" },
    auth: { t: kh ? "ត្រូវចូល" : "AUTH", c: "border-amber-500 text-amber-400 bg-amber-950/20" },
  } as const;
  const { t, c } = map[kind];
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest border px-1.5 py-0.5 font-mono ${c}`}>
      {t}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────
   TREE VIEW
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
    <div className="flex items-center gap-3 px-4 py-3 flex-wrap bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 transition-colors">
      {hasChildren && (
        <span
          className="inline-block text-zinc-500 transition-transform duration-300 select-none font-bold"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          ▸
        </span>
      )}
      <span className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-100">{label}</span>
      <code className="text-xs font-mono text-zinc-500 bg-zinc-950/40 px-1 py-0.5 border border-zinc-800/40">{node.path}</code>
      <div className="flex gap-1.5 flex-wrap">
        {node.live && <Tag kind="live" kh={kh} />}
        {node.dynamic && <Tag kind="dynamic" kh={kh} />}
        {node.auth && <Tag kind="auth" kh={kh} />}
      </div>
      {node.priority !== undefined && (
        <span className="text-[10px] font-mono text-zinc-500 ml-auto">
          {kh ? "អាទិភាព" : "prio"} {node.priority.toFixed(1)}
        </span>
      )}
    </div>
  );

  return (
    <div className="my-2">
      {hasChildren ? (
        <button
          onClick={() => toggle(node.path)}
          className="w-full text-left cursor-pointer"
        >
          {header}
        </button>
      ) : node.live ? (
        <Link href={node.path} className="block cursor-pointer">
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
              className="ml-5 pl-4 pb-2 mt-1 border-l-2 border-dashed border-zinc-800"
            >
              {node.children!.map((c, ci) => {
                const cLabel = kh ? c.label.kh : c.label.en;
                const inner = (
                  <div
                    className="flex items-center gap-3 py-2 px-3 bg-zinc-950/20 border border-zinc-900 hover:bg-zinc-900/60 transition-colors flex-wrap"
                    style={{
                      animation: isOpen ? `kwdSlideIn 0.3s ease both` : undefined,
                      animationDelay: `${ci * 35}ms`,
                    }}
                  >
                    <span className="text-zinc-600 font-mono">└─</span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-300">{cLabel}</span>
                    <code className="text-[10px] sm:text-xs font-mono text-zinc-500">{c.path}</code>
                    {c.live && <Tag kind="live" kh={kh} />}
                    {c.dynamic && <Tag kind="dynamic" kh={kh} />}
                    {c.auth && <Tag kind="auth" kh={kh} />}
                  </div>
                );
                return c.live ? (
                  <Link key={c.path} href={c.path} className="block my-1 cursor-pointer">
                    {inner}
                  </Link>
                ) : (
                  <div key={c.path} className="my-1">{inner}</div>
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
    <div className="space-y-1">
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
    <div className="border-2 border-zinc-800 overflow-x-auto bg-zinc-950 shadow-[4px_4px_0_rgba(6,182,212,0.15)] rounded-none">
      <table className="w-full border-collapse text-left text-xs font-mono">
        <thead>
          <tr className="border-b-2 border-zinc-800 bg-zinc-900/60">
            <th className="px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400">{kh ? "ទំព័រ" : "Page"}</th>
            <th className="px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400">{kh ? "ផ្លូវ (URL)" : "Path"}</th>
            <th className="px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest hidden sm:table-cell text-cyan-400">{kh ? "កម្រិត" : "Level"}</th>
            <th className="px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400">{kh ? "ស្ថានភាព" : "Status"}</th>
            <th className="px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest hidden md:table-cell text-cyan-400">{kh ? "អាទិភាព" : "Priority"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {rows.map(({ node, depth }, i) => {
            const label = kh ? node.label.kh : node.label.en;
            return (
              <tr
                key={node.path}
                className="hover:bg-zinc-900/40 transition-colors"
                style={depth > 0 ? { borderLeft: `3px solid ${ACCENT_GOLD}` } : undefined}
              >
                <td className="px-4 py-3 align-middle font-sans">
                  <span
                    className={`text-zinc-200 ${depth > 0 ? "text-xs font-medium" : "text-sm font-black"}`}
                    style={{ paddingLeft: depth * 14 }}
                  >
                    {depth > 0 && <span className="text-zinc-600 mr-2">└─</span>}
                    {label}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle"><code className="text-[11px] font-mono text-zinc-400">{node.path}</code></td>
                <td className="px-4 py-3 align-middle hidden sm:table-cell"><span className="text-xs font-mono text-zinc-500">{depth === 0 ? (kh ? "ចម្បង" : "Main") : (kh ? "រង" : "Sub")}</span></td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex gap-1.5 flex-wrap">
                    {node.live && <Tag kind="live" kh={kh} />}
                    {node.dynamic && <Tag kind="dynamic" kh={kh} />}
                    {node.auth && <Tag kind="auth" kh={kh} />}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle hidden md:table-cell"><span className="text-xs font-mono text-zinc-400">{node.priority !== undefined ? node.priority.toFixed(1) : "—"}</span></td>
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
    <div className="border-2 border-zinc-800 p-6 overflow-x-auto bg-zinc-950 shadow-[4px_4px_0_rgba(6,182,212,0.15)] rounded-none">
      <div className="flex flex-col items-center min-w-[760px] py-6">
        
        {/* Domain Root Card */}
        <div className="inline-flex flex-col items-center border-2 border-cyan-500 bg-zinc-900 px-6 py-3 text-center shadow-[4px_4px_0_#06b6d4]">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">{kh ? "ប្រព័ន្ធដែន" : "Domain Root"}</span>
          <span className="text-sm font-black text-white mt-1">{kh ? group.label.kh : group.label.en}</span>
          <code className="text-[10px] font-mono text-zinc-500 mt-1 bg-zinc-950 px-2 py-0.5 border border-zinc-800">{group.domain}</code>
        </div>

        {/* Stem down from root */}
        <div className="w-[3px] h-8 bg-cyan-500" />
        
        {/* Horizontal branch connector spanning children */}
        <div className="w-full flex items-start justify-center gap-6 flex-wrap">
          {group.routes.map((r) => {
            const label = kh ? r.label.kh : r.label.en;
            return (
              <div key={r.path} className="flex flex-col items-center min-w-[160px] mt-2">
                {/* Branch vertical line */}
                <div className="w-[2.5px] h-4 bg-zinc-700" />
                
                {/* Node Card */}
                <div className="border-2 border-zinc-700 bg-zinc-900 px-4 py-2.5 text-center w-full shadow-[3px_3px_0_rgba(255,255,255,0.05)]">
                  <span className="text-xs font-black text-zinc-100 uppercase tracking-wide block">{label}</span>
                  <code className="text-[9px] font-mono text-zinc-500 block mt-1 truncate">{r.path}</code>
                </div>

                {r.children && r.children.length > 0 && (
                  <>
                    <div className="w-[2.5px] h-4 bg-zinc-700" />
                    <div className="flex flex-col gap-2 pl-3 border-l-2 border-dashed border-zinc-800">
                      {r.children.map((c) => (
                        <div key={c.path} className="border border-zinc-800 bg-zinc-950/40 px-3 py-1.5 text-left w-36 shadow-[1.5px_1.5px_0_#000]">
                          <span className="text-[10px] font-bold text-zinc-400 block line-clamp-1">{kh ? c.label.kh : c.label.en}</span>
                          <code className="text-[8px] font-mono text-zinc-600 truncate block mt-0.5">{c.path}</code>
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
  const khFont = { fontFamily: "var(--font-system)" };
  const t = (en: string, k: string) => (kh ? k : en);

  const [view, setView] = useState<ViewMode>("tree");
  const [activeDomain, setActiveDomain] = useState("public");
  
  // Flag to toggle full platform structure (Admin + Staff areas)
  const [showFullArchitecture, setShowFullArchitecture] = useState(false);

  // Filter routes based on toggle
  const currentDomains = [...SITEMAP, ...DASHBOARD].filter(
    (g) => showFullArchitecture || !PUBLIC_HIDDEN_DOMAIN_IDS.includes(g.id)
  );

  // Expanded by default
  const initialOpen = (): Record<string, boolean> => {
    const all: Record<string, boolean> = {};
    SITEMAP[0].routes.forEach((r) => { if (r.children) all[r.path] = true; });
    return all;
  };
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initialOpen);

  const group = currentDomains.find((g) => g.id === activeDomain) || currentDomains[0];
  const stats = countRoutes(currentDomains);

  const toggle = (p: string) => setOpenMap((m) => ({ ...m, [p]: !m[p] }));
  
  const expandAll = () => {
    const all: Record<string, boolean> = {};
    group.routes.forEach((r) => { if (r.children) all[r.path] = true; });
    setOpenMap(all);
  };
  
  const collapseAll = () => setOpenMap({});

  const selectDomain = (id: string) => {
    setActiveDomain(id);
    const g = currentDomains.find((x) => x.id === id)!;
    if (g) {
      const all: Record<string, boolean> = {};
      g.routes.forEach((r) => { if (r.children) all[r.path] = true; });
      setOpenMap(all);
    }
  };

  const VIEWS: { id: ViewMode; en: string; kh: string; icon: any }[] = [
    { id: "tree", en: "Directory Tree", kh: "មែកធាងបញ្ជី", icon: Network },
    { id: "table", en: "Information Grid", kh: "ក្រឡាទិន្នន័យ", icon: LayoutList },
    { id: "flow", en: "Flowchart Map", kh: "ដ្យាក្រាមលំហូរ", icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 hero-dot-bg pb-24" style={khFont}>
      {/* CSS Animation keyframe key */}
      <style>{`@keyframes kwdSlideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}`}</style>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-yellow-500 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              HUD CONTROL CENTER
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
              {t("Site Architecture", "ផែនទីស្ថាបត្យកម្មគេហទំព័រ")}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(kh ? "en" : "kh")}
              className="text-xs font-black uppercase tracking-widest border-2 border-zinc-700 hover:border-white px-3 py-1.5 transition-colors cursor-pointer bg-zinc-900"
            >
              {kh ? "EN" : "ខ្មែរ"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* Toggle Panel for Full Architecture View */}
        <div className="border-2 border-black dark:border-zinc-800 p-4 bg-zinc-900/60 backdrop-blur-xs flex flex-col md:flex-row items-center justify-between gap-4 shadow-[3px_3px_0_rgba(6,182,212,0.15)]">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-zinc-800 border border-zinc-700 text-yellow-500 shrink-0 mt-0.5">
              <Zap size={18} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase font-mono tracking-wider text-zinc-300">
                {t("Platform Architecture Visibility", "កម្រិតបង្ហាញស្ថាបត្យកម្មប្រព័ន្ធ")}
              </span>
              <span className="text-xs text-zinc-500 max-w-md mt-0.5 leading-relaxed">
                {t(
                  "By default, sitemap lists public user routes. Turn on visibility to inspect the complete platform hierarchy including Staff content boards and Admin management consoles.",
                  "ផែនទីគេហទំព័របង្ហាញតែផ្លូវសាធារណៈ។ បើកការបង្ហាញនេះដើម្បីពិនិត្យមើលស្ថាបត្យកម្មប្រព័ន្ធទាំងមូល រួមទាំងផ្ទាំងការងារបុគ្គលិក និងអ្នកគ្រប់គ្រង។"
                )}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => {
              const nextVal = !showFullArchitecture;
              setShowFullArchitecture(nextVal);
              // Recalculate domains list
              const nextDomains = [...SITEMAP, ...DASHBOARD].filter(
                (g) => nextVal || !PUBLIC_HIDDEN_DOMAIN_IDS.includes(g.id)
              );
              // Auto reset active domain if current is filtered
              if (!nextDomains.some((d) => d.id === activeDomain)) {
                setActiveDomain(nextDomains[0].id);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-xs border-2 border-black transition-all cursor-pointer ${
              showFullArchitecture
                ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {showFullArchitecture ? <Eye size={14} /> : <EyeOff size={14} />}
            {showFullArchitecture ? t("Full Platform Enabled", "បានបើកស្ថាបត្យកម្មពេញ") : t("Show Full Platform", "បង្ហាញស្ថាបត្យកម្មពេញ")}
          </button>
        </div>

        {/* HUD statistics panels */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { v: stats.main, l: t("Main Links", "ផ្លូវចម្បង") },
            { v: stats.sub, l: t("Sub Routes", "ផ្លូវរង") },
            { v: stats.total, l: t("Total Pages", "ទំព័រសរុប") },
            { v: stats.live, l: t("Live Status", "ដំណើរការ") },
            { v: stats.dynamic, l: t("Dynamic URL", "ថាមវន្ត") },
          ].map((s, i) => (
            <div key={i} className="border-2 border-zinc-800 bg-zinc-900/30 p-4 shadow-[2px_2px_0_rgba(6,182,212,0.1)]" style={{ borderTop: `4px solid ${ACCENT_CYAN}` }}>
              <div className="text-3xl font-black font-mono leading-none text-white">{String(s.v).padStart(2, "0")}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2 font-mono">{s.l}</div>
            </div>
          ))}
        </div>

        {/* domain tabs */}
        <div className="flex flex-wrap gap-2">
          {currentDomains.map((g) => {
            const active = g.id === activeDomain;
            return (
              <button
                key={g.id}
                onClick={() => selectDomain(g.id)}
                className={`text-[11px] sm:text-xs font-black uppercase tracking-widest border-2 border-black px-4 py-2 transition-all cursor-pointer ${
                  active 
                    ? "bg-cyan-500 text-black border-cyan-500 shadow-[2px_2px_0_rgba(255,255,255,0.15)]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t(g.label.en, g.label.kh)}
              </button>
            );
          })}
        </div>

        {/* domain description */}
        <div className="border-2 border-zinc-800 p-4 bg-zinc-900/20 backdrop-blur-xs flex items-center justify-between" style={{ borderLeft: `5px solid ${ACCENT_GOLD}` }}>
          <div>
            <code className="text-xs font-mono text-zinc-500 block uppercase tracking-wider">{group.domain}</code>
            <p className="text-sm font-medium text-zinc-300 mt-1">{t(group.desc.en, group.desc.kh)}</p>
          </div>
        </div>

        {/* controls: view switch + expand/collapse */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-zinc-800/80">
          <div className="flex items-center border-2 border-black bg-zinc-900">
            {VIEWS.map((v, i) => {
              const active = view === v.id;
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider px-4 py-2 transition-all cursor-pointer ${
                    i > 0 ? "border-l-2 border-black" : ""
                  } ${
                    active 
                      ? "bg-zinc-800 text-white border-y-0" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon size={12} />
                  {t(v.en, v.kh)}
                </button>
              );
            })}
          </div>
          
          {view === "tree" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={expandAll} 
                className="text-[10px] font-black uppercase tracking-widest border-2 border-black bg-zinc-900 text-zinc-400 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
              >
                {t("Expand All", "បើកទាំងអស់")}
              </button>
              <button 
                onClick={collapseAll} 
                className="text-[10px] font-black uppercase tracking-widest border-2 border-black bg-zinc-900 text-zinc-400 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
              >
                {t("Collapse", "បិទទាំងអស់")}
              </button>
            </div>
          )}
        </div>

        {/* active view */}
        <div className="mt-4">
          {view === "tree" && <TreeView group={group} kh={kh} openMap={openMap} toggle={toggle} />}
          {view === "table" && <TableView group={group} kh={kh} />}
          {view === "flow" && <FlowView group={group} kh={kh} />}
        </div>
      </main>

      {/* footer */}
      <footer className="border-t border-zinc-900 mt-20 py-8 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-600">
            {t("Kesararam With Digital · Sitemap Architecture", "Kesararam With Digital · ផែនទីស្ថាបត្យកម្មគេហទំព័រ")}
          </span>
          <Link href="/" className="text-xs font-black uppercase tracking-widest border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white px-4 py-2 transition-all cursor-pointer">
            {t("Back Home", "ត្រឡប់ទៅដើម")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
