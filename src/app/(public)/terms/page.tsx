import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — KWD",
  description: "Terms and conditions for using the KWD driving theory platform.",
};

const SECTIONS = [
  {
    id: "01",
    title: "About KWD",
    content: [
      {
        sub: "The Platform",
        text: "KWD (Kesararam With Digital) is a Cambodia driving theory learning platform operated by Kesararam Primary School. It provides interactive quizzes, flashcards, live game sessions, and a leaderboard to help students prepare for the official driving theory exam.",
      },
      {
        sub: "Acceptance",
        text: "By creating an account or using KWD, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
      },
    ],
  },
  {
    id: "02",
    title: "Accounts & Registration",
    content: [
      {
        sub: "Who Can Register",
        text: "Students, teachers, and school administrators may register. Student accounts for users under 13 must be created by a teacher or school administrator.",
      },
      {
        sub: "Account Responsibility",
        text: "You are responsible for maintaining the confidentiality of your login credentials. Do not share your password. Notify us immediately if you suspect unauthorized access.",
      },
      {
        sub: "Accurate Information",
        text: "You agree to provide accurate information when registering and to keep it up to date.",
      },
    ],
  },
  {
    id: "03",
    title: "Acceptable Use",
    content: [
      {
        sub: "Permitted Use",
        text: "KWD is for educational use — studying Cambodia's driving theory, participating in quizzes, and competing on the leaderboard.",
      },
      {
        sub: "Prohibited Conduct",
        text: "You may not: attempt to cheat or manipulate scores; share quiz answers with other students during live sessions; reverse-engineer or scrape the platform; upload harmful, offensive, or illegal content; impersonate another user or school.",
      },
      {
        sub: "Enforcement",
        text: "Violations may result in account suspension or permanent ban without notice.",
      },
    ],
  },
  {
    id: "04",
    title: "Game Scores & Leaderboard",
    content: [
      {
        sub: "Score Tracking",
        text: "Live game scores are recorded and contribute to your lifetime points and leaderboard ranking. Solo practice scores are not tracked on the public leaderboard.",
      },
      {
        sub: "Leaderboard",
        text: "The leaderboard is public. Your display name and score are visible to all visitors. You may update your display name in account settings.",
      },
      {
        sub: "Score Integrity",
        text: "We reserve the right to remove scores that appear to result from cheating, bugs, or unauthorized manipulation.",
      },
    ],
  },
  {
    id: "05",
    title: "Rewards Program",
    content: [
      {
        sub: "How It Works",
        text: "Students can redeem accumulated points for physical stationery rewards (notebooks, pens, etc.). Redemption is processed through your teacher, who arranges physical delivery.",
      },
      {
        sub: "No Cash Value",
        text: "Points and rewards have no monetary value and cannot be transferred, sold, or exchanged for cash.",
      },
      {
        sub: "Availability",
        text: "Reward availability depends on your school's participation. KWD does not guarantee delivery of physical items — this is managed by your teacher.",
      },
    ],
  },
  {
    id: "06",
    title: "Intellectual Property",
    content: [
      {
        sub: "Platform Content",
        text: "All quiz questions, content, design, and code on KWD are owned by Kesararam Primary School or licensed to it. You may not reproduce, distribute, or create derivative works without written permission.",
      },
      {
        sub: "User Content",
        text: "By uploading a profile photo, you grant KWD a non-exclusive license to display it on the platform.",
      },
    ],
  },
  {
    id: "07",
    title: "Disclaimers & Limitation of Liability",
    content: [
      {
        sub: "No Guarantee",
        text: "KWD is provided \"as is\". We do not guarantee that using KWD will result in passing the official driving theory exam.",
      },
      {
        sub: "Service Availability",
        text: "We aim for high availability but do not guarantee uninterrupted access. Maintenance, updates, or technical issues may cause temporary downtime.",
      },
      {
        sub: "Limitation",
        text: "To the maximum extent permitted by law, KWD and Kesararam Primary School are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
      },
    ],
  },
  {
    id: "08",
    title: "Changes & Termination",
    content: [
      {
        sub: "Changes to Terms",
        text: "We may update these terms at any time. The \"Last Updated\" date reflects the most recent revision. Continued use after changes constitutes acceptance.",
      },
      {
        sub: "Account Termination",
        text: "We reserve the right to suspend or terminate accounts that violate these terms. You may also delete your account at any time from account settings.",
      },
    ],
  },
  {
    id: "09",
    title: "Governing Law",
    content: [
      {
        sub: "Jurisdiction",
        text: "These terms are governed by the laws of the Kingdom of Cambodia. Any disputes shall be resolved through the appropriate Cambodian legal channels.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-black border-b-4 border-yellow-400">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-5 border-2 border-yellow-400">
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            Legal
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-none mb-4">
            Terms of<br />Service
          </h1>
          <p className="text-white/50 text-sm">
            Last updated: March 2026 · Applies to KWD — Kesararam With Digital
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 py-10 border-b-2 border-zinc-100">
        <p className="text-zinc-600 text-base leading-relaxed max-w-2xl">
          Please read these terms carefully before using KWD. By accessing or using the platform, you agree to be bound by these terms. These terms apply to all users — students, teachers, and administrators.
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/privacy" className="text-xs font-black px-4 py-2 bg-black text-yellow-400 border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow: "3px 3px 0 #ca8a04" }}>
            Privacy Policy →
          </Link>
          <Link href="/about" className="text-xs font-black px-4 py-2 bg-white text-black border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow: "3px 3px 0 #000" }}>
            About KWD
          </Link>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <div key={section.id} className="flex gap-6 md:gap-10">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-sm" style={{ boxShadow: "3px 3px 0 #000" }}>
              {section.id}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                {section.title}
              </h2>
              <div className="flex flex-col gap-4">
                {section.content.map((item, i) => (
                  <div key={i}>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-1">{item.sub}</span>
                    <p className="text-sm text-zinc-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-zinc-950 py-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-sm">
            © 2026 KWD — Kesararam With Digital · Kesararam Primary School
          </p>
          <div className="flex gap-4 text-xs font-black">
            <Link href="/privacy" className="text-yellow-400 hover:underline">Privacy Policy</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white">About</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
