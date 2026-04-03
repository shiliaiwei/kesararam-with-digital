"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";

const BASE = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

type Tool = {
  name: string;
  icon: string;
  cat: [string, string];
  use: { en: string; kh: string };
};

const TOOLS: Tool[] = [
  { name: "GitHub",          icon: `${BASE}/github/default.svg`,       cat: ["Dev", "Version Control"],  use: { en: "Source code hosting and collaboration",          kh: "ការបង្ហោះ និងសហការកូដ" } },
  { name: "VS Code",         icon: `${BASE}/vscode/default.svg`,        cat: ["Dev", "Editor"],           use: { en: "Primary code editor for all development",        kh: "កម្មវិធីកែកូដចម្បង" } },
  { name: "Git",             icon: `${BASE}/git/default.svg`,           cat: ["Dev", "Version Control"],  use: { en: "Distributed version control system",             kh: "ការគ្រប់គ្រងកំណែ" } },
  { name: "Next.js",         icon: `${BASE}/nextjs/default.svg`,        cat: ["Dev", "Framework"],        use: { en: "React full-stack framework powering the app",    kh: "ក្របខ័ណ្ឌ React full-stack" } },
  { name: "TypeScript",      icon: `${BASE}/typescript/default.svg`,    cat: ["Dev", "Language"],         use: { en: "Statically typed JavaScript for reliability",    kh: "JavaScript ដែលមានប្រភេទ" } },
  { name: "HTML",            icon: `${BASE}/html5/default.svg`,         cat: ["Dev", "Language"],         use: { en: "Web markup structure",                           kh: "រចនាសម្ព័ន្ធ markup" } },
  { name: "CSS",             icon: `${BASE}/css3/default.svg`,          cat: ["Dev", "Language"],         use: { en: "Web styling and layout",                         kh: "រចនាប័ទ្ម និងប្លង់" } },
  { name: "Tailwind CSS",    icon: `${BASE}/tailwindcss/default.svg`,   cat: ["Dev", "Styling"],          use: { en: "Utility-first CSS framework for UI",             kh: "ក្របខ័ណ្ឌ CSS" } },
  { name: "Neon DB",         icon: `${BASE}/postgresql/default.svg`,    cat: ["Dev", "Database"],         use: { en: "Serverless PostgreSQL database",                 kh: "មូលដ្ឋានទិន្នន័យ" } },
  { name: "Vercel",          icon: `${BASE}/vercel/default.svg`,        cat: ["Dev", "Hosting"],          use: { en: "Deployment and hosting platform",                kh: "វេទិកាដាក់ពង្រាយ" } },
  { name: "Cloudinary",      icon: `${BASE}/cloudinary/default.svg`,    cat: ["Dev", "Media"],            use: { en: "Media storage and CDN delivery",                 kh: "ការផ្ទុករូបភាព CDN" } },
  { name: "Figma",           icon: `${BASE}/figma/default.svg`,         cat: ["Design", "UI"],            use: { en: "UI design and prototyping",                      kh: "ការរចនា UI" } },
  { name: "Affinity",        icon: `${BASE}/affinity/default.svg`,      cat: ["Design", "Graphics"],      use: { en: "Vector and raster graphic design",               kh: "ការរចនាក្រាហ្វិក" } },
  { name: "Vector Magic",    icon: `${BASE}/figma/default.svg`,         cat: ["Design", "Tools"],         use: { en: "Bitmap to vector conversion",                    kh: "បំប្លែង bitmap ទៅ vector" } },
  { name: "Claude AI",       icon: `${BASE}/claude/default.svg`,        cat: ["AI", "Code"],              use: { en: "AI assistant for code and content generation",   kh: "AI ជំនួយការកូដ" } },
  { name: "ChatGPT",         icon: `${BASE}/openai/default.svg`,        cat: ["AI", "Research"],          use: { en: "AI language model for research and writing",     kh: "AI ស្រាវជ្រាវ" } },
  { name: "Gemini",          icon: `${BASE}/gemini/default.svg`,        cat: ["AI", "Multimodal"],        use: { en: "Google AI for multimodal tasks",                 kh: "Google AI" } },
  { name: "Copilot",         icon: `${BASE}/github/default.svg`,        cat: ["AI", "Code"],              use: { en: "AI code completion inside the editor",           kh: "AI បំពេញកូដ" } },
  { name: "Kiro",            icon: `${BASE}/vscode/default.svg`,        cat: ["AI", "IDE"],               use: { en: "AI-powered IDE assistant for development",       kh: "AI IDE assistant" } },
  { name: "Grok",            icon: `${BASE}/x/default.svg`,             cat: ["AI", "Research"],          use: { en: "AI reasoning and analysis",                      kh: "AI វិភាគ" } },
  { name: "Kimi AI",         icon: `${BASE}/openai/default.svg`,        cat: ["AI", "Research"],          use: { en: "Long-context AI assistant",                      kh: "AI context វែង" } },
  { name: "DeepSeek",        icon: `${BASE}/openai/default.svg`,        cat: ["AI", "Code"],              use: { en: "Open-source AI model for coding",                kh: "AI open-source" } },
  { name: "Qwen",            icon: `${BASE}/openai/default.svg`,        cat: ["AI", "Multilingual"],      use: { en: "Alibaba multilingual AI model",                  kh: "AI ពហុភាសា" } },
  { name: "NotebookLM",      icon: `${BASE}/google/default.svg`,        cat: ["AI", "Research"],          use: { en: "Google AI research notebook",                    kh: "AI notebook" } },
  { name: "AI Studio",       icon: `${BASE}/google/default.svg`,        cat: ["AI", "Playground"],        use: { en: "Google AI model playground",                     kh: "Google AI playground" } },
  { name: "Firebase Studio", icon: `${BASE}/firebase/default.svg`,      cat: ["Dev", "Platform"],         use: { en: "Google app development platform",                kh: "វេទិកា Google" } },
  { name: "v0 by Vercel",    icon: `${BASE}/vercel/default.svg`,        cat: ["AI", "UI"],                use: { en: "AI UI component generator",                      kh: "AI UI generator" } },
  { name: "Stitch Google",   icon: `${BASE}/google/default.svg`,        cat: ["AI", "Design"],            use: { en: "Google design-to-code tool",                     kh: "ឧបករណ៍ Google" } },
  { name: "Wisk Google Lab", icon: `${BASE}/google/default.svg`,        cat: ["AI", "Experiment"],        use: { en: "Google experimental AI workspace",               kh: "Google AI workspace" } },
  { name: "Antigravity",     icon: `${BASE}/openai/default.svg`,        cat: ["AI", "Creative"],          use: { en: "Creative AI tool for ideation",                  kh: "AI ច្នៃប្រឌិត" } },
  { name: "Yoanbao",         icon: `${BASE}/openai/default.svg`,        cat: ["AI", "Writing"],           use: { en: "AI writing assistant",                           kh: "AI ជំនួយការសរសេរ" } },
  { name: "YouTube",         icon: `${BASE}/youtube/default.svg`,       cat: ["Reference", "Video"],      use: { en: "Video reference and research",                   kh: "ឯកសារយោងវីដេអូ" } },
  { name: "Pinterest",       icon: `${BASE}/pinterest/default.svg`,     cat: ["Reference", "Design"],     use: { en: "Visual design inspiration",                      kh: "ការបំផុសការរចនា" } },
  { name: "TikTok",          icon: `${BASE}/tiktok/default.svg`,        cat: ["Reference", "Content"],    use: { en: "Short-form content reference",                   kh: "ឯកសារយោងខ្លី" } },
  { name: "X (Twitter)",     icon: `${BASE}/x/default.svg`,             cat: ["Reference", "Community"],  use: { en: "Tech community and announcements",               kh: "សហគមន៍បច្ចេកវិទ្យា" } },
  { name: "Xauhongshe",      icon: `${BASE}/openai/default.svg`,        cat: ["Reference", "Community"],  use: { en: "Chinese developer community",                    kh: "សហគមន៍អ្នកអភិវឌ្ឍន៍" } },
  { name: "Kahoot",          icon: `${BASE}/openai/default.svg`,        cat: ["Reference", "Inspiration"],use: { en: "Inspiration for live quiz mechanics",            kh: "ការបំផុស quiz" } },
  { name: "Ministry of Public Works", icon: `${BASE}/openai/default.svg`, cat: ["Reference", "Authority"], use: { en: "Official Cambodian driving regulation authority", kh: "អាជ្ញាធរបទប្បញ្ញត្តិបើកបរ" } },
  { name: "Cambodia Driving Rule App", icon: `${BASE}/openai/default.svg`, cat: ["Reference", "Content"], use: { en: "Official reference for driving theory content",  kh: "ឯកសារយោងទ្រឹស្ដីបើកបរ" } },
];

const CAT_COLORS: Record<string, string> = {
  Dev:       "bg-blue-50 text-blue-700 border-blue-200",
  AI:        "bg-purple-50 text-purple-700 border-purple-200",
  Design:    "bg-pink-50 text-pink-700 border-pink-200",
  Reference: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function TermsPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const l = kh ? {
    badge: "ឯកសារច្បាប់",
    title: "លក្ខខណ្ឌប្រើប្រាស់",
    subtitle: "ធ្វើបច្ចុប្បន្នភាព: មីនា ២០២៦ — KWD, Kesararam With Digital, Technovation Girls Cambodia",
    privBtn: "គោលការណ៍ភាពឯកជន",
    aboutBtn: "អំពី KWD",
    builtTitle: "បង្កើតដោយប្រើ",
    builtSub: "ឧបករណ៍ បច្ចេកវិទ្យា និងវេទិកាទាំងអស់ដែលបានប្រើក្នុងការបង្កើតគម្រោងនេះ។ ដាក់លើ ដើម្បីអានតួនាទីរបស់វា។",
    usedFor: "ប្រើសម្រាប់",
    footer: "២០២៦ KWD — Kesararam With Digital. សាលាបឋមសិក្សាកេសរារាម. Technovation Girls Cambodia.",
    body: `KWD (Kesararam With Digital) គឺជាវេទិកាសិក្សាទ្រឹស្ដីបើកបររបស់កម្ពុជា ដែលបង្កើតឡើងដោយក្រុមក្មេងស្រីពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls។ វាផ្តល់ការប្រឡងអន្តរកម្ម វគ្គហ្គេមផ្ទាល់ ចំណាត់ថ្នាក់ និងខ្លឹមសារជាភាសាខ្មែរ-អង់គ្លេស ដើម្បីជួយសិស្សត្រៀមប្រឡងទ្រឹស្ដីបើកបរ។

ដោយបង្កើតគណនី ឬប្រើ KWD អ្នកយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។ លក្ខខណ្ឌទាំងនេះអនុវត្តចំពោះអ្នកប្រើទាំងអស់ — សិស្ស គ្រូ និងអ្នកគ្រប់គ្រង។ សិស្ស គ្រូ និងអ្នកគ្រប់គ្រងសាលាអាចចុះឈ្មោះ។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។ អ្នកទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃព័ត៌មានចូល។ កុំចែករំលែកពាក្យសម្ងាត់។

KWD គឺសម្រាប់ការប្រើប្រាស់ក្នុងការអប់រំ — ការសិក្សាទ្រឹស្ដីបើកបររបស់កម្ពុជា ការចូលរួមក្នុងការប្រឡង និងការប្រកួតនៅក្នុងចំណាត់ថ្នាក់។ អ្នកមិនអាចព្យាយាមបន្លំ ឬរៀបចំពិន្ទុ ចែករំលែកចម្លើយ ឬផ្ទុកខ្លឹមសារខុសច្បាប់ ឬក្លែងបន្លំអ្នកប្រើ ឬសាលាផ្សេង។ ការរំលោភអាចនាំឱ្យព្យួរ ឬហាមឃាត់គណនីដោយគ្មានការជូនដំណឹង។

ពិន្ទុហ្គេមផ្ទាល់ត្រូវបានកត់ត្រា និងរួមចំណែកដល់ពិន្ទុអស់មួយជីវិត និងចំណាត់ថ្នាក់។ ចំណាត់ថ្នាក់គឺជាសាធារណៈ — ឈ្មោះបង្ហាញ និងពិន្ទុរបស់អ្នកអាចមើលឃើញដោយអ្នកទស្សនាទាំងអស់។ សិស្សអាចប្តូរពិន្ទុដែលប្រមូលបានសម្រាប់រង្វាន់ប្រដាប់ប្រដាសិក្សា ដែលត្រូវបានដំណើរការតាមរយៈគ្រូ។ ពិន្ទុ និងរង្វាន់គ្មានតម្លៃជាប្រាក់ ហើយមិនអាចផ្ទេរ លក់ ឬប្តូរជាប្រាក់ទេ។

ការប្រឡង ខ្លឹមសារ ការរចនា និងកូដទាំងអស់នៅ KWD ជាកម្មសិទ្ធិរបស់សាលាបឋមសិក្សាកេសរារាម ឬបានទទួលអាជ្ញាប័ណ្ណ។ KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 5 (សមភាពយេនឌ័រ) ដោយផ្តល់ការអប់រំទ្រឹស្ដីបើកបរឥតគិតថ្លៃ ដោយផ្តោតលើការផ្តល់អំណាចដល់ក្មេងស្រីតាមរយៈបច្ចេកវិទ្យា។

KWD ត្រូវបានផ្តល់ដូចដែលវាជា។ យើងមិនធានាថាការប្រើ KWD នឹងនាំឱ្យជាប់ការប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទេ។ លក្ខខណ្ឌទាំងនេះត្រូវបានគ្រប់គ្រងដោយច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។ យើងអាចធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌទាំងនេះ — ការប្រើប្រាស់បន្តបន្ទាប់ពីការផ្លាស់ប្តូរ មានន័យថាការទទួលយក។`,
  } : {
    badge: "Legal Document",
    title: "Terms of Service",
    subtitle: "Last updated: March 2026 — KWD, Kesararam With Digital, Technovation Girls Cambodia",
    privBtn: "Privacy Policy",
    aboutBtn: "About KWD",
    builtTitle: "Built With",
    builtSub: "Every tool, technology, and platform that shaped this project. Hover any item to read its role.",
    usedFor: "Used for",
    footer: "2026 KWD — Kesararam With Digital. Kesararam Primary School. Technovation Girls Cambodia.",
    body: `KWD (Kesararam With Digital) is a Cambodia driving theory learning platform built by a team of young girls from Kesararam Primary School, participating in Technovation Girls. It provides interactive quizzes, live game sessions, a leaderboard, and bilingual content in Khmer and English to help students prepare for the official driving theory exam. This project is submitted to Technovation Girls — a global program empowering girls to become technology entrepreneurs and leaders.

By creating an account or using KWD, you agree to these Terms of Service. They apply to all users — students, teachers, and administrators. Students, teachers, and school administrators may register. Student accounts for users under 13 must be created by a teacher or school administrator, in line with Technovation's child safety guidelines. You are responsible for maintaining the confidentiality of your login credentials. Do not share your password. Notify us immediately if you suspect unauthorized access.

KWD is for educational use — studying Cambodia's driving theory, participating in quizzes, and competing on the leaderboard. You may not attempt to cheat or manipulate scores, share quiz answers during live sessions, reverse-engineer or scrape the platform, upload harmful or illegal content, or impersonate another user or school. Violations may result in account suspension or permanent ban without notice.

Live game scores are recorded and contribute to your lifetime points and leaderboard ranking. The leaderboard is public — your display name and score are visible to all visitors. Students can redeem accumulated points for physical stationery rewards processed through their teacher. Points and rewards have no monetary value and cannot be transferred, sold, or exchanged for cash.

All quiz questions, content, design, and code on KWD are owned by Kesararam Primary School or licensed to it. KWD directly supports SDG 4 (Quality Education) and SDG 5 (Gender Equality) by providing free, accessible driving theory education, centering young Cambodian girls as technology creators. Kesararam is a monastery and primary school — the oldest place of learning in our community. KWD carries that tradition of education into the digital age.

KWD is provided as-is. We do not guarantee that using KWD will result in passing the official driving theory exam. These terms are governed by the laws of the Kingdom of Cambodia. We may update these terms at any time — continued use after changes constitutes acceptance.`,
  };

  return (
    <div
      className="min-h-screen bg-white text-black"
      style={{
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-14 md:py-20">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/brand/kwd-black.png" alt="KWD" width={80} height={80} className="object-contain" unoptimized />
        </div>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 px-3 py-1 rounded-full bg-white/80 mb-4" style={kf}>
            {l.badge}
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-3 text-black" style={kf}>
            {l.title}
          </h1>
          <p className="text-xs text-zinc-400 font-medium" style={kf}>{l.subtitle}</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/privacy" className="text-xs font-black px-4 py-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-colors" style={kf}>{l.privBtn}</Link>
            <Link href="/about" className="text-xs font-black px-4 py-2 border border-black/20 bg-white text-black rounded-full hover:bg-zinc-50 transition-colors" style={kf}>{l.aboutBtn}</Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/10 mb-10" />

        {/* Body — single flowing prose */}
        <div className="space-y-5">
          {l.body.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
              {para}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-black/10 my-14" />

        {/* Built With */}
        <div className="mb-14">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-1" style={kf}>
            {l.builtTitle}
          </h2>
          <p className="text-xs text-zinc-400 font-medium mb-8" style={kf}>{l.builtSub}</p>

          <div className="flex flex-wrap gap-2">
            {TOOLS.map(({ name, icon, cat, use }) => (
              <div key={name} className="relative group">
                {/* Tag */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/12 rounded-full shadow-sm cursor-default select-none transition-all duration-150 group-hover:shadow-md group-hover:border-black/30 group-hover:-translate-y-0.5">
                  <div className="w-3.5 h-3.5 flex-shrink-0">
                    <img
                      src={icon}
                      alt={name}
                      width={14}
                      height={14}
                      loading="lazy"
                      className="object-contain w-full h-full"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-black">{name}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${CAT_COLORS[cat[0]] ?? "bg-zinc-50 text-zinc-500 border-zinc-200"}`}>
                    {cat[0]}
                  </span>
                  <span className="text-[9px] font-medium text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded bg-zinc-50">
                    {cat[1]}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 hidden group-hover:block pointer-events-none">
                  <div className="bg-black text-white text-[10px] font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl max-w-[220px] leading-snug" style={kf}>
                    <span className="text-zinc-400 text-[9px] uppercase tracking-widest block mb-0.5">{l.usedFor}</span>
                    {kh ? use.kh : use.en}
                  </div>
                  <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/kwd-black.png" alt="KWD" width={24} height={24} className="object-contain opacity-40" unoptimized />
            <p className="text-xs text-zinc-400 font-medium" style={kf}>{l.footer}</p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <Link href="/privacy" className="text-zinc-500 hover:text-black transition-colors" style={kf}>{l.privBtn}</Link>
            <Link href="/about" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{l.aboutBtn}</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
