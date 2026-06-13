"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";

// ── 10 sections verbatim from KWD_លក្ខខណ្ឌប្រើប្រាស់.txt ──────────────────
export const SECTIONS = [
  {
    id: "s1",
    num: "១",
    heading: { kh: "ការទទួលយកលក្ខខណ្ឌ", en: "Acceptance of Terms" },
    kh: "ការប្រើប្រាស់ KWD មានន័យថាអ្នកយល់ព្រមនឹងលក្ខខណ្ឌទាំងនេះ។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមឈប់ប្រើប្រាស់។ សម្រាប់សិស្សអាយុក្រោម ១៣ ឆ្នាំ គ្រូ ឬអាណាព្យាបាលជាអ្នកទទួលយកលក្ខខណ្ឌជំនួស។",
    en: "Using KWD means you agree to these terms. If you do not agree, please stop using the platform. For students under 13 years of age, a teacher or guardian accepts these terms on their behalf.",
  },
  {
    id: "s2",
    num: "២",
    heading: { kh: "គោលបំណងនៃថ្នាល់", en: "Purpose of the Platform" },
    kh: "KWD (kesararamwithdigital.tech) ជាថ្នាល់សិក្សាឥតគិតថ្លៃ ពីរភាសា (ខ្មែរ–អង់គ្លេស) ដែលផ្ដោតលើទ្រឹស្ដីបើកបរ និងសញ្ញាចរាចរណ៍ ដើម្បីបង្កើនការយល់ដឹង និងសុវត្ថិភាពចរាចរណ៍។ បង្កើតដោយក្រុមយុវតីខ្មែរពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls 2026។ KWD គាំទ្រ SDG 4 និង SDG 11។",
    en: "KWD (kesararamwithdigital.tech) is a free, bilingual (Khmer–English) learning platform focused on driving theory and traffic signs, designed to improve road safety knowledge and awareness. Built by a team of young Cambodian women from Kesararam Primary School under the Technovation Girls 2026 programme. KWD supports SDG 4 (Quality Education) and SDG 11 (Sustainable Cities and Communities).",
  },
  {
    id: "s3",
    num: "៣",
    heading: { kh: "គណនី និងតួនាទី", en: "Accounts & Roles" },
    kh: "KWD មានតួនាទីអ្នកប្រើ៖ សិស្ស គ្រូ អ្នកគ្រប់គ្រង (Admin) និងបុគ្គលិក (Staff)។ គណនីសិស្សត្រូវណែនាំបង្កើតដោយគ្រូ ឬសាលា។ អ្នកអាចចូលប្រើដោយឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់ ឬដោយគណនី Google។ អ្នកត្រូវផ្ដល់ព័ត៌មានពិតប្រាកដ រក្សាសុវត្ថិភាពនៃការចូលគណនី និងមិនត្រូវចែករំលែកគណនីឡើយ។ ការផ្លាស់ប្ដូរ៖ ឈ្មោះអ្នកប្រើ ១ ដង/ឆ្នាំ និងរូបតំណាង ១ ដង/៦០ ថ្ងៃ។",
    en: "KWD has four user roles: Student, Teacher, Administrator (Admin), and Staff. Student accounts are recommended to be created by a teacher or school. You may sign in with a username and password or via a Google account. You must provide accurate information, maintain the security of your account credentials, and must not share your account. Account changes are limited to: username once per year and profile picture once every 60 days.",
  },
  {
    id: "s4",
    num: "៤",
    heading: { kh: "ការប្រើប្រាស់ត្រឹមត្រូវ", en: "Acceptable Use" },
    kh: "ប្រើ KWD សម្រាប់ការសិក្សាដោយសុចរិត។ ហាមការបន្លំ ការប្រើ Bot ឬ Script ស្វ័យប្រវត្តិ ការលួចចូលប្រព័ន្ធ ការប្រមូលទិន្នន័យ (scraping) ការផ្សាយ Spam ឬខ្លឹមសាររំលោភ។ ហាមរំខានដល់ដំណើរការសេវាកម្ម ឬព្យាយាមចូលគណនីអ្នកដទៃ។",
    en: "Use KWD for honest, educational purposes. The following are strictly prohibited: fraud, the use of bots or automated scripts, unauthorised system access, data scraping, posting spam or abusive content, disrupting service operations, and attempting to access another user's account.",
  },
  {
    id: "s5",
    num: "៥",
    heading: { kh: "ពិន្ទុ និងរង្វាន់", en: "Points & Rewards" },
    kh: "ពិន្ទុទទួលបានតែពីការលេងត្រឹមត្រូវ ហើយកំណត់កម្រិតគណនី (Rookie ដល់ Mythic) និងចំណាត់ថ្នាក់ក្នុងតារាងពិន្ទុ។ រង្វាន់ត្រូវប្ដូរតាមរយៈអ្នកគ្រប់គ្រង លោកគ្រូអ្នកគ្រូដើម្បីលើកទឹកចិត្ត ហើយរង្វាន់ដែលប្ដូររួចមិនអាចដកវិញបានទេ។ ពិន្ទុ និងរង្វាន់គ្មានតម្លៃជាសាច់ប្រាក់។ ពិន្ទុដែលទទួលដោយការបន្លំនឹងត្រូវដកហូត។",
    en: "Points are earned only through fair gameplay and determine your account tier (Rookie through Mythic) and leaderboard ranking. Rewards are redeemed through an administrator or teacher for motivational purposes; once redeemed, they cannot be reversed. Points and rewards have no monetary value. Points obtained through fraudulent means will be forfeited.",
  },
  {
    id: "s6",
    num: "៦",
    heading: { kh: "ការជាវ និងការទូទាត់", en: "Subscriptions & Payments" },
    kh: "KWD ដំណើរការលើគំរូ freemium៖ សិស្សប្រើប្រាស់ឥតគិតថ្លៃ ផែនការបង់ប្រាក់ (Teacher Pro, School, និង Institution) ផ្ដល់មុខងារបន្ថែមសម្រាប់គ្រូ និងស្ថាប័នអប់រំ។\n\nវិធីសាស្ត្រទូទាត់ដែលទទួលយក៖\n• ធនាគារក្នុងស្រុក (Cambodia)៖ KHQR — ភ្ជាប់ធនាគារ NBC ទាំងអស់\n• កាតអន្តរជាតិ (International Cards)៖ Visa និង Mastercard\n\nបច្ចុប្បន្ន ការទូទាត់ធ្វើឡើងដោយដៃ ហើយការចូលប្រើបើកក្នុងរយៈពេល ២៤ ម៉ោង។ នាពេលអនាគត KWD គ្រោងបញ្ចូលប្រព័ន្ធទូទាត់ស្វ័យប្រវត្តិ (auto-pay) ដើម្បីដោះសោមុខងារភ្លាមៗ និងបន្តការជាវដោយស្វ័យប្រវត្តិ (auto-renew) តាមរយៈ Stripe និង API ធនាគារក្នុងស្រុក។\n\nការបោះបង់ និងការសងប្រាក់វិញ៖ អ្នកអាចបោះបង់ការជាវបាន មុនពេលវេលា Auto-renew ទូទាត់បន្ទាប់។ គ្មានការសងប្រាក់វិញបន្ទាប់ពីបានផ្ដល់ការចូលប្រើ លើកលែងតែករណីបញ្ហាបច្ចេកទេស។",
    en: "KWD operates on a freemium model: students use the platform for free. Paid plans (Teacher Pro, School, and Institution) provide additional features for teachers and educational institutions.\n\nAccepted payment methods:\n• Local banks (Cambodia): KHQR — connected to all NBC-participating banks\n• International cards: Visa and Mastercard\n\nPayments are currently processed manually and access is activated within 24 hours. In the future, KWD plans to introduce automated payment (auto-pay) to enable instant feature unlocking and automatic subscription renewal (auto-renew) via Stripe and local bank APIs.\n\nCancellation and refunds: subscriptions may be cancelled before the next auto-renew payment date. No refunds are issued after access has been granted, except in cases of verified technical failure.",
  },
  {
    id: "s7",
    num: "៧",
    heading: { kh: "ខ្លឹមសារ និងកម្មសិទ្ធិបញ្ញា", en: "Content & Intellectual Property" },
    kh: "ខ្លឹមសារ ការរចនា និងកូដទាំងអស់ជាកម្មសិទ្ធិរបស់សាលាបឋមសិក្សាកេសរារាម។ ឧបករណ៍ AI ត្រូវបានប្រើជាជំនួយ ហើយលទ្ធផលទាំងអស់ត្រូវត្រួតពិនិត្យ និងអនុម័តដោយក្រុមមុនការផ្សព្វផ្សាយ។ ខ្លឹមសារមានគោលបំណងសិក្សាប៉ុណ្ណោះ។",
    en: "All content, design, and code are the property of Kesararam Primary School. AI tools were used as assistants, and all outputs were reviewed and approved by the team prior to publication. All content is intended for educational purposes only.",
  },
  {
    id: "s8",
    num: "៨",
    heading: { kh: "ការកំណត់ទំនួលខុសត្រូវ", en: "Limitation of Liability" },
    kh: "KWD ត្រូវបានផ្ដល់ជូន \"ដូចដែលវាមាន\" (as-is) ដោយគ្មានការធានា។ យើងមិនធានាថាការប្រើ KWD នឹងនាំឱ្យជាប់ការប្រឡងបើកបរផ្លូវការទេ ហើយមិនទទួលខុសត្រូវចំពោះការបាត់បង់ ឬការខូចខាតណាមួយដែលកើតពីការប្រើប្រាស់ឡើយ។",
    en: "KWD is provided \"as-is\" without any warranties. We do not guarantee that using KWD will result in passing the official driving theory examination, and we are not liable for any loss or damage of any kind arising from use of the platform.",
  },
  {
    id: "s9",
    num: "៩",
    heading: { kh: "ការបញ្ចប់ការប្រើប្រាស់", en: "Termination of Access" },
    kh: "KWD អាចផ្អាក ឬលុបគណនីដែលបំពានលក្ខខណ្ឌ ដោយគ្មានការជូនដំណឹងជាមុន។ អ្នកអាចស្នើសុំលុបគណនី និងទិន្នន័យពាក់ព័ន្ធបានគ្រប់ពេល។",
    en: "KWD may suspend or delete accounts that violate these terms without prior notice. You may request deletion of your account and associated data at any time.",
  },
  {
    id: "s10",
    num: "១០",
    heading: { kh: "ច្បាប់ ការផ្លាស់ប្ដូរ និងទំនាក់ទំនង", en: "Governing Law, Changes & Contact" },
    kh: "លក្ខខណ្ឌទាំងនេះស្ថិតក្រោមការគ្រប់គ្រងនៃច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។ យើងអាចធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌនេះបានគ្រប់ពេល; ការប្រើប្រាស់បន្តមានន័យថាការទទួលយកលក្ខខណ្ឌថ្មី។ ចំពោះការប្រមូល និងប្រើប្រាស់ទិន្នន័យ សូមមើលគោលការណ៍ភាពឯកជន។ សម្រាប់សំណួរ សូមទំនាក់ទំនងតាម Email kesararamwithdigital@gmail.com។",
    en: "These terms are governed by the laws of the Kingdom of Cambodia. We may update these terms at any time; continued use of the platform constitutes acceptance of the revised terms. For information on data collection and use, please refer to our Privacy Policy. For enquiries, please contact us at kesararamwithdigital@gmail.com.",
  },
];

export default function TermsPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: '"GoogleSans", var(--font-kh-body), var(--font-kh-header), sans-serif' } : {};
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
            {kh ? "លក្ខខណ្ឌប្រើប្រាស់ KWD" : "KWD Terms of Use"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-xl leading-relaxed" style={kf}>
            {kh
              ? "ការប្រើប្រាស់ KWD មានន័យថាអ្នកយល់ព្រមនឹងលក្ខខណ្ឌទាំងនេះ។"
              : "By using KWD you agree to these terms. Please read them carefully before using the platform."}
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

                {/* Section heading */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-xs font-mono text-zinc-300 shrink-0">{s.num}</span>
                  <h2 className="text-base font-bold text-zinc-900 leading-snug" style={kf}>
                    {kh ? s.heading.kh : s.heading.en}
                  </h2>
                </div>

                {/* Body — active language only */}
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
              <Link href="/privacy" className="hover:text-zinc-700 transition-colors" style={kf}>
                {kh ? "ភាពឯកជន" : "Privacy"}
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
