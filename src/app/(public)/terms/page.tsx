"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";

// ─── Tool Stack ───────────────────────────────────────────────────────────────
type Tool = { name: string; fa: string; sub: string; use: { en: string; kh: string } };
type Category = { key: string; label: { en: string; kh: string }; tools: Tool[] };

const CATEGORIES: Category[] = [
  {
    key: "dev",
    label: { en: "Development", kh: "ការអភិវឌ្ឍន៍" },
    tools: [
      { name: "GitHub", fa: "fa-brands fa-github", sub: "Version Control", use: { en: "Source code hosting and collaboration", kh: "ការបង្ហោះ និងសហការកូដ" } },
      { name: "Git", fa: "fa-brands fa-git-alt", sub: "Version Control", use: { en: "Distributed version control system", kh: "ការគ្រប់គ្រងកំណែ" } },
      { name: "VS Code", fa: "fa-solid fa-code", sub: "Editor", use: { en: "Primary code editor for all development", kh: "កម្មវិធីកែកូដចម្បង" } },
      { name: "Next.js", fa: "fa-brands fa-react", sub: "Framework", use: { en: "React full-stack framework powering the app", kh: "ក្របខ័ណ្ឌ React full-stack" } },
      { name: "TypeScript", fa: "fa-solid fa-t", sub: "Language", use: { en: "Statically typed JavaScript for reliability", kh: "JavaScript ដែលមានប្រភេទ" } },
      { name: "Tailwind CSS", fa: "fa-solid fa-wind", sub: "Styling", use: { en: "Utility-first CSS framework for UI", kh: "ក្របខ័ណ្ឌ CSS" } },
      { name: "Neon DB", fa: "fa-solid fa-database", sub: "Database", use: { en: "Serverless PostgreSQL — all user & content data", kh: "មូលដ្ឋានទិន្នន័យ PostgreSQL" } },
      { name: "Vercel", fa: "fa-solid fa-cloud-arrow-up", sub: "Hosting", use: { en: "Deployment and hosting platform", kh: "វេទិកាដាក់ពង្រាយ" } },
      { name: "Cloudinary", fa: "fa-solid fa-cloud", sub: "Media CDN", use: { en: "Media storage and CDN delivery for all assets", kh: "ការផ្ទុករូបភាព CDN" } },
      { name: "Firebase Studio", fa: "fa-brands fa-google", sub: "Platform", use: { en: "Google app development platform", kh: "វេទិកា Google" } },
    ],
  },
  {
    key: "design",
    label: { en: "Design", kh: "ការរចនា" },
    tools: [
      { name: "Figma", fa: "fa-brands fa-figma", sub: "UI Design", use: { en: "UI design and prototyping", kh: "ការរចនា UI" } },
      { name: "Affinity Designer", fa: "fa-solid fa-pen-nib", sub: "Graphics", use: { en: "Vector and raster graphic design", kh: "ការរចនាក្រាហ្វិក" } },
      { name: "Vector Magic", fa: "fa-solid fa-wand-magic-sparkles", sub: "Conversion", use: { en: "Bitmap to vector — all 577 traffic sign images", kh: "បំប្លែង bitmap ទៅ vector" } },
    ],
  },
  {
    key: "ai",
    label: { en: "AI & Research Tools", kh: "AI និងឧបករណ៍ស្រាវជ្រាវ" },
    tools: [
      { name: "Claude AI", fa: "fa-solid fa-robot", sub: "Code & Content", use: { en: "Code generation, content drafting, research", kh: "AI ជំនួយការកូដ និងខ្លឹមសារ" } },
      { name: "ChatGPT", fa: "fa-brands fa-openai", sub: "Research", use: { en: "Research and writing assistance", kh: "AI ស្រាវជ្រាវ និងសរសេរ" } },
      { name: "Gemini", fa: "fa-brands fa-google", sub: "Multimodal", use: { en: "Google multimodal AI model", kh: "Google AI multimodal" } },
      { name: "GitHub Copilot", fa: "fa-solid fa-microchip", sub: "Code", use: { en: "AI code completion inside the editor", kh: "AI បំពេញកូដ" } },
      { name: "Kiro", fa: "fa-solid fa-star", sub: "IDE", use: { en: "AI-powered IDE assistant for development", kh: "AI IDE assistant" } },
      { name: "Grok", fa: "fa-brands fa-x-twitter", sub: "Research", use: { en: "AI reasoning and analysis tool", kh: "AI វិភាគ" } },
      { name: "Kimi AI", fa: "fa-solid fa-brain", sub: "Research", use: { en: "Long-context AI assistant", kh: "AI context វែង" } },
      { name: "DeepSeek", fa: "fa-solid fa-magnifying-glass", sub: "Code", use: { en: "Open-source AI model for coding", kh: "AI open-source" } },
      { name: "Qwen", fa: "fa-solid fa-language", sub: "Multilingual", use: { en: "Alibaba multilingual AI model", kh: "AI ពហុភាសា" } },
      { name: "NotebookLM", fa: "fa-solid fa-book-open", sub: "Research", use: { en: "Google AI research notebook", kh: "AI notebook" } },
      { name: "Google AI Studio", fa: "fa-brands fa-google", sub: "Playground", use: { en: "Google AI model playground", kh: "Google AI playground" } },
      { name: "v0 by Vercel", fa: "fa-solid fa-layer-group", sub: "UI Gen", use: { en: "AI UI component generator", kh: "AI UI generator" } },
    ],
  },
  {
    key: "media",
    label: { en: "Media & Audio", kh: "មេឌៀ និងសំឡេង" },
    tools: [
      { name: "ElevenLabs", fa: "fa-solid fa-microphone", sub: "Voice AI", use: { en: "AI voice generation for English narration", kh: "AI សំឡេងអង់គ្លេស" } },
      { name: "Khmer Audio", fa: "fa-solid fa-headphones", sub: "Original", use: { en: "Original Khmer narration recorded by team", kh: "សំឡេងខ្មែរដើម ថតដោយក្រុម" } },
    ],
  },
  {
    key: "ref",
    label: { en: "Reference & Community", kh: "ឯកសារយោង និងសហគមន៍" },
    tools: [
      { name: "MPWT Cambodia", fa: "fa-solid fa-building-columns", sub: "Authority", use: { en: "Official Cambodian driving regulation authority", kh: "អាជ្ញាធរបទប្បញ្ញត្តិបើកបរ" } },
      { name: "MOI Driving App", fa: "fa-solid fa-car", sub: "Reference", use: { en: "Official MOI driving theory exam app", kh: "ឯកសារយោងប្រឡងបើកបរ" } },
      { name: "YouTube", fa: "fa-brands fa-youtube", sub: "Video", use: { en: "Video reference and research", kh: "ឯកសារយោងវីដេអូ" } },
      { name: "Kahoot", fa: "fa-solid fa-gamepad", sub: "Inspiration", use: { en: "Inspiration for live quiz mechanics", kh: "ការបំផុស quiz" } },
    ],
  },
];

// ─── Bibliography entries ─────────────────────────────────────────────────────
type BibEntry = { num: string; cite: string; url?: string; note: { en: string; kh: string } };
type BibSection = { key: string; title: { en: string; kh: string }; entries: BibEntry[] };

const BIBLIOGRAPHY: BibSection[] = [
  {
    key: "gov",
    title: { en: "1. Official Government Documents", kh: "១. ឯកសាររដ្ឋាភិបាលផ្លូវការ" },
    entries: [
      {
        num: "1.1",
        cite: "Royal Government of Cambodia. (2024). Decree No. 498: Regulation of traffic signals, part 1. Ministry of Public Works and Transport.",
        url: "https://mpwt.gov.kh",
        note: { en: "Primary legal source for all traffic signal content on the KWD platform.", kh: "ប្រភពច្បាប់ចម្បងសម្រាប់ខ្លឹមសារសញ្ញាចរាចរ" },
      },
      {
        num: "1.2",
        cite: "Ministry of Public Works and Transport. (2024). Cambodian road sign manual: PW03 series — Prohibitory signs (R1–R3), warning signs (W1–W2), guidance signs (G4). Royal Government of Cambodia.",
        url: "https://mpwt.gov.kh",
        note: { en: "Official source for all 577 traffic sign entries in the KWD question database.", kh: "ប្រភពផ្លូវការសម្រាប់ចំណូលសញ្ញាចរាចរ ៥៧៧ ក្នុងមូលដ្ឋានទិន្នន័យ" },
      },
      {
        num: "1.3",
        cite: "Royal Government of Cambodia. (2007). Sub-decree No. 209: Prakas on road traffic law. Phnom Penh.",
        url: "https://kh.undp.org",
        note: { en: "Foundational legal framework for road traffic law category content.", kh: "ក្របខ័ណ្ឌច្បាប់មូលដ្ឋានសម្រាប់ប្រភេទច្បាប់ចរាចរ" },
      },
      {
        num: "1.4",
        cite: "Ministry of Interior, Kingdom of Cambodia. (2024). Official Cambodian driving theory examination application [Mobile app]. Google Play Store.",
        url: "https://play.google.com/store/apps/details?id=com.moi.drivingtest",
        note: { en: "Official government reference used to align KWD question formats with the national exam.", kh: "ឯកសារយោងរដ្ឋាភិបាលផ្លូវការ ប្រើដើម្បីតម្រឹមទ្រង់ទ្រាយសំណួរ KWD" },
      },
    ],
  },
  {
    key: "research",
    title: { en: "2. Primary Research & Community Surveys", kh: "២. ការស្រាវជ្រាវចម្បង និងការស្ទង់មតិសហគមន៍" },
    entries: [
      {
        num: "2.1",
        cite: "Kesararam With Digital Team 50777. (2025–2026). Community survey on road safety knowledge gaps [Unpublished raw data]. Kesararam Primary School, Siem Reap.",
        note: { en: "Respondents: students, teachers, parents, and local police. Validated platform content and identified real-world knowledge gaps.", kh: "អ្នកឆ្លើយ: សិស្ស គ្រូ ឪពុកម្តាយ និងប៉ូលីស។ ផ្ទៀងផ្ទាត់ខ្លឹមសារ និងកំណត់គម្លាតចំណេះដឹង" },
      },
      {
        num: "2.2",
        cite: "Kesararam With Digital Team 50777. (2026). Instructor technical security and platform reliability review [Unpublished internal report]. Siem Reap.",
        note: { en: "Security review by instructors with technical expertise prior to public platform launch.", kh: "ការត្រួតពិនិត្យសុវត្ថិភាពដោយគ្រូបង្ហាត់ជំនាញបច្ចេកទេស" },
      },
      {
        num: "2.3",
        cite: "Kesararam With Digital Team 50777. (2026). Educator testing and written feedback sessions [Unpublished feedback records]. Kesararam Primary School.",
        note: { en: "Classroom educators tested the platform before launch. Feedback informed final content and UX refinements.", kh: "គ្រូបង្រៀនបានសាកល្បងវេទិកា។ មតិកែលម្អបានជូនដំណឹងដល់ការកែលម្អ UX" },
      },
      {
        num: "2.4",
        cite: "Institute teacher, Public ICT TVET School. (2026). [Testimonial regarding KWD platform quality and exam alignment].",
        url: "https://www.kesararamwithdigital.tech/about",
        note: { en: "Reviewer noted that KWD question variety matches official exam content.", kh: "អ្នកត្រួតពិនិត្យបានកត់សម្គាល់ថាភាពចម្រុះសំណួរ KWD ត្រូវគ្នានឹងខ្លឹមសារប្រឡងផ្លូវការ" },
      },
      {
        num: "2.5",
        cite: "Traffic Safety Department, Local Police Officer. (2026). [Testimonial regarding KWD educational impact on road safety].",
        url: "https://www.kesararamwithdigital.tech/about",
        note: { en: "Confirmed KWD's educational impact on road safety awareness in the community.", kh: "បញ្ជាក់ពីផលប៉ះពាល់អប់រំរបស់ KWD លើការយល់ដឹងអំពីសុវត្ថិភាពចរាចរ" },
      },
    ],
  },
  {
    key: "competition",
    title: { en: "3. Competition & Program Standards", kh: "៣. ស្តង់ដារការប្រកួត និងកម្មវិធី" },
    entries: [
      {
        num: "3.1",
        cite: "Technovation. (2026). Technovation Girls — Global technology entrepreneurship program for girls.",
        url: "https://technovationchallenge.org/competition/",
        note: { en: "Governing competition framework for KWD submission.", kh: "ក្របខ័ណ្ឌការប្រកួតគ្រប់គ្រងសម្រាប់ការដាក់ស្នើ KWD" },
      },
      {
        num: "3.2",
        cite: "Technovation. (2026). AI in action and junior division curriculum.",
        url: "https://technovationchallenge.org/courses/ai-in-action-curriculum/",
        note: { en: "Curriculum standards followed in KWD platform design.", kh: "ស្តង់ដារកម្មវិធីសិក្សាដែលបានអនុវត្តក្នុងការរចនាវេទិកា KWD" },
      },
      {
        num: "3.3",
        cite: "Technovation. (2026). Child safety and volunteer code of conduct.",
        url: "https://technovationchallenge.org/safety/",
        note: { en: "Child safety standards applied to all KWD user account policies.", kh: "ស្តង់ដារសុវត្ថិភាពកុមារដែលអនុវត្តចំពោះគោលការណ៍គណនីអ្នកប្រើ KWD" },
      },
      {
        num: "3.4",
        cite: "United Nations. (2015). Transforming our world: The 2030 agenda for sustainable development — SDG 4 & SDG 11. UN General Assembly.",
        url: "https://sdgs.un.org/goals",
        note: { en: "KWD directly supports SDG 4 (Quality Education) and SDG 11 (Sustainable Cities).", kh: "KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុងប្រកបដោយចីរភាព)" },
      },
    ],
  },
  {
    key: "platform",
    title: { en: "4. Platform Legal Documents", kh: "៤. ឯកសារច្បាប់វេទិកា" },
    entries: [
      {
        num: "4.1",
        cite: "Kesararam With Digital Team 50777. (2026). Terms of Service. Kesararam With Digital.",
        url: "https://www.kesararamwithdigital.tech/terms",
        note: { en: "Defines content review process, three-tier approval workflow, user roles, data policies, and full development tool stack.", kh: "កំណត់ដំណើរការត្រួតពិនិត្យខ្លឹមសារ លំហូរការអនុម័ត តួនាទីអ្នកប្រើ និងគោលការណ៍ទិន្នន័យ" },
      },
      {
        num: "4.2",
        cite: "Kesararam With Digital Team 50777. (2026). Privacy Policy. Kesararam With Digital.",
        url: "https://www.kesararamwithdigital.tech/privacy",
        note: { en: "Documents data collection practices, child safety standards, Neon DB and Cloudinary storage policies.", kh: "ឯកសារការប្រមូលទិន្នន័យ ស្តង់ដារសុវត្ថិភាពកុមារ គោលការណ៍ Neon DB និង Cloudinary" },
      },
      {
        num: "4.3",
        cite: "Kesararam With Digital Team 50777. (2026). About — Kesararam With Digital.",
        url: "https://www.kesararamwithdigital.tech/about",
        note: { en: "Documents team composition (5 students, 2 mentors), mission, vision, values, SDG alignment, and community testimonials.", kh: "ឯកសារសមាសភាពក្រុម (សិស្ស ៥ នាក់ គ្រូណែនាំ ២ នាក់) បេសកកម្ម ចក្ខុវិស័យ និងតម្លៃ" },
      },
    ],
  },
];

// ─── Subscription Payment Methods ────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    group: { en: "Cambodia Local Banks (KHQR)", kh: "ធនាគារក្នុងស្រុក (KHQR)" },
    color: "#e31837",
    icon: "fa-solid fa-qrcode",
    methods: [
      "ABA Bank", "ACLEDA Bank", "FTB Bank", "Wing Bank",
      "Canadia Bank", "Chip Mong Bank", "Prince Bank", "Vattanac Bank",
      "Cambodian Public Bank", "Maybank Cambodia", "Phillip Bank",
    ],
    note: { en: "All NBC-participating banks via KHQR — instant transfer in USD or KHR", kh: "ធនាគារទាំងអស់ក្នុង NBC តាម KHQR — ផ្ទេរភ្លាមៗជា USD ឬ KHR" },
  },
  {
    group: { en: "International Cards", kh: "កាតអន្តរជាតិ" },
    color: "#1a1f71",
    icon: "fa-brands fa-cc-visa",
    methods: ["Visa", "Mastercard"],
    note: { en: "Credit and debit cards accepted — processed securely", kh: "ទទួលយកកាតឥណទាន និងឥណពន្ធ — ដំណើរការដោយសុវត្ថិភាព" },
  },
  {
    group: { en: "Digital Wallets", kh: "កាបូបឌីជីថល" },
    color: "#003087",
    icon: "fa-brands fa-paypal",
    methods: ["PayPal"],
    note: { en: "PayPal accepted for international subscribers", kh: "ទទួលយក PayPal សម្រាប់អ្នកជាវអន្តរជាតិ" },
  },
];

// ─── Subscription Terms ───────────────────────────────────────────────────────
const SUB_TERMS = {
  en: [
    "Pricing Structure: Standard Teacher Pro rate is $10/month. The 50% discount ($5/month) is active on Web through December 31, 2026.",
    "Annual Package (3 Months Free): Subscribers to 1-year plans receive a 3-month free discount (pay for 9 months): $45/year (Promo) or $90/year (Standard).",
    "School & Institution Structure: Pricing covers public schools, private schools, and training institutes. Public tier is $19/mo ($180/yr), Private tier is $24/mo ($225/yr) under promo.",
    "Billing & Cancellation: Subscriptions are billed monthly or annually. Cancel anytime before the next billing cycle. Active access remains until the current cycle expires.",
    "Payment Methods: Payment is accepted via KHQR (all NBC-participating Cambodian banks), Visa, Mastercard, and PayPal.",
    "Activation & Upgrades: All upgrades are manually assigned by administrators to ensure platform safety. Setup is active within 24 hours of screenshot submission.",
    "Refunds: All fees are non-refundable after platform access is configured, except in cases of technical failure verified by the team.",
    "KWD reserves the right to update pricing with 30 days' advance notice to active subscribers.",
    "For payment issues or billing disputes, contact kesararamwithdigital@gmail.com within 7 days of the charge.",
  ],
  kh: [
    "រចនាសម្ព័ន្ធតម្លៃ៖ តម្លៃធម្មតាសម្រាប់គ្រូ Pro គឺ ១០ ដុល្លារ/ខែ។ ការបញ្ចុះតម្លៃ ៥០% (៥ ដុល្លារ/ខែ) មានប្រសិទ្ធភាពរហូតដល់ថ្ងៃទី ៣១ ខែធ្នូ ឆ្នាំ ២០២៦។",
    "កញ្ចប់ប្រចាំឆ្នាំ (ឥតគិតថ្លៃ ៣ ខែ)៖ ការជាវប្រចាំឆ្នាំទទួលបានការបញ្ចុះតម្លៃ ៣ ខែឥតគិតថ្លៃ៖ ៤៥ ដុល្លារ/ឆ្នាំ (តម្លៃប្រូម៉ូសិន) ឬ ៩០ ដុល្លារ/ឆ្នាំ (តម្លៃធម្មតា)។",
    "រចនាសម្ព័ន្ធសាលា និងស្ថាប័ន៖ តម្លៃគ្របដណ្តប់ទាំងសាលារដ្ឋ សាលាឯកជន និងវិទ្យាស្ថានបណ្តុះបណ្តាល។ ផ្នែកសាលារដ្ឋគឺ ១៩ ដុល្លារ/ខែ (១៨០ ដុល្លារ/ឆ្នាំ) និងសាលាឯកជនគឺ ២៤ ដុល្លារ/ខែ (២២៥ ដុល្លារ/ឆ្នាំ)។",
    "ការទូទាត់ និងការលុបចោល៖ ការជាវត្រូវបានគិតថ្លៃប្រចាំខែ ឬប្រចាំឆ្នាំ។ អ្នកអាចលុបចោលបានគ្រប់ពេលមុនវដ្តបន្ទាប់។ ការចូលប្រើប្រាស់នៅតែមានរហូតដល់ចប់វដ្ត។",
    "វិធីទូទាត់៖ ការទូទាត់ទទួលយកតាម KHQR (ធនាគារក្នុង NBC ទាំងអស់) Visa Mastercard និង PayPal។",
    "ការធ្វើឱ្យសកម្ម៖ ការតម្លើងគណនីត្រូវបានចាត់ចែងដោយដៃដោយ Admin ដើម្បីធានាសុវត្ថិភាព។ គណនីនឹងសកម្មក្នុងរយៈពេល ២៤ ម៉ោងបន្ទាប់ពីផ្ញើវិក្កយបត្រ។",
    "គោលការណ៍សងប្រាក់៖ រាល់ការបង់ប្រាក់មិនអាចដកវិញបានទេបន្ទាប់ពីគណនីត្រូវបានតម្លើង លើកលែងតែករណីមានបញ្ហាបច្ចេកទេសដែលបញ្ជាក់ដោយក្រុមការងារ។",
    "KWD រក្សាសិទ្ធិក្នុងការធ្វើបច្ចុប្បន្នភាពតម្លៃជាមួយការជូនដំណឹង ៣០ ថ្ងៃជាមុនដល់សមាជិកសកម្ម។",
    "សម្រាប់បញ្ហាការទូទាត់ ទំនាក់ទំនង kesararamwithdigital@gmail.com ក្នុងរយៈពេល ៧ ថ្ងៃ។",
  ],
};

// ─── User Adoption Plan ───────────────────────────────────────────────────────
const ADOPTION_PHASES = [
  {
    phase: "1",
    timeline: { en: "Now — Launch", kh: "ឥឡូវ — បើកដំណើរការ" },
    strategy: { en: "Deploy at Kesararam Primary School. Teachers host first live sessions. Students spread through word-of-mouth and public leaderboard competition.", kh: "ដាក់ពង្រាយនៅសាលាបឋមសិក្សាកេសរារាម។ គ្រូបង្ហោះវគ្គផ្ទាល់ដំបូង។ សិស្សផ្សព្វផ្សាយតាមមាត់ និងការប្រកួតចំណាត់ថ្នាក់។" },
    target: { en: "100+ active students · Siem Reap", kh: "សិស្សសកម្ម ១០០+ · សៀមរាប" },
    color: "#eab308",
  },
  {
    phase: "2",
    timeline: { en: "3–6 months · Grow", kh: "៣–៦ ខែ · ពង្រីក" },
    strategy: { en: "Partner with local driving schools, Ministry of Education, local police, and parent networks. Promote through community channels and ICT institutes.", kh: "ភ្ជាប់ជាមួយសាលាបើកបរ ក្រសួងអប់រំ ប៉ូលីស និងបណ្ដាញឪពុកម្តាយ។ ផ្សព្វផ្សាយតាមបណ្ដាញសហគមន៍ និងវិទ្យាស្ថាន ICT។" },
    target: { en: "1,000+ students · National reach", kh: "សិស្ស ១,០០០+ · ទូទាំងប្រទេស" },
    color: "#a855f7",
  },
  {
    phase: "3",
    timeline: { en: "6–12 months · Scale", kh: "៦–១២ ខែ · ពង្រីកទំហំ" },
    strategy: { en: "Onboard Teacher Pro and School plan subscribers. Apply for education and road safety grants. Expand bilingual content. Pursue NGO and government partnerships.", kh: "ទទួលអ្នកជាវ Teacher Pro និង School Plan។ ដាក់ពាក្យសុំជំនួយអប់រំ និងសុវត្ថិភាពចរាចរ។ ពង្រីកខ្លឹមសារពីរភាសា។" },
    target: { en: "Self-sustaining revenue model", kh: "គំរូចំណូលដែលចីរភាព" },
    color: "#22c55e",
  },
];

// ─── Main Terms Body ──────────────────────────────────────────────────────────
const TERMS_SECTIONS = {
  en: [
    {
      heading: "1. About KWD",
      body: "KWD (Kesararam With Digital) is a free, bilingual (Khmer and English) web platform that helps Cambodian learners prepare for the national driving theory exam. Built by a team of five young girls from Kesararam Primary School, Siem Reap, Cambodia, as part of Technovation Girls 2026 — Junior Division, Team #50777. The platform covers all eight official driving theory exam categories: Traffic Signs, Road Traffic Law, Right of Way, Driving Skills, Vehicle Technology, Loading People and Goods, General Knowledge, and Emergency. KWD directly supports UN SDG 4 (Quality Education) and SDG 11 (Sustainable Cities and Communities).",
    },
    {
      heading: "2. Acceptance of Terms",
      body: "By creating an account or using KWD, you agree to these Terms of Service. They apply to all users — students, teachers, and administrators. If you do not agree, do not use the platform. These terms are governed by the laws of the Kingdom of Cambodia.",
    },
    {
      heading: "3. User Accounts & Eligibility",
      body: "Students, teachers, and school administrators may register. Student accounts for users under 13 must be created by a teacher or school administrator, in line with Technovation's child safety guidelines. You are responsible for maintaining the confidentiality of your login credentials. Do not share your password. Notify us immediately if you suspect unauthorized access to your account.",
    },
    {
      heading: "4. Acceptable Use",
      body: "KWD is for educational use — studying Cambodia's driving theory, participating in quizzes, and competing on the leaderboard. You may not attempt to cheat or manipulate scores, share quiz answers during live sessions, reverse-engineer or scrape the platform, upload harmful or illegal content, or impersonate another user or school. Violations may result in account suspension or permanent ban without notice.",
    },
    {
      heading: "5. Scores, Leaderboard & Rewards",
      body: "Live game scores are recorded and contribute to your lifetime points and leaderboard ranking. The leaderboard is public — your display name and score are visible to all visitors. Students can redeem accumulated points for physical stationery rewards processed through their teacher. Points and rewards have no monetary value and cannot be transferred, sold, or exchanged for cash.",
    },
    {
      heading: "6. Subscriptions & Payments",
      body: "KWD operates on a freemium model. Students are permanently free. Teacher Pro ($10/month standard; promo $5/month through end of 2026) and School & Institution plans are available for educators. School/Institution options cover public schools/institutes ($19/month promo) and private schools/institutes ($24/month promo). Annual packages include a 3-month free discount (pay for 9 months). Payment is accepted via KHQR (all NBC-participating Cambodian banks), Visa, Mastercard, and PayPal. Access is activated within 24 hours of confirmed payment. No refunds after access is granted, except in cases of verified technical failure. Subscriptions auto-renew unless cancelled. KWD reserves the right to update pricing with 30 days' advance notice.",
    },
    {
      heading: "7. Content & AI Disclosure",
      body: "All quiz questions, content, design, and code on KWD are owned by Kesararam Primary School or licensed to it. All content was reviewed and verified by the team before publication. AI tools (Claude, ChatGPT, Gemini, Copilot, Kiro, Grok, Kimi, DeepSeek, Qwen, NotebookLM, Google AI Studio, v0) were used for code generation, content drafting, and research. All AI-generated outputs were reviewed, verified, and approved by the team before being published. Official content is sourced from the Ministry of Public Works and Transport (MPWT) and the Ministry of Interior (MOI) of the Kingdom of Cambodia.",
    },
    {
      heading: "8. Content Review Process",
      body: "KWD uses a three-tier content approval workflow: (1) Team members draft and submit content; (2) Mentors and instructors review for accuracy and alignment with official MPWT/MOI sources; (3) Final approval by the team lead before publication. This process ensures all 577+ traffic sign entries and driving theory questions are accurate, current, and aligned with the national exam.",
    },
    {
      heading: "9. Disclaimer & Limitation of Liability",
      body: "KWD is provided as-is. We do not guarantee that using KWD will result in passing the official driving theory exam. We are not liable for any loss or damage arising from use of the platform. The platform is built and maintained by student volunteers — while we strive for accuracy, errors may occur. Always refer to official government sources for legal driving requirements.",
    },
    {
      heading: "10. Changes to These Terms",
      body: "We may update these Terms of Service at any time. Continued use of KWD after changes constitutes acceptance of the updated terms. We will notify active subscribers of material changes via email with at least 14 days' notice.",
    },
  ],
  kh: [
    {
      heading: "១. អំពី KWD",
      body: "KWD (Kesararam With Digital) គឺជាវេទិកាគេហទំព័រឥតគិតថ្លៃ ពីរភាសា (ខ្មែរ និងអង់គ្លេស) ដែលជួយអ្នករៀនខ្មែរត្រៀមប្រឡងទ្រឹស្ដីបើកបរជាតិ។ បង្កើតដោយក្រុមក្មេងស្រីប្រាំនាក់ពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls 2026 — ផ្នែក Junior ក្រុម #50777។ វេទិកានេះគ្របដណ្ដប់ប្រភេទប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទាំង ៨ ។ KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុងប្រកបដោយចីរភាព)។",
    },
    {
      heading: "២. ការទទួលយកលក្ខខណ្ឌ",
      body: "ដោយបង្កើតគណនី ឬប្រើ KWD អ្នកយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។ ពួកវាអនុវត្តចំពោះអ្នកប្រើទាំងអស់ — សិស្ស គ្រូ និងអ្នកគ្រប់គ្រង។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមមិនប្រើវេទិកា។ លក្ខខណ្ឌទាំងនេះត្រូវបានគ្រប់គ្រងដោយច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។",
    },
    {
      heading: "៣. គណនីអ្នកប្រើ និងលក្ខណៈសម្បត្តិ",
      body: "សិស្ស គ្រូ និងអ្នកគ្រប់គ្រងសាលាអាចចុះឈ្មោះ។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។ អ្នកទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃព័ត៌មានចូល។ កុំចែករំលែកពាក្យសម្ងាត់។",
    },
    {
      heading: "៤. ការប្រើប្រាស់ត្រឹមត្រូវ",
      body: "KWD គឺសម្រាប់ការប្រើប្រាស់ក្នុងការអប់រំ។ អ្នកមិនអាចព្យាយាមបន្លំ ឬរៀបចំពិន្ទុ ចែករំលែកចម្លើយ ឬផ្ទុកខ្លឹមសារខុសច្បាប់ ឬក្លែងបន្លំអ្នកប្រើ ឬសាលាផ្សេង។ ការរំលោភអាចនាំឱ្យព្យួរ ឬហាមឃាត់គណនីដោយគ្មានការជូនដំណឹង។",
    },
    {
      heading: "៥. ពិន្ទុ ចំណាត់ថ្នាក់ និងរង្វាន់",
      body: "ពិន្ទុហ្គេមផ្ទាល់ត្រូវបានកត់ត្រា និងរួមចំណែកដល់ពិន្ទុអស់មួយជីវិត និងចំណាត់ថ្នាក់។ ចំណាត់ថ្នាក់គឺជាសាធារណៈ — ឈ្មោះបង្ហាញ និងពិន្ទុរបស់អ្នកអាចមើលឃើញដោយអ្នកទស្សនាទាំងអស់។ ពិន្ទុ និងរង្វាន់គ្មានតម្លៃជាប្រាក់ ហើយមិនអាចផ្ទេរ លក់ ឬប្តូរជាប្រាក់ទេ។",
    },
    {
      heading: "៦. ការជាវ និងការទូទាត់",
      body: "KWD ដំណើរការលើគំរូ freemium។ សិស្សឥតគិតថ្លៃជាអចិន្ត្រៃយ៍។ ផែនការគ្រូ Pro ($10/ខែ តម្លៃធម្មតា; តម្លៃពិសេស $5/ខែ រហូតដល់ចុងឆ្នាំ ២០២៦) និងផែនការសាលា/ស្ថាប័ន មានសម្រាប់គរុកោសល្យ។ ផែនការសាលា/ស្ថាប័នរួមបញ្ចូលសាលារដ្ឋ/វិទ្យាស្ថាន ($19/ខែ តម្លៃពិសេស) និងសាលាឯកជន/វិទ្យាស្ថាន ($24/ខែ តម្លៃពិសេស)។ កញ្ចប់ប្រចាំឆ្នាំរួមបញ្ចូលការបញ្ចុះតម្លៃ ៣ ខែឥតគិតថ្លៃ (បង់ថ្លៃ ៩ ខែ)។ ការទូទាត់ទទួលយកតាម KHQR (ធនាគារ NBC ទាំងអស់) Visa Mastercard និង PayPal។ ការចូលប្រើប្រាស់ត្រូវបានបើកក្នុង ២៤ ម៉ោង។ គ្មានការសងប្រាក់វិញបន្ទាប់ពីការចូលប្រើប្រាស់ត្រូវបានផ្ដល់ លើកលែងតែករណីបច្ចេកទេស។",
    },
    {
      heading: "៧. ខ្លឹមសារ និងការបង្ហាញ AI",
      body: "ខ្លឹមសារ ការរចនា និងកូដទាំងអស់នៅ KWD ជាកម្មសិទ្ធិរបស់សាលាបឋមសិក្សាកេសរារាម ឬបានទទួលអាជ្ញាប័ណ្ណ។ ឧបករណ៍ AI ត្រូវបានប្រើសម្រាប់ការបង្កើតកូដ ការសរសេរខ្លឹមសារ និងការស្រាវជ្រាវ។ លទ្ធផល AI ទាំងអស់ត្រូវបានត្រួតពិនិត្យ ផ្ទៀងផ្ទាត់ និងអនុម័តដោយក្រុមមុនការផ្សព្វផ្សាយ។",
    },
    {
      heading: "៨. ដំណើរការត្រួតពិនិត្យខ្លឹមសារ",
      body: "KWD ប្រើលំហូរការអនុម័តខ្លឹមសារបីកម្រិត: (១) សមាជិកក្រុមរៀបចំ និងដាក់ស្នើខ្លឹមសារ; (២) គ្រូណែនាំ និងគ្រូបង្ហាត់ត្រួតពិនិត្យភាពត្រឹមត្រូវ; (៣) ការអនុម័តចុងក្រោយដោយប្រធានក្រុមមុនការផ្សព្វផ្សាយ។",
    },
    {
      heading: "៩. ការបដិសេធ និងការកំណត់ទំនួលខុសត្រូវ",
      body: "KWD ត្រូវបានផ្ដល់ដូចដែលវាជា។ យើងមិនធានាថាការប្រើ KWD នឹងនាំឱ្យជាប់ការប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទេ។ យើងមិនទទួលខុសត្រូវចំពោះការបាត់បង់ ឬការខូចខាតណាមួយដែលកើតឡើងពីការប្រើប្រាស់វេទិកា។",
    },
    {
      heading: "១០. ការផ្លាស់ប្ដូរលក្ខខណ្ឌ",
      body: "យើងអាចធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌទាំងនេះបានគ្រប់ពេល។ ការប្រើប្រាស់ KWD បន្តបន្ទាប់ពីការផ្លាស់ប្ដូរ មានន័យថាការទទួលយកលក្ខខណ្ឌដែលបានធ្វើបច្ចុប្បន្នភាព។",
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TermsPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const l = {
    badge: kh ? "ឯកសារច្បាប់" : "Legal Document",
    title: kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Service",
    subtitle: kh ? "ធ្វើបច្ចុប្បន្នភាព: មេសា ២០២៦ — KWD · Technovation Girls 2026 · ក្រុម #50777 · Junior Division · សៀមរាប, កម្ពុជា"
      : "Last updated: April 2026 — KWD · Technovation Girls 2026 · Team #50777 · Junior Division · Siem Reap, Cambodia",
    privBtn: kh ? "គោលការណ៍ភាពឯកជន" : "Privacy Policy",
    aboutBtn: kh ? "អំពី KWD" : "About KWD",
    pricingBtn: kh ? "តម្លៃ" : "Pricing",
    builtTitle: kh ? "បង្កើតដោយប្រើ" : "Built With",
    builtSub: kh ? "ឧបករណ៍ បច្ចេកវិទ្យា និងវេទិកាទាំងអស់ដែលបានប្រើក្នុងការបង្កើតគម្រោងនេះ។"
      : "Every tool, technology, and platform that shaped this project.",
    usedFor: kh ? "ប្រើសម្រាប់" : "Used for",
    bibTitle: kh ? "ឯកសារយោង" : "Bibliography",
    bibSub: kh ? "ប្រភពផ្លូវការ ការស្រាវជ្រាវ និងឯកសារយោងទាំងអស់ដែលប្រើក្នុងការបង្កើត KWD"
      : "All official sources, research, and references used in building KWD — Technovation Girls 2026 Submission",
    payTitle: kh ? "វិធីទូទាត់ដែលទទួលយក" : "Accepted Payment Methods",
    paySub: kh ? "ការជាវ Teacher Pro និង School Plan ទទួលយកការទូទាត់ខាងក្រោម"
      : "Teacher Pro and School Plan subscriptions accept the following payment methods",
    subTitle: kh ? "លក្ខខណ្ឌការជាវ" : "Subscription Terms",
    adoptTitle: kh ? "ផែនការទទួលយកអ្នកប្រើ" : "User Adoption Plan",
    adoptSub: kh ? "The Way of Safety — KWD · Technovation Girls 2026 · ក្រុម #50777 · Junior Division · មេសា ២០២៦"
      : "The Way of Safety — KWD · Technovation Girls 2026 · Team #50777 · Junior Division · April 2026",
    impactTitle: kh ? "ផលប៉ះពាល់ដែលរំពឹងទុក" : "Expected Impact",
    footer: kh ? "២០២៦ KWD — Kesararam With Digital · សាលាបឋមសិក្សាកេសរារាម · Technovation Girls Cambodia"
      : "2026 KWD — Kesararam With Digital · Kesararam Primary School · Technovation Girls Cambodia",
  };

  const sections = kh ? TERMS_SECTIONS.kh : TERMS_SECTIONS.en;
  const subTerms = kh ? SUB_TERMS.kh : SUB_TERMS.en;

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossOrigin="anonymous" />

      <div className="min-h-screen bg-white text-black"
        style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-14 md:py-20">

          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Image src="https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg" alt="KWD" width={72} height={72} className="object-contain" unoptimized />
          </div>

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 px-3 py-1 rounded-full bg-white/80 mb-4" style={kf}>
              {l.badge}
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-3 text-black" style={kf}>
              {l.title}
            </h1>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed" style={kf}>{l.subtitle}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/privacy" className="text-xs font-black px-4 py-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-colors" style={kf}>{l.privBtn}</Link>
              <Link href="/about" className="text-xs font-black px-4 py-2 border border-black/20 bg-white text-black rounded-full hover:bg-zinc-50 transition-colors" style={kf}>{l.aboutBtn}</Link>
              <Link href="/pricing" className="text-xs font-black px-4 py-2 border border-black/20 bg-white text-black rounded-full hover:bg-zinc-50 transition-colors" style={kf}>{l.pricingBtn}</Link>
            </div>
          </div>

          <div className="border-t border-black/10 mb-10" />

          {/* ── Terms Sections ── */}
          <div className="space-y-8 mb-14">
            {sections.map((sec, i) => (
              <div key={i}>
                <h2 className="text-base font-black text-black mb-2" style={kf}>{sec.heading}</h2>
                <p className="text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-black/10 mb-14" />

          {/* ── Payment Methods ── */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-1" style={kf}>{l.payTitle}</h2>
            <p className="text-xs text-zinc-400 font-medium mb-8" style={kf}>{l.paySub}</p>
            <div className="space-y-6">
              {PAYMENT_METHODS.map((pm) => (
                <div key={pm.group.en} className="border-2 border-black overflow-hidden" style={{ boxShadow: `4px 4px 0 ${pm.color}` }}>
                  <div className="px-5 py-3 border-b-2 border-black flex items-center gap-3" style={{ backgroundColor: pm.color }}>
                    <i className={`${pm.icon} text-white text-base`} aria-hidden="true" />
                    <span className="font-black text-white text-sm" style={kf}>{kh ? pm.group.kh : pm.group.en}</span>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pm.methods.map((m) => (
                        <span key={m} className="text-xs font-bold px-3 py-1 border border-black/15 rounded-full bg-zinc-50 text-zinc-700">{m}</span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium" style={kf}>{kh ? pm.note.kh : pm.note.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 mb-14" />

          {/* ── Subscription Terms ── */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-8" style={kf}>{l.subTitle}</h2>
            <div className="space-y-3">
              {subTerms.map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0">
                  <span className="text-yellow-500 font-black text-xs mt-0.5 shrink-0 w-5">{i + 1}.</span>
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium" style={kf}>{t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 mb-14" />

          {/* ── User Adoption Plan ── */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-1" style={kf}>{l.adoptTitle}</h2>
            <p className="text-xs text-zinc-400 font-medium mb-8" style={kf}>{l.adoptSub}</p>
            <div className="space-y-4">
              {ADOPTION_PHASES.map((ph) => (
                <div key={ph.phase} className="border-2 border-black overflow-hidden" style={{ boxShadow: `4px 4px 0 ${ph.color}` }}>
                  <div className="px-5 py-3 border-b-2 border-black flex items-center gap-3" style={{ backgroundColor: ph.color }}>
                    <span className="font-black text-black text-xs uppercase tracking-widest" style={kf}>
                      {kh ? `ដំណាក់កាល ${ph.phase} — ${ph.timeline.kh}` : `Phase ${ph.phase} — ${ph.timeline.en}`}
                    </span>
                  </div>
                  <div className="p-5 bg-white">
                    <p className="text-sm text-zinc-700 leading-relaxed font-medium mb-2" style={kf}>
                      {kh ? ph.strategy.kh : ph.strategy.en}
                    </p>
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest border border-black/15 px-2.5 py-1 rounded-full text-zinc-500" style={kf}>
                      {kh ? ph.target.kh : ph.target.en}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Impact Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { stat: "1,200+", label: { en: "Active Students", kh: "សិស្សសកម្ម" } },
                { stat: "8", label: { en: "Knowledge Areas", kh: "ផ្នែកចំណេះដឹង" } },
                { stat: "2", label: { en: "Languages (KH & EN)", kh: "ភាសា (ខ្មែរ & អង់គ្លេស)" } },
                { stat: "Free", label: { en: "Always for Students", kh: "ឥតគិតថ្លៃសម្រាប់សិស្ស" } },
                { stat: "SDG 4", label: { en: "Quality Education", kh: "ការអប់រំប្រកបដោយគុណភាព" } },
                { stat: "SDG 11", label: { en: "Sustainable Cities", kh: "ទីក្រុងប្រកបដោយចីរភាព" } },
              ].map((item) => (
                <div key={item.stat} className="border-2 border-black p-4 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
                  <p className="text-2xl font-black text-black">{item.stat}</p>
                  <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wide" style={kf}>
                    {kh ? item.label.kh : item.label.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 mb-14" />

          {/* ── Built With ── */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-1" style={kf}>{l.builtTitle}</h2>
            <p className="text-xs text-zinc-400 font-medium mb-10" style={kf}>{l.builtSub}</p>
            <div className="space-y-10">
              {CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4" style={kf}>
                    {kh ? cat.label.kh : cat.label.en}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                    {cat.tools.map(({ name, fa, sub, use }) => (
                      <div key={name} className="relative group flex items-center gap-2.5 py-1.5 cursor-default select-none">
                        <i className={`${fa} text-sm text-black w-4 text-center flex-shrink-0`} aria-hidden="true" />
                        <span className="text-sm font-bold text-black leading-none">{name}</span>
                        <span className="text-[9px] font-semibold text-zinc-400 leading-none hidden md:inline">{sub}</span>
                        <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover:block pointer-events-none">
                          <div className="bg-black text-white text-[10px] font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl leading-snug" style={kf}>
                            <span className="text-zinc-400 text-[9px] uppercase tracking-widest block mb-0.5">{l.usedFor}</span>
                            {kh ? use.kh : use.en}
                          </div>
                          <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 mb-14" />

          {/* ── Bibliography ── */}
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black mb-1" style={kf}>{l.bibTitle}</h2>
            <p className="text-xs text-zinc-400 font-medium mb-10" style={kf}>{l.bibSub}</p>
            <div className="space-y-10">
              {BIBLIOGRAPHY.map((section) => (
                <div key={section.key}>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-5 border-b border-black/10 pb-2" style={kf}>
                    {kh ? section.title.kh : section.title.en}
                  </p>
                  <div className="space-y-5">
                    {section.entries.map((entry) => (
                      <div key={entry.num} className="flex gap-3">
                        <span className="text-[10px] font-black text-zinc-300 shrink-0 mt-0.5 w-6">{entry.num}</span>
                        <div>
                          <p className="text-xs text-zinc-600 leading-relaxed font-medium mb-1" style={kf}>{entry.cite}</p>
                          {entry.url && (
                            <a href={entry.url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-blue-500 hover:text-blue-700 font-bold break-all">
                              {entry.url}
                            </a>
                          )}
                          <p className="text-[10px] text-zinc-400 mt-1 italic" style={kf}>
                            {kh ? entry.note.kh : entry.note.en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg" alt="KWD" width={24} height={24} className="object-contain opacity-40" unoptimized />
              <p className="text-xs text-zinc-400 font-medium" style={kf}>{l.footer}</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <Link href="/privacy" className="text-zinc-500 hover:text-black transition-colors" style={kf}>{l.privBtn}</Link>
              <Link href="/about" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{l.aboutBtn}</Link>
              <Link href="/pricing" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{l.pricingBtn}</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
