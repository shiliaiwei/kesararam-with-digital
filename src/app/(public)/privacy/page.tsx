"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";

// ── 9 sections verbatim from KWD_គោលការណ៍ភាពឯកជន.txt ────────────────────────
const SECTIONS = [
  {
    id: "s1",
    num: "១",
    heading: { kh: "សេចក្ដីផ្ដើម", en: "Introduction" },
    kh: "KWD (kesararamwithdigital.tech) ប្ដេជ្ញាការពារភាពឯកជនរបស់សិស្ស គ្រូ និងអ្នកប្រើប្រាស់ទាំងអស់។ គោលការណ៍នេះពន្យល់ពីព័ត៌មានដែលយើងប្រមូល របៀបយើងប្រើ និងរបៀបយើងការពារវា ស្របតាមស្តង់ដារសុវត្ថិភាព Technovation និងគោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព (SDG) របស់អង្គការសហប្រជាជាតិ។",
    en: "KWD (kesararamwithdigital.tech) is committed to protecting the privacy of students, teachers, and all users. This policy explains what information we collect, how we use it, and how we protect it — in alignment with Technovation's safety standards and the United Nations Sustainable Development Goals (SDG).",
  },
  {
    id: "s2",
    num: "២",
    heading: { kh: "ព័ត៌មានដែលយើងប្រមូល", en: "Information We Collect" },
    kh: "យើងប្រមូលតែព័ត៌មានចាំបាច់៖\n\n• គណនី៖ ឈ្មោះ ឈ្មោះអ្នកប្រើ អ៊ីមែល និងពាក្យសម្ងាត់ (រក្សាទុកជាលេខកូដសុវត្ថិភាព)\n• Google (បើប្រើ)៖ លេខសម្គាល់ Google អ៊ីមែល ឈ្មោះ និងរូបភាព\n• សាលា៖ ឈ្មោះសាលា ខេត្ត ថ្នាក់ និងបន្ទប់\n• សកម្មភាព៖ ពិន្ទុ លទ្ធផលប្រឡង ចំនួនលេង រង្វាន់ និងកំណត់ត្រាចូលប្រើ",
    en: "We collect only what is necessary:\n\n• Account: Name, username, email, and password (stored as a secure hash)\n• Google (if used): Google ID, email, name, and profile photo\n• School: School name, province, grade, and classroom\n• Activity: Scores, exam results, number of plays, rewards, and access records",
  },
  {
    id: "s3",
    num: "៣",
    heading: { kh: "របៀបប្រើប្រាស់ព័ត៌មាន", en: "How We Use Information" },
    kh: "យើងប្រើព័ត៌មានដើម្បីផ្ទៀងផ្ទាត់អ្នកប្រើ បង្ហាញចំណាត់ថ្នាក់ តាមដានវឌ្ឍនភាព ដំណើរការវគ្គប្រឡង និងផ្ដល់រង្វាន់។ ទិន្នន័យអនាមិក (មិនបង្ហាញអត្តសញ្ញាណ) ជួយយើងកែលម្អខ្លឹមសារ។ យើងអាចផ្ញើការជូនដំណឹងសំខាន់ (ដូចជាសុវត្ថិភាពគណនី) ប៉ុន្តែមិនផ្ញើអ៊ីមែលទីផ្សារដោយគ្មានការយល់ព្រមរបស់អ្នកទេ។",
    en: "We use information to verify users, display rankings, track progress, run exam sessions, and award rewards. Anonymous (non-identifying) data helps us improve content. We may send important notifications (such as account security alerts) but will not send marketing emails without your consent.",
  },
  {
    id: "s4",
    num: "៤",
    heading: { kh: "ភាពឯកជននៃប្រវត្តិរូប", en: "Profile Privacy & Your Controls" },
    kh: "សិស្សអាចកំណត់ប្រវត្តិរូបជា សាធារណៈ ឬ ឯកជន ហើយជ្រើសរើសព័ត៌មានណាដែលត្រូវបង្ហាញ (ឈ្មោះ ឈ្មោះអ្នកប្រើ សាលា ខេត្ត ថ្នាក់ បន្ទប់ និងស្ថិតិ)។ ពេល ឯកជន ប្រវត្តិរូបត្រូវលាក់ពីសាធារណៈ។ អ្នកអាចប្ដូរការកំណត់នេះបានគ្រប់ពេលក្នុងការកំណត់គណនី។",
    en: "Students may set their profile to Public or Private and choose which information to display (name, username, school, province, grade, classroom, and statistics). When set to Private, the profile is hidden from the public. You may change this setting at any time in your account settings.",
  },
  {
    id: "s5",
    num: "៥",
    heading: { kh: "ភាពឯកជនរបស់កុមារ", en: "Children's Privacy" },
    kh: "KWD ត្រូវបានរចនាសម្រាប់បរិយាកាសសាលា។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំ ត្រូវបង្កើតណែនាំដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។ ឪពុកម្ដាយ ឬអាណាព្យាបាលអាចស្នើសុំចូលមើល កែ ឬលុបទិន្នន័យកូនរបស់ខ្លួន។",
    en: "KWD is designed for school environments. Student accounts for users under 13 years of age must be created by a teacher or administrator, in accordance with Technovation's child safety guidelines. Parents or guardians may request to view, edit, or delete their child's data.",
  },
  {
    id: "s6",
    num: "៦",
    heading: { kh: "ការរក្សាទុក និងសុវត្ថិភាព", en: "Data Storage & Security" },
    kh: "ទិន្នន័យត្រូវរក្សាទុកនៅ Neon (PostgreSQL) ជាមួយការភ្ជាប់ដែលបានអ៊ិនគ្រីប ហើយរូបភាពនៅ Cloudinary។ ពាក្យសម្ងាត់ត្រូវបម្លែងជាកូដ (hash) ប្រើ JWT មានកំណត់ពេល និង API អនុវត្តការគ្រប់គ្រងតាមតួនាទី។ ក្នុងករណីមានការបំពានទិន្នន័យ យើងនឹងជូនដំណឹងអ្នកភ្លាមៗតាមអ៊ីមែលដែលបានចុះឈ្មោះ។",
    en: "Data is stored on Neon (PostgreSQL) with encrypted connections, and images on Cloudinary. Passwords are hashed, sessions use time-limited JWT tokens, and all API routes enforce role-based access control. In the event of a data breach, we will notify you immediately via your registered email address.",
  },
  {
    id: "s7",
    num: "៧",
    heading: { kh: "ការចែករំលែក និងភាគីទីបី", en: "Data Sharing & Third Parties" },
    kh: "យើងមិនលក់ទិន្នន័យរបស់អ្នកទៅភាគីទីបីណាមួយឡើយ។ យើងប្រើសេវាកម្មជឿទុកចិត្ត (Neon, Cloudinary, Vercel) ដែលនីមួយៗមានគោលការណ៍ភាពឯកជនផ្ទាល់ខ្លួន។ ព័ត៌មានសិស្សត្រូវចែករំលែកតែជាមួយគ្រូ ឬសាលាដែលគ្រប់គ្រងគណនីប៉ុណ្ណោះ។",
    en: "We do not sell your data to any third party. We use trusted services (Neon, Cloudinary, Vercel), each with their own privacy policies. Student information is shared only with the teacher or school that manages the account.",
  },
  {
    id: "s8",
    num: "៨",
    heading: { kh: "សិទ្ធិរបស់អ្នក", en: "Your Rights" },
    kh: "អ្នកអាចមើល និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រវត្តិរូបបានគ្រប់ពេលក្នុងការកំណត់គណនី។ អ្នកអាចស្នើសុំលុបគណនី និងទិន្នន័យពាក់ព័ន្ធ — ប៉ុន្តែពិន្ទុក្នុងចំណាត់ថ្នាក់សាធារណៈអាចត្រូវរក្សាទុកក្នុងទម្រង់អនាមិក។",
    en: "You may view and update your profile information at any time in your account settings. You may request deletion of your account and associated data — however, scores on the public leaderboard may be retained in anonymous form.",
  },
  {
    id: "s9",
    num: "៩",
    heading: { kh: "ការផ្លាស់ប្ដូរ និងទំនាក់ទំនង", en: "Changes & Contact" },
    kh: "យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍នេះបានគ្រប់ពេល; ការប្រើប្រាស់បន្តមានន័យថាការទទួលយកគោលការណ៍ថ្មី។ សម្រាប់សំណួរទាក់ទងភាពឯកជន សូមទំនាក់ទំនងតាម Email kesararamwithdigital@gmail.com។",
    en: "We may update this policy at any time; continued use of the platform constitutes acceptance of the revised policy. For privacy-related enquiries, please contact us at kesararamwithdigital@gmail.com.",
  },
];

export default function PrivacyPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">

      {/* Header */}
      <header className="border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[10px] font-mono text-zinc-400 mb-3 uppercase tracking-widest">
            {kh ? "ឯកសារច្បាប់" : "Legal Document"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900" style={kf}>
            {kh ? "គោលការណ៍ភាពឯកជន KWD" : "KWD Privacy Policy"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-xl leading-relaxed" style={kf}>
            {kh
              ? "KWD ប្ដេជ្ញាការពារភាពឯកជនរបស់សិស្ស គ្រូ និងអ្នកប្រើប្រាស់ទាំងអស់។"
              : "KWD is committed to protecting the privacy of every student, teacher, and user on our platform."}
          </p>
          <p className="mt-3 text-xs text-zinc-400 font-mono">
            {kh
              ? "ធ្វើបច្ចុប្បន្នភាព មិថុនា ២០២៦ · KWD · Technovation Girls 2026 · ក្រុម #50777 · Junior Division · សៀមរាប, កម្ពុជា"
              : "Last updated June 2026 · KWD · Technovation Girls 2026 · Team #50777 · Junior Division · Siem Reap, Cambodia"}
          </p>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-16">

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <nav className="sticky top-24 space-y-0.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-baseline gap-2 py-1.5 text-sm transition-colors ${
                  active === s.id
                    ? "text-zinc-900 font-semibold"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <span className="text-[10px] font-mono shrink-0 w-5 text-zinc-300">{s.num}</span>
                <span style={kf}>{kh ? s.heading.kh : s.heading.en}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="space-y-0 divide-y divide-zinc-100">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 py-10 first:pt-0">

                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-xs font-mono text-zinc-300 shrink-0">{s.num}</span>
                  <h2 className="text-base font-bold text-zinc-900 leading-snug" style={kf}>
                    {kh ? s.heading.kh : s.heading.en}
                  </h2>
                </div>

                <div className="space-y-3">
                  {(kh ? s.kh : s.en).split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-zinc-700 leading-relaxed" style={kf}>
                      {para.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < para.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>

              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
            <span style={kf}>© 2026 Kesararam With Digital · kesararamwithdigital.tech</span>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-zinc-700 transition-colors" style={kf}>
                {kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Use"}
              </Link>
              <Link href="/about" className="hover:text-zinc-700 transition-colors" style={kf}>
                {kh ? "អំពីយើង" : "About"}
              </Link>
              <a href="mailto:kesararamwithdigital@gmail.com" className="hover:text-zinc-700 transition-colors">
                kesararamwithdigital@gmail.com
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
