"use client";

import { useState } from "react";
import { useLang } from "@/context/lang-context";
import {
    Home, BookOpen, Gamepad2, Trophy, Bot, Info, Users,
    GraduationCap, LayoutDashboard, Settings, ChevronRight,
    Globe, Server, Layers, Box
} from "lucide-react";

// Sitemap data structure based on real project
const SITEMAP_DATA = {
    public: {
        domain: "kesararamwithdigital.tech",
        name: { en: "Public Site", kh: "គេហទំព័រសាធារណៈ" },
        description: {
            en: "Root — public site, knowledge categories, learning, leaderboard",
            kh: "ទំព័រសាធារណៈ — ប្រភេទចំណេះដឹង ការរៀនសូត្រ តារាងចំណាត់ថ្នាក់"
        },
        routes: [
            {
                path: "/",
                name: { en: "Home", kh: "ទំព័រដើម" },
                icon: Home,
                priority: 1.0,
                level: 1
            },
            {
                path: "/learn",
                name: { en: "Learn", kh: "រៀនសូត្រ" },
                icon: BookOpen,
                priority: 0.8,
                level: 2,
                children: [
                    {
                        path: "/learn/road-signs",
                        name: { en: "Road Signs", kh: "សញ្ញាចរាចរណ៍" },
                        level: 3
                    },
                    {
                        path: "/learn/road-traffic",
                        name: { en: "Road Traffic", kh: "ចរាចរណ៍ផ្លូវ" },
                        level: 3
                    },
                    {
                        path: "/learn/priority",
                        name: { en: "Priority Rules", kh: "បទប្បញ្ញត្តិអាទិភាព" },
                        level: 3
                    },
                    {
                        path: "/learn/driving",
                        name: { en: "Driving", kh: "ការបើកបរ" },
                        level: 3
                    },
                    {
                        path: "/learn/technical",
                        name: { en: "Technical", kh: "បច្ចេកទេស" },
                        level: 3
                    },
                    {
                        path: "/learn/loading-people-goods",
                        name: { en: "Loading", kh: "ផ្ទុកទំនិញ" },
                        level: 3
                    },
                    {
                        path: "/learn/general-knowledge",
                        name: { en: "General Knowledge", kh: "ចំណេះទូទៅ" },
                        level: 3
                    },
                    {
                        path: "/learn/emergency",
                        name: { en: "Emergency", kh: "អាសន្ន" },
                        level: 3
                    }
                ]
            },
            {
                path: "/play",
                name: { en: "Play", kh: "លេង" },
                icon: Gamepad2,
                priority: 0.8,
                level: 2,
                children: [
                    {
                        path: "/play/solo",
                        name: { en: "Solo Mode", kh: "ម៉ូដតែឯង" },
                        level: 3
                    },
                    {
                        path: "/play/[code]",
                        name: { en: "Live Game", kh: "ហ្គេមផ្ទាល់" },
                        level: 3
                    }
                ]
            },
            {
                path: "/leaderboard",
                name: { en: "Leaderboard", kh: "តារាងចំណាត់ថ្នាក់" },
                icon: Trophy,
                priority: 0.6,
                level: 2
            },
            {
                path: "/suar/ai",
                name: { en: "Suar AI", kh: "Suar AI" },
                icon: Bot,
                priority: 0.6,
                level: 2
            },
            {
                path: "/about",
                name: { en: "About", kh: "អំពីយើង" },
                icon: Info,
                priority: 0.5,
                level: 2
            },
            {
                path: "/profile/student",
                name: { en: "Student Profile", kh: "ទម្រង់សិស្ស" },
                icon: Users,
                priority: 0.5,
                level: 2
            },
            {
                path: "/pricing",
                name: { en: "Pricing", kh: "តម្លៃ" },
                icon: GraduationCap,
                priority: 0.5,
                level: 2
            }
        ]
    },
    dashboard: {
        domain: "dashboard.kesararamwithdigital.tech",
        name: { en: "Dashboard", kh: "ផ្ទាំងគ្រប់គ្រង" },
        description: {
            en: "Auth subdomain — Teacher & Admin dashboards (login redirect)",
            kh: "ផ្នែកផ្ទៀងផ្ទាត់ — ផ្ទាំងគ្រប់គ្រងសាស្ត្រាចារ្យនិងអ្នកគ្រប់គ្រង"
        },
        routes: [
            {
                path: "/teacher",
                name: { en: "Teacher Dashboard", kh: "គ្រូបង្រៀន" },
                icon: LayoutDashboard,
                level: 1,
                children: [
                    {
                        path: "/teacher/classes",
                        name: { en: "Classes", kh: "ថ្នាក់រៀន" },
                        level: 2
                    },
                    {
                        path: "/teacher/sessions",
                        name: { en: "Sessions", kh: "វគ្គសិក្សា" },
                        level: 2
                    },
                    {
                        path: "/teacher/quizzes",
                        name: { en: "Quizzes", kh: "សំណួរ" },
                        level: 2
                    }
                ]
            },
            {
                path: "/admin",
                name: { en: "Admin Dashboard", kh: "អ្នកគ្រប់គ្រង" },
                icon: Settings,
                level: 1,
                children: [
                    {
                        path: "/admin/users",
                        name: { en: "Users", kh: "អ្នកប្រើប្រាស់" },
                        level: 2
                    },
                    {
                        path: "/admin/content",
                        name: { en: "Content", kh: "មាតិកា" },
                        level: 2
                    }
                ]
            }
        ]
    }
};

export default function SitemapVisualPage() {
    const { lang } = useLang();
    const kh = lang === "kh";
    const [viewMode, setViewMode] = useState<"visual" | "table">("visual");
    const [activeDomain, setActiveDomain] = useState<"public" | "dashboard">("public");

    const currentData = SITEMAP_DATA[activeDomain];

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            {/* HUD Header */}
            <header className="border-b-2 border-white/20 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    {/* Title Bar */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white animate-pulse" />
                            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
                                {kh ? "ផែនទីគេហទំព័រ" : "SITEMAP"}
                            </h1>
                            <div className="hidden sm:block text-xs text-white/50">
                                {kh ? "/ ប្រព័ន្ធរចនា" : "/ SYSTEM ARCHITECTURE"}
                            </div>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('lang-switch', { detail: 'en' }))}
                                className={`px-3 py-1.5 border-2 transition-all ${!kh
                                        ? "bg-white text-black border-white"
                                        : "bg-black text-white border-white/30 hover:border-white/50"
                                    }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('lang-switch', { detail: 'kh' }))}
                                className={`px-3 py-1.5 border-2 transition-all ${kh
                                        ? "bg-white text-black border-white"
                                        : "bg-black text-white border-white/30 hover:border-white/50"
                                    }`}
                            >
                                ខ្មែរ
                            </button>
                        </div>
                    </div>

                    {/* Domain Selector */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                        <Globe size={16} className="text-white/50 flex-shrink-0" />
                        <button
                            onClick={() => setActiveDomain("public")}
                            className={`px-4 py-2 border-2 text-xs sm:text-sm whitespace-nowrap transition-all ${activeDomain === "public"
                                    ? "bg-white text-black border-white"
                                    : "bg-black text-white border-white/30 hover:border-white/50"
                                }`}
                        >
                            <span className="font-bold">{SITEMAP_DATA.public.domain}</span>
                        </button>
                        <button
                            onClick={() => setActiveDomain("dashboard")}
                            className={`px-4 py-2 border-2 text-xs sm:text-sm whitespace-nowrap transition-all ${activeDomain === "dashboard"
                                    ? "bg-white text-black border-white"
                                    : "bg-black text-white border-white/30 hover:border-white/50"
                                }`}
                        >
                            <span className="font-bold">{SITEMAP_DATA.dashboard.domain}</span>
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-white/50" />
                        <button
                            onClick={() => setViewMode("visual")}
                            className={`px-4 py-2 border-2 text-xs sm:text-sm transition-all ${viewMode === "visual"
                                    ? "bg-white text-black border-white"
                                    : "bg-black text-white border-white/30 hover:border-white/50"
                                }`}
                        >
                            {kh ? "ទស្សនីយភាព" : "VISUAL"}
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`px-4 py-2 border-2 text-xs sm:text-sm transition-all ${viewMode === "table"
                                    ? "bg-white text-black border-white"
                                    : "bg-black text-white border-white/30 hover:border-white/50"
                                }`}
                        >
                            {kh ? "តារាង" : "TABLE"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Domain Info Card */}
                <div className="border-2 border-white/30 p-6 mb-8 bg-black/50">
                    <div className="flex items-start gap-4">
                        <Server size={32} className="text-white flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl sm:text-3xl font-black uppercase mb-2 break-words">
                                {currentData.name[kh ? "kh" : "en"]}
                            </h2>
                            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                                {currentData.description[kh ? "kh" : "en"]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Mode */}
                {viewMode === "visual" && (
                    <div className="space-y-4">
                        {currentData.routes.map((route, idx) => {
                            const Icon = route.icon || Box;
                            return (
                                <div key={idx} className="space-y-2">
                                    {/* Level 1/2 Route */}
                                    <div className="border-2 border-white/50 bg-black/70 hover:bg-white/5 transition-all group">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white flex items-center justify-center flex-shrink-0">
                                                    <Icon size={20} className="sm:w-6 sm:h-6" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide break-words">
                                                            {route.name[kh ? "kh" : "en"]}
                                                        </h3>
                                                        <span className="text-xs sm:text-sm text-white/50 whitespace-nowrap flex-shrink-0">
                                                            L{route.level}
                                                        </span>
                                                    </div>
                                                    <code className="text-xs sm:text-sm text-white/70 block break-all">
                                                        {route.path}
                                                    </code>
                                                    {route.priority && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="text-xs text-white/50">
                                                                {kh ? "អាទិភាព" : "PRIORITY"}:
                                                            </div>
                                                            <div className="flex-1 max-w-[200px] h-1 bg-white/20">
                                                                <div
                                                                    className="h-full bg-white"
                                                                    style={{ width: `${route.priority * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-white/70">{route.priority}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {route.children && (
                                                    <ChevronRight size={20} className="text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Children Routes */}
                                    {route.children && (
                                        <div className="ml-4 sm:ml-12 space-y-2">
                                            {route.children.map((child, childIdx) => (
                                                <div
                                                    key={childIdx}
                                                    className="border-l-2 border-white/30 pl-4 sm:pl-6 py-3 hover:border-white/70 transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-white/90 mb-1 break-words">
                                                                {child.name[kh ? "kh" : "en"]}
                                                            </h4>
                                                            <code className="text-xs text-white/50 block break-all">
                                                                {child.path}
                                                            </code>
                                                        </div>
                                                        <span className="text-xs text-white/40 whitespace-nowrap flex-shrink-0">
                                                            L{child.level}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Table Mode */}
                {viewMode === "table" && (
                    <div className="border-2 border-white/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b-2 border-white/30 bg-white text-black">
                                        <th className="px-3 sm:px-4 py-3 font-black uppercase whitespace-nowrap">
                                            {kh ? "កម្រិត" : "LVL"}
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-black uppercase">
                                            {kh ? "ទំព័រ" : "PAGE"}
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-black uppercase whitespace-nowrap hidden sm:table-cell">
                                            {kh ? "ផ្លូវ" : "URL"}
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 font-black uppercase whitespace-nowrap hidden md:table-cell">
                                            {kh ? "អាទិភាព" : "PRIORITY"}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.routes.map((route, idx) => (
                                        <>
                                            <tr key={idx} className="border-b border-white/20 hover:bg-white/5">
                                                <td className="px-3 sm:px-4 py-3 font-mono text-white/70">L{route.level}</td>
                                                <td className="px-3 sm:px-4 py-3 font-bold">{route.name[kh ? "kh" : "en"]}</td>
                                                <td className="px-3 sm:px-4 py-3 font-mono text-white/70 hidden sm:table-cell break-all">
                                                    {route.path}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 font-mono text-white/70 hidden md:table-cell">
                                                    {route.priority || "—"}
                                                </td>
                                            </tr>
                                            {route.children?.map((child, childIdx) => (
                                                <tr
                                                    key={`${idx}-${childIdx}`}
                                                    className="border-b border-white/10 hover:bg-white/5 bg-white/5"
                                                >
                                                    <td className="px-3 sm:px-4 py-3 font-mono text-white/50">L{child.level}</td>
                                                    <td className="px-3 sm:px-4 py-3 text-white/80 pl-6 sm:pl-8">
                                                        ↳ {child.name[kh ? "kh" : "en"]}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 font-mono text-white/50 hidden sm:table-cell break-all">
                                                        {child.path}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 font-mono text-white/50 hidden md:table-cell">—</td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats Footer */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="border-2 border-white/30 p-4 bg-black/50">
                        <div className="text-2xl sm:text-3xl font-black mb-1">
                            {currentData.routes.length}
                        </div>
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                            {kh ? "ផ្លូវចម្បង" : "Main Routes"}
                        </div>
                    </div>
                    <div className="border-2 border-white/30 p-4 bg-black/50">
                        <div className="text-2xl sm:text-3xl font-black mb-1">
                            {currentData.routes.reduce((acc, r) => acc + (r.children?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                            {kh ? "ផ្លូវរង" : "Sub Routes"}
                        </div>
                    </div>
                    <div className="border-2 border-white/30 p-4 bg-black/50">
                        <div className="text-2xl sm:text-3xl font-black mb-1">
                            {currentData.routes.length + currentData.routes.reduce((acc, r) => acc + (r.children?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                            {kh ? "សរុប" : "Total Pages"}
                        </div>
                    </div>
                    <div className="border-2 border-white/30 p-4 bg-black/50">
                        <div className="text-2xl sm:text-3xl font-black mb-1">
                            {Math.max(...currentData.routes.map(r => r.children?.length ? Math.max(...r.children.map(c => c.level)) : r.level))}
                        </div>
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                            {kh ? "កម្រិតជ្រៅ" : "Max Depth"}
                        </div>
                    </div>
                </div>
            </main>

            {/* HUD Footer */}
            <footer className="border-t-2 border-white/20 mt-12 py-6 bg-black/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-xs text-white/50 uppercase tracking-widest">
                        {kh
                            ? "មជ្ឈមណ្ឌលឌីជីថលកេសារារាម • រចនាបានដោយ KWD"
                            : "KESARARAM WITH DIGITAL • SYSTEM MAP V1.0"}
                    </p>
                </div>
            </footer>
        </div>
    );
}
