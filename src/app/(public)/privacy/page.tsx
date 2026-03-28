import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — KWD",
  description: "How KWD collects, uses, and protects your personal information.",
};

const SECTIONS = [
  {
    id: "01",
    title: "Information We Collect",
    content: [
      {
        sub: "Account Information",
        text: "When you register, we collect your name, username, email address, and password (stored as a secure hash). Teachers and admins may also provide a school name and role.",
      },
      {
        sub: "Student Information",
        text: "Student accounts are created by teachers or school administrators. We collect only the display name and username needed to participate in quizzes and track progress. We do not collect date of birth, phone numbers, or home addresses from students.",
      },
      {
        sub: "Usage Data",
        text: "We automatically collect game scores, quiz results, session participation records, and feature usage patterns to improve the platform.",
      },
      {
        sub: "Profile Images",
        text: "If you upload a profile photo, it is stored securely on Cloudinary and served through our proxy to prevent direct URL exposure.",
      },
    ],
  },
  {
    id: "02",
    title: "How We Use Your Information",
    content: [
      {
        sub: "Platform Operation",
        text: "To authenticate users, display leaderboards, track learning progress, run live quiz sessions, and deliver rewards.",
      },
      {
        sub: "Improvement",
        text: "Aggregated, anonymized usage data helps us understand which categories and game modes are most effective so we can improve content quality.",
      },
      {
        sub: "Communication",
        text: "We may send important service notices (e.g., account security alerts). We do not send marketing emails without your explicit consent.",
      },
    ],
  },
  {
    id: "03",
    title: "Children's Privacy",
    content: [
      {
        sub: "Under-13 Policy",
        text: "KWD is designed for use in school environments. Student accounts must be created and managed by a teacher or school administrator — not directly by students under 13. We do not knowingly collect personal information directly from children under 13.",
      },
      {
        sub: "Parental Rights",
        text: "Parents or guardians may contact us to request access to, correction of, or deletion of their child's data at any time.",
      },
    ],
  },
  {
    id: "04",
    title: "Data Storage & Security",
    content: [
      {
        sub: "Storage",
        text: "Data is stored on Neon (PostgreSQL) with encrypted connections. Profile images are stored on Cloudinary with access controls.",
      },
      {
        sub: "Security Measures",
        text: "Passwords are hashed using industry-standard algorithms. Sessions use signed JWT tokens with expiry. All API routes enforce role-based access control.",
      },
      {
        sub: "Breach Notification",
        text: "In the event of a data breach affecting your account, we will notify you promptly via your registered email.",
      },
    ],
  },
  {
    id: "05",
    title: "Your Rights",
    content: [
      {
        sub: "Access & Correction",
        text: "You can view and update your profile information at any time from your account settings.",
      },
      {
        sub: "Deletion",
        text: "You may request deletion of your account and associated data by contacting us. Note that game scores on the public leaderboard may be retained in anonymized form.",
      },
      {
        sub: "Data Portability",
        text: "You may request an export of your personal data in a machine-readable format.",
      },
    ],
  },
  {
    id: "06",
    title: "Third-Party Services",
    content: [
      {
        sub: "Services Used",
        text: "We use Cloudinary (image hosting), Neon (database), and Vercel (hosting). Each has its own privacy policy. We do not sell your data to any third party.",
      },
    ],
  },
  {
    id: "07",
    title: "Changes to This Policy",
    content: [
      {
        sub: "Updates",
        text: "We may update this policy from time to time. The \"Last Updated\" date at the top of this page reflects the most recent revision. Continued use of KWD after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "08",
    title: "Contact Us",
    content: [
      {
        sub: "Get in Touch",
        text: "For privacy-related questions or requests, contact the KWD team at Kesararam Primary School or reach us through the About page.",
      },
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy<br />Policy
          </h1>
          <p className="text-white/50 text-sm">
            Last updated: March 2026 · Applies to KWD — Kesararam With Digital
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 py-10 border-b-2 border-zinc-100">
        <p className="text-zinc-600 text-base leading-relaxed max-w-2xl">
          KWD (Kesararam With Digital) is a driving theory learning platform operated by Kesararam Primary School. We are committed to protecting the privacy of students, teachers, and all users. This policy explains what data we collect, why we collect it, and how we keep it safe.
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/terms" className="text-xs font-black px-4 py-2 bg-black text-yellow-400 border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow: "3px 3px 0 #ca8a04" }}>
            Terms of Service →
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
            {/* Number */}
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-sm" style={{ boxShadow: "3px 3px 0 #000" }}>
              {section.id}
            </div>
            {/* Content */}
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

      {/* Footer note */}
      <div className="border-t-4 border-black bg-zinc-950 py-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-sm">
            © 2026 KWD — Kesararam With Digital · Kesararam Primary School
          </p>
          <div className="flex gap-4 text-xs font-black">
            <Link href="/terms" className="text-yellow-400 hover:underline">Terms of Service</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white">About</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
