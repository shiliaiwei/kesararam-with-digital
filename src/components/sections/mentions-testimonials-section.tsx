"use client";

import { useState } from "react";
import {
  Newspaper,
  ExternalLink,
  Quote,
  Star,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Globe,
  Tv,
  Award,
  Maximize2,
  X,
  Layers,
  Check,
  Bookmark,
  Share2,
  Eye,
  Radio,
} from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape } from "@/components/brand/brand-kit";
import { Marquee } from "@/components/ui/marquee";
import Link from "next/link";

// ── Facebook Logo SVG Component ──
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── Facebook Post Embed Interface ──
export interface FacebookEmbedMention {
  id: string;
  sourceNameEn: string;
  sourceNameKh: string;
  categoryEn: string;
  categoryKh: string;
  titleEn: string;
  titleKh: string;
  summaryEn: string;
  summaryKh: string;
  iframeSrc: string;
  iframeHeight: number;
  postImage: string;
  url: string;
  color: string;
  badgeEn: string;
  badgeKh: string;
}

// ── Press Article Mention Interface ──
export interface PressArticleMention {
  id: string;
  sourceNameEn: string;
  sourceNameKh: string;
  categoryEn: string;
  categoryKh: string;
  titleEn: string;
  titleKh: string;
  summaryEn: string;
  summaryKh: string;
  date: string;
  url: string;
  color: string;
  badgeEn: string;
  badgeKh: string;
  publisherIcon: "mptc" | "global" | "ams" | "tfk" | "cctimes";
}

// ── 1. Facebook Post Embeds Dataset (4 Official Embeds with High-Res Photos) ──
const FACEBOOK_MENTIONS: FacebookEmbedMention[] = [
  {
    id: "fb-1",
    sourceNameEn: "Tech For Kids Academy",
    sourceNameKh: "Tech For Kids Academy (អ្នករៀបចំ)",
    categoryEn: "National Competition Showcase",
    categoryKh: "ការបង្ហាញគម្រោងថ្នាក់ជាតិ",
    titleEn: "Technovation Girls Cambodia 2026 — National Pitch & Project Showcase",
    titleKh: "Technovation Girls Cambodia ២០២៦ — ការបង្ហាញគម្រោង និងការប្រកួត Pitch ថ្នាក់ជាតិ",
    summaryEn:
      "Official coverage of student teams presenting innovative digital solutions at the Technovation Girls Cambodia National Event.",
    summaryKh:
      "ការផ្សាយផ្លូវការពីក្រុមបច្ចេកវិទ្យាកម្ពុជា Technovation Girls ក្នុងការបង្ហាញស្នាដៃឌីជីថល និងដំណោះស្រាយសង្គម។",
    iframeSrc:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2FTechforKidsAcademy%2Fposts%2Fpfbid0hS84WWm8QvQWMoYhr2fZgrEkQxGE2HwoqP84pSAHhun4CpDLfveFW6YVh4L8uPQTl&show_text=true&width=500",
    iframeHeight: 735,
    postImage: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649329/01_h8y0wn.jpg",
    url: "https://web.facebook.com/TechforKidsAcademy/posts/pfbid0hS84WWm8QvQWMoYhr2fZgrEkQxGE2HwoqP84pSAHhun4CpDLfveFW6YVh4L8uPQTl",
    color: "#eab308",
    badgeEn: "National Organizer",
    badgeKh: "អ្នករៀបចំផ្លូវការ",
  },
  {
    id: "fb-2",
    sourceNameEn: "Ministry of Post & Telecommunications (MPTC)",
    sourceNameKh: "ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍ (MPTC)",
    categoryEn: "Government Ministry",
    categoryKh: "ក្រសួងរដ្ឋាភិបាល",
    titleEn: "MPTC Official Coverage of Technovation Girls Cambodia Finals",
    titleKh: "ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍ ផ្សព្វផ្សាយផ្លូវការពីការប្រកួត Technovation Girls",
    summaryEn:
      "Official MPTC Ministry post featuring Secretary of State Chun Vat presiding over the national competition finals.",
    summaryKh:
      "ការផ្សព្វផ្សាយផ្លូវការពីក្រសួង MPTC ដែលមានឯកឧត្តម រដ្ឋលេខាធិការ ជុន វ៉ាត់ អញ្ជើញជាអធិបតីក្នុងពិធីប្រកួតផ្តាច់ព្រ័ត្រ។",
    iframeSrc:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2Fwww.mptc.gov.kh%2Fposts%2Fpfbid0FtuVXjHrwGQVMXLU8Uz7RVXUrVjDBYRq9Ta2NTTYn7nXagBAyTPuDATxKkhtBTxtl&show_text=true&width=500",
    iframeHeight: 650,
    postImage: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649335/08_yluxi1.jpg",
    url: "https://web.facebook.com/www.mptc.gov.kh/posts/pfbid0FtuVXjHrwGQVMXLU8Uz7RVXUrVjDBYRq9Ta2NTTYn7nXagBAyTPuDATxKkhtBTxtl",
    color: "#3b82f6",
    badgeEn: "Official Ministry Post",
    badgeKh: "ក្រសួងរដ្ឋាភិបាល",
  },
  {
    id: "fb-3",
    sourceNameEn: "H.E. Dr. Hang Chuon Naron (Deputy PM & MoEYS Minister)",
    sourceNameKh: "ឯកឧត្តមបណ្ឌិតសភាចារ្យ ហង់ជួន ណារ៉ុន (ឧបនាយករដ្ឋមន្ត្រី)",
    categoryEn: "Minister Endorsement",
    categoryKh: "ការកោតសរសើរពីរដ្ឋមន្ត្រី",
    titleEn: "H.E. Dr. Hang Chuon Naron Commends Technovation Girls Cambodia Winners",
    titleKh: "ឯកឧត្តមបណ្ឌិតសភាចារ្យ ហង់ជួន ណារ៉ុន ឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងអប់រំ ថ្លែងការកោតសរសើរ",
    summaryEn:
      "Minister of Education, Youth and Sport praises young female innovators transforming education through technology.",
    summaryKh:
      "ឯកឧត្តមឧបនាយករដ្ឋមន្ត្រី រដ្ឋមន្ត្រីក្រសួងអប់រំ យុវជន និងកីឡា ថ្លែងការកោតសរសើរដល់យុវតីជ័យលាភីដែលប្រើប្រាស់បច្ចេកវិទ្យា។",
    iframeSrc:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2Fhang.naron%2Fposts%2Fpfbid02hmT9oAT5JMftd798aGDW8HHfjPWK77BatQxw9eWUwBYeui7vsvTrspkaus6TdvDYl&show_text=true&width=500",
    iframeHeight: 725,
    postImage: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649332/02_wozvje.jpg",
    url: "https://web.facebook.com/hang.naron/posts/pfbid02hmT9oAT5JMftd798aGDW8HHfjPWK77BatQxw9eWUwBYeui7vsvTrspkaus6TdvDYl",
    color: "#ef4444",
    badgeEn: "Minister Spotlight",
    badgeKh: "មោទនភាពក្រសួងអប់រំ",
  },
  {
    id: "fb-4",
    sourceNameEn: "Tech For Kids Academy",
    sourceNameKh: "Tech For Kids Academy (អ្នករៀបចំ)",
    categoryEn: "National Champions Announcement",
    categoryKh: "ការប្រកាសជើងឯកថ្នាក់ជាតិ",
    titleEn: "Official Announcement: National Champions & Global Semifinalists 2026",
    titleKh: "ការប្រកាសផ្លូវការ៖ ក្រុមជើងឯកថ្នាក់ជាតិ និងក្រុមឡើងទៅវគ្គពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក",
    summaryEn:
      "Tech For Kids Academy officially celebrates Team KWD's double triumph: National Champion Junior Division & Global Semifinalist.",
    summaryKh:
      "ការប្រកាសអបអរសាទរផ្លូវការដល់ក្រុម KWD ដែលឈ្នះជើងឯកថ្នាក់ជាតិ Junior Division និងឡើងទៅវគ្គពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក។",
    iframeSrc:
      "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fweb.facebook.com%2FTechforKidsAcademy%2Fposts%2Fpfbid02PCe6n6QMRAjwDuFuEaDAmn29iDm6uhq2WF7G4ha5UkHg1Hdxo6iE7ZexPk9PSreal&show_text=true&width=500",
    iframeHeight: 803,
    postImage: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649331/03_zzcanc.png",
    url: "https://web.facebook.com/TechforKidsAcademy/posts/pfbid02PCe6n6QMRAjwDuFuEaDAmn29iDm6uhq2WF7G4ha5UkHg1Hdxo6iE7ZexPk9PSreal",
    color: "#22c55e",
    badgeEn: "National Champions",
    badgeKh: "ជ័យលាភីថ្នាក់ជាតិ",
  },
];

// ── 2. Press & News Articles Dataset (7 Official Links) ──
const PRESS_ARTICLES: PressArticleMention[] = [
  {
    id: "press-1",
    sourceNameEn: "Ministry of Post & Telecommunications (MPTC Portal)",
    sourceNameKh: "ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍ (MPTC Portal)",
    categoryEn: "Government Press",
    categoryKh: "ព័ត៌មានរដ្ឋាភិបាល",
    titleEn: "Secretary of State Chun Vat Presided Over Technovation Girls Cambodia 2026 Finals",
    titleKh: "រដ្ឋលេខាធិការ ជុន វ៉ាត់ អញ្ជើញជាអធិបតីក្នុងពិធីប្រកួត Technovation Girls Cambodia ២០២៦",
    summaryEn:
      "Official news from MPTC covering the national competition event where Team KWD presented their bilingual road safety app.",
    summaryKh:
      "អត្ថបទព័ត៌មានផ្លូវការពីក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍ ស្តីពីការប្រកួតផ្តាច់ព្រ័ត្រថ្នាក់ជាតិ និងការបង្ហាញគម្រោង KWD។",
    date: "July 2026",
    url: "https://mptc.gov.kh/en/2026/07/secretary-of-state-chun-vat-presided-over-the-national-competition-technovation-girls-cambodia-x-future-digital-talents-2026/",
    color: "#3b82f6",
    badgeEn: "Official Portal",
    badgeKh: "គេហទំព័រក្រសួង",
    publisherIcon: "mptc",
  },
  {
    id: "press-2",
    sourceNameEn: "Technovation Worldwide HQ",
    sourceNameKh: "Technovation ពិភពលោក (Global HQ)",
    categoryEn: "Global HQ Announcement",
    categoryKh: "ជ័យលាភីពិភពលោក",
    titleEn: "Technovation 2026 Global Semifinalist Announcement — Junior Division (Team KWD)",
    titleKh: "ការប្រកាសបេក្ខជនពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក Technovation 2026 (ក្រុម KWD)",
    summaryEn:
      "Technovation Global HQ officially recognizes Team KWD from Siem Reap, Cambodia among the 2026 Global Semifinalists.",
    summaryKh:
      "ទីស្នាក់ការកណ្តាល Technovation ពិភពលោក បានប្រកាសផ្លូវការនូវក្រុម KWD ជាក្រុមពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក (Global Semifinalist)។",
    date: "July 2026",
    url: "https://www.technovation.org/blogs/2026-semifinalist-announcement/#junior-kh",
    color: "#eab308",
    badgeEn: "Global Semifinalist",
    badgeKh: "ជ័យលាភីពិភពលោក",
    publisherIcon: "global",
  },
  {
    id: "press-3",
    sourceNameEn: "AMS Education Media",
    sourceNameKh: "អប្សរា មេឌៀ ស៊ែវីស (AMS Education)",
    categoryEn: "National Television & Press",
    categoryKh: "មោទនភាពជាតិ",
    titleEn: "National Pride: Three Cambodian Girls Advance to Global Semifinalists of Technovation 2026",
    titleKh: "មោទនភាពជាតិ៖ យុវតីកម្ពុជា ៣ រូបឡើងទៅវគ្គពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក Technovation 2026",
    summaryEn:
      "AMS Education news feature spotlighting the inspirational journey of young primary school girls from Kesararam Primary School.",
    summaryKh:
      "សារព័ត៌មានអប្សរា AMS ផ្សាយពីមោទនភាពជាតិដែលយុវតីបឋមសិក្សាកេសរារាម សៀមរាប បាននាំយកស្នាដៃកម្ពុជាទៅកាន់ឆាកអន្តរជាតិ។",
    date: "July 2026",
    url: "https://education.ams.com.kh/outstanding-youth/news-award/news/national-pride-three-cambodian-girls-advance-to-the-global-semifinalists-of-technovation-girls-x-future-digital-talents-2026/",
    color: "#ef4444",
    badgeEn: "National Pride",
    badgeKh: "មោទនភាពជាតិ",
    publisherIcon: "ams",
  },
  {
    id: "press-4",
    sourceNameEn: "Tech for Kids Asia Blog",
    sourceNameKh: "Tech for Kids Asia",
    categoryEn: "Regional Partner Feature",
    categoryKh: "សារព័ត៌មានអប់រំ",
    titleEn: "Congratulations to Top 15 National Teams & 3 Global Semifinalists",
    titleKh: "អបអរសាទរក្រុមជ័យលាភី Top 15 ថ្នាក់ជាតិ និង ៣ ក្រុមឡើងទៅវគ្គពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក",
    summaryEn:
      "Official report honoring top tech teams across Cambodia, celebrating Team KWD's National Championship and Global Semifinalist spot.",
    summaryKh:
      "របាយការណ៍ផ្លូវការកោតសរសើរក្រុមបច្ចេកវិទ្យាកម្ពុជា និងអបអរសាទរក្រុម KWD ដែលឈ្នះជើងឯកថ្នាក់ជាតិ និងឡើងទៅវគ្គពិភពលោក។",
    date: "July 2026",
    url: "https://techforkids.asia/en/blog/congratulations-to-the-top-15-national-teams-of-the-technovation-girls-cambodia-x-future-digital-talents-and-the-3-global-semifinalists",
    color: "#22c55e",
    badgeEn: "Regional Partner",
    badgeKh: "ដៃគូអប់រំផ្លូវការ",
    publisherIcon: "tfk",
  },
  {
    id: "press-5",
    sourceNameEn: "The Cambodia China Times (CC Times)",
    sourceNameKh: "សារព័ត៌មានស៊ីស៊ីថាមស៍ (CC Times)",
    categoryEn: "National Press",
    categoryKh: "សារព័ត៌មានជាតិ",
    titleEn: "Team KWD Crowned National Champion & Advances to Global Semifinals",
    titleKh: "ក្រុម KWD ឈ្នះជើងឯកថ្នាក់ជាតិ និងឡើងទៅវគ្គពាក់កណ្តាលផ្តាច់ព្រ័ត្រពិភពលោក",
    summaryEn:
      "CC Times covers Team KWD's victorious journey from Siem Reap to the Technovation Cambodia National Championship stage.",
    summaryKh:
      "សារព័ត៌មានស៊ីស៊ីថាមស៍ ចុះផ្សាយពីជ័យជម្នះរបស់ក្រុម KWD ពីសាលាបឋមសិក្សាកេសរារាម ខេត្តសៀមរាប រហូតដល់ឈ្នះពានជើងឯកថ្នាក់ជាតិ។",
    date: "July 2026",
    url: "https://kh.cc-times.com/posts/30029",
    color: "#a855f7",
    badgeEn: "National Champion",
    badgeKh: "ជើងឯកថ្នាក់ជាតិ",
    publisherIcon: "cctimes",
  },
  {
    id: "press-6",
    sourceNameEn: "The Cambodia China Times (CC Times)",
    sourceNameKh: "សារព័ត៌មានស៊ីស៊ីថាមស៍ (CC Times)",
    categoryEn: "Youth & Tech Innovation",
    categoryKh: "នវានុវត្តន៍យុវជន",
    titleEn: "Technovation Girls Cambodia 2026: Empowering Young Female Innovators",
    titleKh: "Technovation Girls Cambodia ២០២៦៖ នវានុវត្តន៍យុវជន និងការលើកកម្ពស់ឌីជីថល",
    summaryEn:
      "Exploring how young Cambodian girls utilize mobile technology to solve real-world road safety education challenges.",
    summaryKh:
      "ការបង្ហាញពីរបៀបដែលយុវតីកម្ពុជាប្រើប្រាស់បច្ចេកវិទ្យា និងការអប់រំច្នៃប្រឌិត ដើម្បីដោះស្រាយបញ្ហាសហគមន៍ពិតប្រាកដ។",
    date: "July 2026",
    url: "https://kh.cc-times.com/posts/29087",
    color: "#f97316",
    badgeEn: "Youth Empowerment",
    badgeKh: "លើកកម្ពស់យុវតី",
    publisherIcon: "cctimes",
  },
  {
    id: "press-7",
    sourceNameEn: "The Cambodia China Times (CC Times)",
    sourceNameKh: "សារព័ត៌មានស៊ីស៊ីថាមស៍ (CC Times)",
    categoryEn: "Community Feature",
    categoryKh: "ព័ត៌មានសហគមន៍",
    titleEn: "Siem Reap Primary School Girls Build Innovative Road Safety App",
    titleKh: "សិស្សបឋមសិក្សាកេសរារាម សៀមរាប បង្កើតកម្មវិធីសុវត្ថិភាពចរាចរណ៍",
    summaryEn:
      "Special feature on Kesararam Primary School students developing KWD to educate youth across Cambodia on road safety rules.",
    summaryKh:
      "អត្ថបទពិសេសស្តីពីសិស្សសាលាបឋមសិក្សាកេសរារាម បង្កើតថ្នាល់អប់រំសុវត្ថិភាពចរាចរណ៍ពីរភាសាសម្រាប់កុមារកម្ពុជា។",
    date: "June 2026",
    url: "https://kh.cc-times.com/posts/28912?",
    color: "#06b6d4",
    badgeEn: "Siem Reap Spotlight",
    badgeKh: "សៀមរាប",
    publisherIcon: "cctimes",
  },
];

// ── 3. Testimonials Dataset ──
const TESTIMONIALS_DATA = [
  {
    nameEn: "Technovation Mentor",
    nameKh: "គ្រូណែនាំ Technovation",
    roleEn: "Technovation Girls Program",
    roleKh: "កម្មវិធី Technovation Girls",
    quoteEn:
      "These girls didn't just build an app — they built confidence. Watching them go from 'I don't know how' to 'I built this' is the most rewarding thing I've ever been part of.",
    quoteKh:
      "ពួកគេមិនបានបង្កើតតែ app ប៉ុណ្ណោះទេ — ពួកគេបានបង្កើតទំនុកចិត្ត។ ការមើលឃើញការផ្លាស់ប្ដូរពី «ខ្ញុំមិនដឹងទេ» ទៅ «ខ្ញុំបានធ្វើ» ជាបទពិសោធន៍ដ៏មានន័យ ហើយជាមោទនភាពដ៏ធំធេងបំផុត។",
    color: "#eab308",
    rating: 5,
  },
  {
    nameEn: "Primary School Teacher",
    nameKh: "លោកគ្រូ បឋមសិក្សា",
    roleEn: "Kesararam Primary School",
    roleKh: "សាលាបឋមសិក្សាកេសរារាម",
    quoteEn:
      "KWD proves that road safety education can be engaging, bilingual, and student-led. Our students are proud to see their school on a national stage.",
    quoteKh:
      "KWD បញ្ជាក់ថា ការអប់រំចរាចរអាចច្នៃប្រឌិត ២ ភាសា និងដឹកនាំដោយសិស្ស។ សិស្សរបស់យើងមោទនភាពដែលឈ្មោះសាលានៅលើឆាកជាតិ។",
    color: "#22c55e",
    rating: 5,
  },
  {
    nameEn: "Student Learner",
    nameKh: "សិស្សប្រើប្រាស់ KWD",
    roleEn: "KWD Active Student User",
    roleKh: "អ្នកប្រើប្រាស់ KWD",
    quoteEn:
      "I used to be confused by traffic signs. Now I practice every day on KWD and feel confident. The Khmer language support makes everything so clear!",
    quoteKh:
      "ពីការភ័យខ្លាច និងស្រពិចស្រពិលលើសញ្ញាចរាចរ ទៅជាការរៀនរៀងរាល់ថ្ងៃលើ KWD — ភាសាខ្មែរ ច្បាស់ ងាយ យល់ ១០០%។",
    color: "#3b82f6",
    rating: 5,
  },
  {
    nameEn: "Traffic Police Officer",
    nameKh: "មន្ត្រីចរាចរណ៍",
    roleEn: "Traffic Safety Department",
    roleKh: "នាយកដ្ឋានសុវត្ថិភាពចរាចរ",
    quoteEn:
      "We are impressed by this platform. It covers more than we expected from a student project. This kind of education can genuinely prevent road accidents.",
    quoteKh:
      "ប្រព័ន្ធសំណួរ និងប្រភេទវិញ្ញាសា មានស្តង់ដារខ្ពស់ ហួសពីការរំពឹងទុក។ ដំណោះស្រាយអប់រំដ៏ចំគោលដៅ ដែលនឹងកាត់បន្ថយគ្រោះថ្នាក់ចរាចរ។",
    color: "#ef4444",
    rating: 5,
  },
  {
    nameEn: "Parent of Student",
    nameKh: "ឪពុកម្ដាយរបស់សិស្ស",
    roleEn: "Siem Reap Community Parent",
    roleKh: "អាណាព្យាបាលសិស្ស",
    quoteEn:
      "I am so proud of this platform. My child uses it every day to study. The Khmer language makes it easy for our whole family to learn together.",
    quoteKh:
      "ខ្ញុំមោទនភាពពីកម្មវិធីនេះ។ កូនខ្ញុំប្រើរៀងរាល់ថ្ងៃ ហើយយល់ដឹងច្រើនជាមុន។ ភាសាខ្មែរ ជួយឱ្យក្រុមគ្រួសារទាំងមូលរៀនជាមួយគ្នា។",
    color: "#a855f7",
    rating: 5,
  },
];

export function MentionsTestimonialsSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  // Filter & Display States
  const [activeTab, setActiveTab] = useState<"all" | "facebook" | "press" | "testimonials">("all");
  const [fbViewMode, setFbViewMode] = useState<"embed" | "card">("embed");
  const [activeModalEmbed, setActiveModalEmbed] = useState<FacebookEmbedMention | null>(null);

  // Helper for publisher icon
  const getPublisherIcon = (type: PressArticleMention["publisherIcon"]) => {
    switch (type) {
      case "mptc":
        return <Building2 size={16} className="text-blue-600" />;
      case "global":
        return <Globe size={16} className="text-amber-600" />;
      case "ams":
        return <Tv size={16} className="text-red-600" />;
      case "tfk":
        return <Award size={16} className="text-emerald-600" />;
      case "cctimes":
        return <Newspaper size={16} className="text-purple-600" />;
      default:
        return <Newspaper size={16} className="text-zinc-600" />;
    }
  };

  return (
    <section className="bg-white border-b-2 border-black py-14 md:py-20 relative overflow-hidden">
      {/* Top Caution Strip Accent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <CautionTape variant="caution" height={12} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-12">
          <div
            className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-4"
            style={khFont}
          >
            <Newspaper size={14} className="text-amber-400" />
            <span>{kh ? "ប្រព័ន្ធផ្សព្វផ្សាយ និងការសរសើរផ្លូវការ" : "MEDIA MENTIONS & OFFICIAL PRESS SHOWCASE"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black uppercase tracking-tight" style={khFont}>
            {kh ? (
              <>
                សេចក្តីរាយការណ៍ <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">១១ ប្រភព</span> និងមតិគាំទ្រ
              </>
            ) : (
              <>
                FEATURED IN <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">11 OFFICIAL SOURCES</span> & PRESS
              </>
            )}
          </h2>

          <p className="mt-3 text-base sm:text-lg font-medium text-zinc-700 max-w-3xl mx-auto" style={khFont}>
            {kh
              ? "ការផ្សាយផ្លូវការពីក្រសួងប្រៃសណីយ៍ ក្រសួងអប់រំ Technovation ពិភពលោក សារព័ត៌មានជាតិ AMS & CC-Times និង Facebook Posts ផ្លូវការ"
              : "Official coverage from MPTC Ministry, MoEYS Minister H.E. Dr. Hang Chuon Naron, Technovation Global HQ, AMS Education, and CC Times."}
          </p>

          {/* Quick Counter Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono font-bold">
            <span className="bg-amber-100 text-black borde            {/* If View Mode is LIVE EMBED View: Interactive Facebook Iframe Grid */}
            {fbViewMode === "embed" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {FACEBOOK_MENTIONS.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white border-[3px] border-black p-4 sm:p-5 shadow-[6px_6px_0_#000] flex flex-col justify-between relative overflow-hidden h-full"
                  >
                    <div>
                      {/* Header Bar */}
                      <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-600 text-white border border-black flex items-center justify-center shadow-[1px_1px_0_#000]">
                            <FacebookIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-black uppercase text-black" style={khFont}>
                            {kh ? fb.sourceNameKh : fb.sourceNameEn}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0_#000]"
                            style={{ backgroundColor: fb.color, color: "#000" }}
                          >
                            {kh ? fb.badgeKh : fb.badgeEn}
                          </span>
                          
                          <button
                            onClick={() => setActiveModalEmbed(fb)}
                            className="p-1.5 bg-black text-amber-400 border border-black shadow-[2px_2px_0_#000] hover:bg-zinc-800 transition-colors"
                            title={kh ? "មើលទំហំធំ" : "Enlarge View"}
                          >
                            <Maximize2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Post Title */}
                      <h3 className="text-sm sm:text-base font-black text-black leading-snug mb-2" style={khFont}>
                        {kh ? fb.titleKh : fb.titleEn}
                      </h3>
                      <p className="text-xs text-zinc-600 font-medium mb-3 line-clamp-2" style={khFont}>
                        {kh ? fb.summaryKh : fb.summaryEn}
                      </p>

                      {/* Official Facebook High-Res Post Photo Container */}
                      <div className="w-full aspect-[16/9] border-2 border-black bg-zinc-950 overflow-hidden relative mb-3 group">
                        <img
                          src={fb.postImage}
                          alt={fb.titleEn}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black shadow-[2px_2px_0_#000] flex items-center gap-1">
                          <FacebookIcon className="w-3 h-3" /> OFFICIAL POST PHOTO
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Link */}
                    <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-500">
                        VERIFIED FACEBOOK MENTION
                      </span>
                      <a
                        href={fb.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase bg-amber-400 text-black px-3 py-1.5 border border-black shadow-[2px_2px_0_#000] hover:bg-amber-300 transition-all"
                      >
                        <span>{kh ? "មើលលើ Facebook" : "Open Facebook"}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* CARD VIEW: Lightweight Press-Style Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {FACEBOOK_MENTIONS.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white border-[3px] border-black p-4 sm:p-5 shadow-[5px_5px_0_#000] hover:shadow-[7px_7px_0_#000] transition-all hover:-translate-y-1 flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0_#000]"
                          style={{ backgroundColor: fb.color, color: "#000" }}
                        >
                          {kh ? fb.badgeKh : fb.badgeEn}
                        </span>
                        <FacebookIcon className="w-4 h-4 text-blue-600" />
                      </div>

                      {/* Photo Thumbnail */}
                      <div className="w-full aspect-[16/9] border-2 border-black bg-zinc-950 overflow-hidden mb-3">
                        <img
                          src={fb.postImage}
                          alt={fb.titleEn}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <h4 className="text-sm font-black text-black mb-2 leading-tight" style={khFont}>
                        {kh ? fb.titleKh : fb.titleEn}
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4 line-clamp-3" style={khFont}>
                        {kh ? fb.summaryKh : fb.summaryEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-zinc-500" style={khFont}>
                        {kh ? fb.sourceNameKh : fb.sourceNameEn}
                      </span>
                      <a
                        href={fb.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono font-black uppercase text-amber-600 hover:text-black"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ── PART 2: OFFICIAL PRESS & MEDIA ARTICLES (7 LINKS) ── */}
        {(activeTab === "all" || activeTab === "press") && (
          <div className="mb-16 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-black uppercase" style={khFont}>
                <Newspaper size={20} className="text-amber-500" />
                <span>{kh ? "អត្ថបទសារព័ត៌មាន និងគេហទំព័រផ្លូវការ (Press & News Articles)" : "PRESS ARTICLES & OFFICIAL NEWS COVERAGE"}</span>
              </div>
              <div className="text-xs font-mono font-bold text-zinc-500 uppercase">
                {kh ? "៧ ប្រភពអត្ថបទព័ត៌មាន" : "7 OFFICIAL MEDIA ARTICLES"}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRESS_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_#000] hover:shadow-[9px_9px_0_#000] transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Top Accent Strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-2 border-b-2 border-black"
                    style={{ backgroundColor: article.color }}
                  />

                  <div className="pt-2">
                    {/* Category & Badge Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className="inline-block text-[10px] font-mono font-black uppercase px-2.5 py-0.5 border border-black shadow-[1px_1px_0_#000]"
                        style={{ backgroundColor: article.color, color: "#000" }}
                      >
                        {kh ? article.categoryKh : article.categoryEn}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-500">{article.date}</span>
                    </div>

                    {/* Article Publisher Header */}
                    <div className="flex items-center gap-2 mb-3 bg-zinc-50 border border-black p-2">
                      <div className="w-6 h-6 border border-black bg-white flex items-center justify-center shadow-[1px_1px_0_#000]">
                        {getPublisherIcon(article.publisherIcon)}
                      </div>
                      <span className="text-xs font-black text-black uppercase" style={khFont}>
                        {kh ? article.sourceNameKh : article.sourceNameEn}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-base font-black text-black leading-snug mb-3 group-hover:text-amber-600 transition-colors" style={khFont}>
                      {kh ? article.titleKh : article.titleEn}
                    </h3>

                    {/* Summary Snippet */}
                    <p className="text-xs text-zinc-700 font-medium leading-relaxed bg-amber-50/50 border-l-4 border-black p-3 mb-4" style={khFont}>
                      {kh ? article.summaryKh : article.summaryEn}
                    </p>
                  </div>

                  {/* Footer & Action Button */}
                  <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-500" style={khFont}>
                      {kh ? article.badgeKh : article.badgeEn}
                    </span>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nb-btn bg-black text-amber-400 hover:bg-zinc-800 text-[11px] font-mono font-black uppercase px-3 py-1.5 border border-black shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5 transition-all"
                      style={khFont}
                    >
                      <span>{kh ? "អានអត្ថបទពេញ" : "Read Article"}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PART 3: COMMUNITY TESTIMONIALS MARQUEE ── */}
        {(activeTab === "all" || activeTab === "testimonials") && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-black uppercase" style={khFont}>
                <Quote size={20} className="text-amber-500" />
                <span>{kh ? "មតិ និងការវាយតម្លៃពីសហគមន៍ (Community Testimonials)" : "WHAT PEOPLE SAY ABOUT KWD"}</span>
              </div>
              <div className="text-xs font-mono font-bold text-zinc-500 uppercase">
                ★ 5.0 ENDORSEMENTS
              </div>
            </div>

            {/* Testimonial Cards Infinite Motion Marquee */}
            <Marquee pauseOnHover repeat={3} reverse className="[--duration:35s] [--gap:1.5rem]">
              {TESTIMONIALS_DATA.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border-[3px] border-black p-5 sm:p-6 shadow-[5px_5px_0_#000] flex flex-col justify-between min-w-[320px] max-w-[380px] hover:shadow-[7px_7px_0_#000] transition-all hover:-translate-y-1"
                >
                  <div>
                    {/* Quote Icon & Rating Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                        style={{ backgroundColor: item.color }}
                      >
                        <Quote size={18} className="text-black" />
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    {/* Quote Text */}
                    <p className="text-xs sm:text-sm text-zinc-800 font-medium leading-relaxed italic mb-4" style={khFont}>
                      "{kh ? item.quoteKh : item.quoteEn}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-black uppercase" style={khFont}>
                        {kh ? item.nameKh : item.nameEn}
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-500 font-bold" style={khFont}>
                        {kh ? item.roleKh : item.roleEn}
                      </p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="mt-14 bg-amber-400 border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase" style={khFont}>
              {kh ? "ចូលរួមរៀនជាមួយសិស្សកម្ពុជារាប់ពាន់នាក់!" : "Join 1,000+ Students Learning Road Safety!"}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-zinc-800" style={khFont}>
              {kh
                ? "រៀនសញ្ញាចរាចរណ៍ និងច្បាប់ផ្លូវវិថីដោយឥតគិតថ្លៃ ជាមួយ KWD"
                : "Master Cambodian traffic signs and road safety knowledge for free on KWD."}
            </p>
          </div>

          <Link
            href="/learn"
            className="nb-btn bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 border-2 border-black shadow-[3px_3px_0_#000] inline-flex items-center gap-2 transition-all flex-shrink-0"
            style={khFont}
          >
            <span>{kh ? "ចាប់ផ្ដើមរៀនឥឡូវ" : "Start Learning Now"}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* ── MODAL VIEWER FOR FULL FACEBOOK EMBED IFRAME ── */}
      {activeModalEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-[4px] border-black shadow-[12px_12px_0_#000] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
            {/* Modal Header */}
            <div className="bg-amber-400 border-b-3 border-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FacebookIcon className="w-5 h-5 text-black" />
                <h3 className="text-sm font-black uppercase text-black" style={khFont}>
                  {kh ? activeModalEmbed.sourceNameKh : activeModalEmbed.sourceNameEn}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalEmbed(null)}
                className="w-8 h-8 bg-black text-white border-2 border-black flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-zinc-100 flex flex-col items-center">
              <div className="w-full bg-white border-2 border-black p-2 flex justify-center shadow-[4px_4px_0_#000]">
                <iframe
                  src={activeModalEmbed.iframeSrc}
                  width="500"
                  height={activeModalEmbed.iframeHeight}
                  style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={activeModalEmbed.titleEn}
                  className="w-full max-w-[500px]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t-2 border-black p-4 flex items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-zinc-600" style={khFont}>
                {kh ? activeModalEmbed.badgeKh : activeModalEmbed.badgeEn}
              </span>

              <a
                href={activeModalEmbed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-btn bg-blue-600 text-white hover:bg-blue-700 text-xs font-mono font-black uppercase px-4 py-2 border-2 border-black shadow-[3px_3px_0_#000] inline-flex items-center gap-2"
              >
                <span>{kh ? "បើកលើ Facebook ផ្ទាល់" : "Open Direct Post"}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
