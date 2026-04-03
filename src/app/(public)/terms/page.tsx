"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";

// ── Tools used to build this project ─────────────────────────────────────────
const TOOLS = [
  { name: "GitHub",        icon: "https://www.thesvg.org/icons/github.svg",        desc: { en: "Version control and source code hosting", kh: "ការគ្រប់គ្រងកូដ និងការបង្ហោះ" } },
  { name: "VS Code",       icon: "https://www.thesvg.org/icons/vscode.svg",         desc: { en: "Primary code editor", kh: "កម្មវិធីកែកូដចម្បង" } },
  { name: "Next.js",       icon: "https://www.thesvg.org/icons/nextjs.svg",         desc: { en: "React full-stack framework", kh: "ក្របខ័ណ្ឌ React full-stack" } },
  { name: "TypeScript",    icon: "https://www.thesvg.org/icons/typescript.svg",     desc: { en: "Statically typed JavaScript", kh: "JavaScript ដែលមានប្រភេទ" } },
  { name: "Tailwind CSS",  icon: "https://www.thesvg.org/icons/tailwindcss.svg",    desc: { en: "Utility-first CSS framework", kh: "ក្របខ័ណ្ឌ CSS" } },
  { name: "Vercel",        icon: "https://www.thesvg.org/icons/vercel.svg",         desc: { en: "Deployment and hosting platform", kh: "វេទិកាដាក់ពង្រាយ" } },
  { name: "Cloudinary",    icon: "https://www.thesvg.org/icons/cloudinary.svg",     desc: { en: "Media storage and CDN delivery", kh: "ការផ្ទុករូបភាព" } },
  { name: "Figma",         icon: "https://www.thesvg.org/icons/figma.svg",          desc: { en: "UI design and prototyping", kh: "ការរចនា UI" } },
  { name: "Git",           icon: "https://www.thesvg.org/icons/git.svg",            desc: { en: "Distributed version control", kh: "ការគ្រប់គ្រងកំណែ" } },
  { name: "HTML",          icon: "https://www.thesvg.org/icons/html5.svg",          desc: { en: "Web markup language", kh: "ភាសា markup" } },
  { name: "CSS",           icon: "https://www.thesvg.org/icons/css3.svg",           desc: { en: "Web styling language", kh: "ភាសា styling" } },
  { name: "Claude AI",     icon: "https://www.thesvg.org/icons/anthropic.svg",      desc: { en: "AI assistant for code and content", kh: "AI ជំនួយការ" } },
  { name: "ChatGPT",       icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "AI language model for research", kh: "AI ស្រាវជ្រាវ" } },
  { name: "Gemini",        icon: "https://www.thesvg.org/icons/google.svg",         desc: { en: "Google AI for multimodal tasks", kh: "Google AI" } },
  { name: "Copilot",       icon: "https://www.thesvg.org/icons/github.svg",         desc: { en: "AI code completion in editor", kh: "AI បំពេញកូដ" } },
  { name: "Kiro",          icon: "https://www.thesvg.org/icons/vscode.svg",         desc: { en: "AI-powered IDE assistant", kh: "AI IDE assistant" } },
  { name: "Neon DB",       icon: "https://www.thesvg.org/icons/postgresql.svg",     desc: { en: "Serverless PostgreSQL database", kh: "មូលដ្ឋានទិន្នន័យ" } },
  { name: "Affinity",      icon: "https://www.thesvg.org/icons/affinity.svg",       desc: { en: "Vector and raster graphic design", kh: "ការរចនាក្រាហ្វិក" } },
  { name: "Grok",          icon: "https://www.thesvg.org/icons/x.svg",              desc: { en: "AI reasoning and analysis", kh: "AI វិភាគ" } },
  { name: "Kimi AI",       icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "Long-context AI assistant", kh: "AI context វែង" } },
  { name: "DeepSeek",      icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "Open-source AI model", kh: "AI open-source" } },
  { name: "Qwen",          icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "Alibaba multilingual AI model", kh: "AI ពហុភាសា" } },
  { name: "NotebookLM",    icon: "https://www.thesvg.org/icons/google.svg",         desc: { en: "Google AI research notebook", kh: "AI notebook" } },
  { name: "AI Studio",     icon: "https://www.thesvg.org/icons/google.svg",         desc: { en: "Google AI model playground", kh: "Google AI playground" } },
  { name: "Firebase Studio", icon: "https://www.thesvg.org/icons/firebase.svg",    desc: { en: "Google app development platform", kh: "វេទិកា Google" } },
  { name: "v0 by Vercel",  icon: "https://www.thesvg.org/icons/vercel.svg",         desc: { en: "AI UI component generator", kh: "AI UI generator" } },
  { name: "Stitch Google", icon: "https://www.thesvg.org/icons/google.svg",         desc: { en: "Google design-to-code tool", kh: "ឧបករណ៍ Google" } },
  { name: "Wisk Google Lab", icon: "https://www.thesvg.org/icons/google.svg",       desc: { en: "Google experimental AI workspace", kh: "Google AI workspace" } },
  { name: "Antigravity",   icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "Creative AI tool", kh: "AI ច្នៃប្រឌិត" } },
  { name: "Vector Magic",  icon: "https://www.thesvg.org/icons/figma.svg",          desc: { en: "Bitmap to vector conversion", kh: "បំប្លែង bitmap ទៅ vector" } },
  { name: "Yoanbao",       icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "AI writing assistant", kh: "AI ជំនួយការសរសេរ" } },
  { name: "Kahoot",        icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "Inspiration for live quiz mechanics", kh: "ការបំផុស quiz" } },
  { name: "YouTube",       icon: "https://www.thesvg.org/icons/youtube.svg",        desc: { en: "Video reference and research", kh: "ឯកសារយោងវីដេអូ" } },
  { name: "Pinterest",     icon: "https://www.thesvg.org/icons/pinterest.svg",      desc: { en: "Visual design inspiration", kh: "ការបំផុសការរចនា" } },
  { name: "TikTok",        icon: "https://www.thesvg.org/icons/tiktok.svg",         desc: { en: "Short-form content reference", kh: "ឯកសារយោងខ្លី" } },
  { name: "X (Twitter)",   icon: "https://www.thesvg.org/icons/x.svg",              desc: { en: "Tech community and announcements", kh: "សហគមន៍បច្ចេកវិទ្យា" } },
  { name: "Xauhongshe",    icon: "https://www.thesvg.org/icons/openai.svg",         desc: { en: "Chinese developer community", kh: "សហគមន៍អ្នកអភិវឌ្ឍន៍" } },
  { name: "Ministry of Public Works", icon: "https://www.thesvg.org/icons/openai.svg", desc: { en: "Official Cambodian driving regulation authority", kh: "អាជ្ញាធរបទប្បញ្ញត្តិបើកបរ" } },
  { name: "Cambodia Driving Rule App", icon: "https://www.thesvg.org/icons/openai.svg", desc: { en: "Official reference for driving theory content", kh: "ឯកសារយោងទ្រឹស្ដីបើកបរ" } },
];

const EN_SECTIONS = [
  { id:"01", title:"About KWD & Technovation", items:[
    { sub:"The Platform", text:"KWD (Kesararam With Digital) is a Cambodia driving theory learning platform built by a team of young girls from Kesararam Primary School, participating in Technovation Girls. It provides interactive quizzes, live game sessions, a leaderboard, and bilingual content in Khmer and English to help students prepare for the official driving theory exam." },
    { sub:"Technovation Girls", text:"This project is submitted to Technovation Girls — a global program empowering girls to become technology entrepreneurs and leaders. Our team follows Technovation's curriculum, submission guidelines, and safety standards." },
    { sub:"Acceptance", text:"By creating an account or using KWD, you agree to these Terms of Service. If you do not agree, please do not use the platform." },
  ]},
  { id:"02", title:"Accounts & Registration", items:[
    { sub:"Who Can Register", text:"Students, teachers, and school administrators may register. Student accounts for users under 13 must be created by a teacher or school administrator, in line with Technovation's child safety guidelines." },
    { sub:"Account Responsibility", text:"You are responsible for maintaining the confidentiality of your login credentials. Do not share your password. Notify us immediately if you suspect unauthorized access." },
    { sub:"Accurate Information", text:"You agree to provide accurate information when registering and to keep it up to date." },
  ]},
  { id:"03", title:"Acceptable Use", items:[
    { sub:"Permitted Use", text:"KWD is for educational use — studying Cambodia's driving theory, participating in quizzes, and competing on the leaderboard." },
    { sub:"Prohibited Conduct", text:"You may not attempt to cheat or manipulate scores, share quiz answers during live sessions, reverse-engineer or scrape the platform, upload harmful or illegal content, or impersonate another user or school." },
    { sub:"Enforcement", text:"Violations may result in account suspension or permanent ban without notice." },
  ]},
  { id:"04", title:"Game Scores & Leaderboard", items:[
    { sub:"Score Tracking", text:"Live game scores are recorded and contribute to your lifetime points and leaderboard ranking. Solo practice scores are not tracked on the public leaderboard." },
    { sub:"Leaderboard", text:"The leaderboard is public. Your display name and score are visible to all visitors. You may update your display name in account settings." },
    { sub:"Score Integrity", text:"We reserve the right to remove scores that appear to result from cheating, bugs, or unauthorized manipulation." },
  ]},
  { id:"05", title:"Rewards Program", items:[
    { sub:"How It Works", text:"Students can redeem accumulated points for physical stationery rewards. Redemption is processed through your teacher, who arranges physical delivery." },
    { sub:"No Cash Value", text:"Points and rewards have no monetary value and cannot be transferred, sold, or exchanged for cash." },
    { sub:"Availability", text:"Reward availability depends on your school's participation. KWD does not guarantee delivery of physical items — this is managed by your teacher." },
  ]},
  { id:"06", title:"Intellectual Property", items:[
    { sub:"Platform Content", text:"All quiz questions, content, design, and code on KWD are owned by Kesararam Primary School or licensed to it. You may not reproduce, distribute, or create derivative works without written permission." },
    { sub:"User Content", text:"By uploading a profile photo, you grant KWD a non-exclusive license to display it on the platform." },
  ]},
  { id:"07", title:"SDG Alignment", items:[
    { sub:"UN Sustainable Development Goals", text:"KWD directly supports SDG 4 (Quality Education) by providing free, accessible driving theory education, and SDG 5 (Gender Equality) by centering young Cambodian girls as technology creators. Our work aligns with the global framework at sdgs.un.org/goals." },
    { sub:"Community Impact", text:"Kesararam is a monastery and primary school — the oldest place of learning in our community. KWD carries that tradition of education into the digital age, ensuring young girls from communities like ours are not just consumers of technology, but creators." },
  ]},
  { id:"08", title:"Disclaimers & Governing Law", items:[
    { sub:"No Guarantee", text:"KWD is provided as-is. We do not guarantee that using KWD will result in passing the official driving theory exam." },
    { sub:"Service Availability", text:"We aim for high availability but do not guarantee uninterrupted access. Maintenance or updates may cause temporary downtime." },
    { sub:"Governing Law", text:"These terms are governed by the laws of the Kingdom of Cambodia. Any disputes shall be resolved through the appropriate Cambodian legal channels." },
    { sub:"Changes", text:"We may update these terms at any time. Continued use after changes constitutes acceptance." },
  ]},
];

const KH_SECTIONS = [
  { id:"០១", title:"អំពី KWD និង Technovation", items:[
    { sub:"វេទិកា", text:"KWD (Kesararam With Digital) គឺជាវេទិកាសិក្សាទ្រឹស្ដីបើកបររបស់កម្ពុជា ដែលបង្កើតឡើងដោយក្រុមក្មេងស្រីពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls។" },
    { sub:"Technovation Girls", text:"គម្រោងនេះត្រូវបានដាក់ស្នើទៅ Technovation Girls — កម្មវិធីសកលដែលផ្តល់អំណាចដល់ក្មេងស្រីឱ្យក្លាយជាអ្នកបង្កើតបច្ចេកវិទ្យា និងអ្នកដឹកនាំ។" },
    { sub:"ការទទួលយក", text:"ដោយបង្កើតគណនី ឬប្រើ KWD អ្នកយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។" },
  ]},
  { id:"០២", title:"គណនី និងការចុះឈ្មោះ", items:[
    { sub:"អ្នកណាអាចចុះឈ្មោះ", text:"សិស្ស គ្រូ និងអ្នកគ្រប់គ្រងសាលាអាចចុះឈ្មោះ។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង។" },
    { sub:"ការទទួលខុសត្រូវគណនី", text:"អ្នកទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃព័ត៌មានចូល។ កុំចែករំលែកពាក្យសម្ងាត់។" },
    { sub:"ព័ត៌មានត្រឹមត្រូវ", text:"អ្នកយល់ព្រមផ្តល់ព័ត៌មានត្រឹមត្រូវនៅពេលចុះឈ្មោះ និងរក្សាវាឱ្យទាន់សម័យ។" },
  ]},
  { id:"០៣", title:"ការប្រើប្រាស់ដែលអាចទទួលយកបាន", items:[
    { sub:"ការប្រើប្រាស់ដែលអនុញ្ញាត", text:"KWD គឺសម្រាប់ការប្រើប្រាស់ក្នុងការអប់រំ — ការសិក្សាទ្រឹស្ដីបើកបររបស់កម្ពុជា ការចូលរួមក្នុងការប្រឡង និងការប្រកួតនៅក្នុងចំណាត់ថ្នាក់។" },
    { sub:"ការប្រព្រឹត្តដែលហាមឃាត់", text:"អ្នកមិនអាចព្យាយាមបន្លំ ឬរៀបចំពិន្ទុ ចែករំលែកចម្លើយ ឬផ្ទុកខ្លឹមសារខុសច្បាប់ ឬក្លែងបន្លំអ្នកប្រើ ឬសាលាផ្សេង។" },
    { sub:"ការអនុវត្ត", text:"ការរំលោភអាចនាំឱ្យព្យួរ ឬហាមឃាត់គណនីដោយគ្មានការជូនដំណឹង។" },
  ]},
  { id:"០៤", title:"ពិន្ទុហ្គេម និងចំណាត់ថ្នាក់", items:[
    { sub:"ការតាមដានពិន្ទុ", text:"ពិន្ទុហ្គេមផ្ទាល់ត្រូវបានកត់ត្រា និងរួមចំណែកដល់ពិន្ទុអស់មួយជីវិត និងចំណាត់ថ្នាក់។" },
    { sub:"ចំណាត់ថ្នាក់", text:"ចំណាត់ថ្នាក់គឺជាសាធារណៈ។ ឈ្មោះបង្ហាញ និងពិន្ទុរបស់អ្នកអាចមើលឃើញដោយអ្នកទស្សនាទាំងអស់។" },
    { sub:"ភាពត្រឹមត្រូវនៃពិន្ទុ", text:"យើងរក្សាសិទ្ធិក្នុងការដកពិន្ទុដែលហាក់ដូចជាបណ្តាលមកពីការបន្លំ ឬការរៀបចំដោយគ្មានការអនុញ្ញាត។" },
  ]},
  { id:"០៥", title:"កម្មវិធីរង្វាន់", items:[
    { sub:"របៀបដំណើរការ", text:"សិស្សអាចប្តូរពិន្ទុដែលប្រមូលបានសម្រាប់រង្វាន់ប្រដាប់ប្រដាសិក្សា។ ការប្តូរត្រូវបានដំណើរការតាមរយៈគ្រូ។" },
    { sub:"គ្មានតម្លៃជាប្រាក់", text:"ពិន្ទុ និងរង្វាន់គ្មានតម្លៃជាប្រាក់ ហើយមិនអាចផ្ទេរ លក់ ឬប្តូរជាប្រាក់ទេ។" },
    { sub:"ភាពអាចរកបាន", text:"ភាពអាចរកបាននៃរង្វាន់អាស្រ័យលើការចូលរួមរបស់សាលា។ KWD មិនធានាការដឹកជញ្ជូនវត្ថុរូបវន្ត។" },
  ]},
  { id:"០៦", title:"កម្មសិទ្ធិបញ្ញា", items:[
    { sub:"ខ្លឹមសារវេទិកា", text:"ការប្រឡង ខ្លឹមសារ ការរចនា និងកូដទាំងអស់នៅ KWD ជាកម្មសិទ្ធិរបស់សាលាបឋមសិក្សាកេសរារាម ឬបានទទួលអាជ្ញាប័ណ្ណ។" },
    { sub:"ខ្លឹមសារអ្នកប្រើ", text:"ដោយផ្ទុករូបភាពប្រវត្តិរូប អ្នកផ្តល់ KWD នូវអាជ្ញាប័ណ្ណមិនផ្តាច់មុខដើម្បីបង្ហាញវានៅលើវេទិកា។" },
  ]},
  { id:"០៧", title:"ការតម្រឹមជាមួយ SDG", items:[
    { sub:"គោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព", text:"KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 5 (សមភាពយេនឌ័រ) ដោយផ្តល់ការអប់រំទ្រឹស្ដីបើកបរឥតគិតថ្លៃ ដោយផ្តោតលើការផ្តល់អំណាចដល់ក្មេងស្រីតាមរយៈបច្ចេកវិទ្យា។" },
    { sub:"ផលប៉ះពាល់សហគមន៍", text:"កេសរារាមគឺជាវត្ត និងសាលាបឋមសិក្សា — កន្លែងសិក្សាចំណាស់បំផុតក្នុងសហគមន៍យើង។ KWD នាំប្រពៃណីអប់រំនោះចូលក្នុងយុគសម័យឌីជីថល។" },
  ]},
  { id:"០៨", title:"ការបដិសេធ និងច្បាប់គ្រប់គ្រង", items:[
    { sub:"គ្មានការធានា", text:"KWD ត្រូវបានផ្តល់ដូចដែលវាជា។ យើងមិនធានាថាការប្រើ KWD នឹងនាំឱ្យជាប់ការប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទេ។" },
    { sub:"ភាពអាចរកបាននៃសេវា", text:"យើងខិតខំរក្សាភាពអាចរកបានខ្ពស់ ប៉ុន្តែមិនធានាការចូលប្រើដោយគ្មានការរំខានទេ។" },
    { sub:"ច្បាប់គ្រប់គ្រង", text:"លក្ខខណ្ឌទាំងនេះត្រូវបានគ្រប់គ្រងដោយច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។" },
    { sub:"ការផ្លាស់ប្តូរ", text:"យើងអាចធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌទាំងនេះ។ ការប្រើប្រាស់បន្តបន្ទាប់ពីការផ្លាស់ប្តូរ មានន័យថាការទទួលយក។" },
  ]},
];

export default function TermsPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const sections = kh ? KH_SECTIONS : EN_SECTIONS;
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const l = {
    en: {
      badge: "Legal Document",
      title: "Terms of Service",
      subtitle: "Last updated: March 2026 — KWD, Kesararam With Digital, Technovation Girls Cambodia",
      intro: "These terms govern your use of KWD. By accessing the platform, you agree to be bound by them. They apply to all users — students, teachers, and administrators — and reflect our commitment to Technovation Girls standards and the UN Sustainable Development Goals.",
      privBtn: "Privacy Policy",
      aboutBtn: "About KWD",
      builtTitle: "Built With",
      builtSub: "Every tool, technology, and platform that shaped this project. Hover any item to read its role.",
      footer: "2026 KWD — Kesararam With Digital. Kesararam Primary School. Technovation Girls Cambodia.",
    },
    kh: {
      badge: "ឯកសារច្បាប់",
      title: "លក្ខខណ្ឌប្រើប្រាស់",
      subtitle: "ធ្វើបច្ចុប្បន្នភាព: មីនា ២០២៦ — KWD, Kesararam With Digital, Technovation Girls Cambodia",
      intro: "លក្ខខណ្ឌទាំងនេះគ្រប់គ្រងការប្រើប្រាស់ KWD របស់អ្នក។ ដោយចូលប្រើវេទិកា អ្នកយល់ព្រមនឹងលក្ខខណ្ឌទាំងនេះ។ លក្ខខណ្ឌទាំងនេះអនុវត្តចំពោះអ្នកប្រើទាំងអស់ — សិស្ស គ្រូ និងអ្នកគ្រប់គ្រង។",
      privBtn: "គោលការណ៍ភាពឯកជន",
      aboutBtn: "អំពី KWD",
      builtTitle: "បង្កើតដោយប្រើ",
      builtSub: "ឧបករណ៍ បច្ចេកវិទ្យា និងវេទិកាទាំងអស់ដែលបានប្រើក្នុងការបង្កើតគម្រោងនេះ។ ដាក់លើ ដើម្បីអានតួនាទីរបស់វា។",
      footer: "២០២៦ KWD — Kesararam With Digital. សាលាបឋមសិក្សាកេសរារាម. Technovation Girls Cambodia.",
    },
  }[kh ? "kh" : "en"];

  return (
    <div
      className="min-h-screen bg-white text-black"
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 27px, #e5e7eb 27px, #e5e7eb 28px),
          repeating-linear-gradient(90deg, transparent, transparent 27px, #f3f4f6 27px, #f3f4f6 28px)
        `,
        backgroundSize: "28px 28px",
      }}
    >
      {/* Paper header */}
      <div className="relative bg-white border-b-4 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/brand/kwd-black.png" alt="KWD" width={120} height={120} className="object-contain" unoptimized />
          </div>
          <div className="text-center mb-6">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] border-2 border-black px-3 py-1 bg-white mb-4" style={kf}>
              {l.badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-3" style={kf}>
              {l.title}
            </h1>
            <p className="text-xs text-zinc-500 font-medium" style={kf}>{l.subtitle}</p>
          </div>
          <div className="border-t-2 border-dashed border-zinc-300 pt-6 max-w-xl mx-auto">
            <p className="text-sm text-zinc-600 leading-relaxed text-center font-medium" style={kf}>{l.intro}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Link href="/privacy" className="text-xs font-black px-4 py-2 bg-black text-white border-2 border-black hover:bg-zinc-800 transition-colors" style={kf}>{l.privBtn}</Link>
              <Link href="/about" className="text-xs font-black px-4 py-2 bg-white text-black border-2 border-black hover:bg-zinc-50 transition-colors" style={kf}>{l.aboutBtn}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white border-2 border-black shadow-[4px_4px_0_#000]">
            {/* Section header */}
            <div className="flex items-stretch border-b-2 border-black">
              <div className="w-12 h-12 bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-black">{section.id}</span>
              </div>
              <div className="flex-1 px-4 flex items-center">
                <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-black" style={kf}>{section.title}</h2>
              </div>
            </div>
            {/* Section body */}
            <div className="p-4 md:p-6 flex flex-col gap-4">
              {section.items.map((item, i) => (
                <div key={i} className="border-l-2 border-zinc-200 pl-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-1" style={kf}>{item.sub}</span>
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium" style={kf}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Built With section */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-10">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000]">
          <div className="flex items-stretch border-b-2 border-black">
            <div className="w-12 h-12 bg-black flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-black">BW</span>
            </div>
            <div className="flex-1 px-4 flex items-center">
              <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-black" style={kf}>{l.builtTitle}</h2>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-xs text-zinc-500 font-medium mb-5 border-l-2 border-zinc-200 pl-4" style={kf}>{l.builtSub}</p>
            <div className="flex flex-wrap gap-3">
              {TOOLS.map(({ name, icon, desc }) => (
                <div key={name} className="relative group">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black bg-white cursor-default select-none transition-all duration-100 group-hover:bg-black group-hover:shadow-[2px_2px_0_#000]">
                    <div className="w-4 h-4 flex-shrink-0 relative">
                      <Image
                        src={icon}
                        alt={name}
                        width={16}
                        height={16}
                        className="object-contain group-hover:invert"
                        unoptimized
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wide group-hover:text-white">{name}</span>
                  </div>
                  <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover:block pointer-events-none">
                    <div className="bg-black text-white text-[10px] font-bold px-3 py-1.5 whitespace-nowrap border border-black shadow-[2px_2px_0_#555] max-w-[240px] leading-snug" style={kf}>
                      {kh ? desc.kh : desc.en}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-black py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/kwd-black.png" alt="KWD" width={32} height={32} className="object-contain invert" unoptimized />
            <p className="text-zinc-400 text-xs font-medium" style={kf}>{l.footer}</p>
          </div>
          <div className="flex gap-4 text-xs font-black">
            <Link href="/privacy" className="text-white hover:text-zinc-300 transition-colors" style={kf}>{l.privBtn}</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white transition-colors" style={kf}>{l.aboutBtn}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
