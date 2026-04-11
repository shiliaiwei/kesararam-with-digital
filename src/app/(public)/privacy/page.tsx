"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";

export default function PrivacyPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const l = kh ? {
    badge: "ឯកសារច្បាប់",
    title: "គោលការណ៍ភាពឯកជន",
    subtitle: "ធ្វើបច្ចុប្បន្នភាព: មីនា ២០២៦ — KWD, Kesararam With Digital, Technovation Girls Cambodia",
    termsBtn: "លក្ខខណ្ឌប្រើប្រាស់",
    aboutBtn: "អំពី KWD",
    footer: "២០២៦ KWD — Kesararam With Digital. សាលាបឋមសិក្សាកេសរារាម. Technovation Girls Cambodia.",
    body: `KWD (Kesararam With Digital) គឺជាវេទិកាសិក្សាការបើកបរ និងស្គាល់សញ្ញាចរាចរ ដែលបង្កើតឡើងដោយក្មេងស្រីខ្មែរពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls។ យើងប្តេជ្ញាការពារភាពឯកជនរបស់សិស្ស គ្រូ និងអ្នកប្រើប្រាស់ទាំងអស់ ស្របតាមស្តង់ដារសុវត្ថិភាព Technovation និងគោលដៅ SDG របស់អង្គការសហប្រជាជាតិ។

នៅពេលចុះឈ្មោះ យើងប្រមូលឈ្មោះ ឈ្មោះអ្នកប្រើ អ៊ីមែល និងពាក្យសម្ងាត់ (រក្សាទុកជាលេខកូដសុវត្ថិភាព)។ គ្រូ និងអ្នកគ្រប់គ្រងអាចផ្តល់ឈ្មោះសាលា និងតួនាទីផងដែរ។ គណនីសិស្សត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រងសាលា — មិនមែនដោយផ្ទាល់ពីសិស្សអាយុក្រោម ១៣ ឆ្នាំទេ។ យើងប្រមូលតែឈ្មោះបង្ហាញ និងឈ្មោះអ្នកប្រើ ដើម្បីចូលរួមក្នុងការប្រឡង និងតាមដានវឌ្ឍនភាព។ យើងក៏ប្រមូលពិន្ទុហ្គេម លទ្ធផលប្រឡង កំណត់ត្រាចូលរួម និងទម្លាប់ប្រើប្រាស់ ដើម្បីកែលម្អវេទិកា។

ព័ត៌មានរបស់អ្នកត្រូវបានប្រើដើម្បីផ្ទៀងផ្ទាត់អ្នកប្រើ បង្ហាញចំណាត់ថ្នាក់ តាមដានវឌ្ឍនភាព ដំណើរការវគ្គប្រឡងផ្ទាល់ និងផ្តល់រង្វាន់។ ទិន្នន័យប្រមូលផ្តុំ (មិនបង្ហាញអត្តសញ្ញាណ) ជួយយើងយល់ពីប្រភេទ និងរបៀបលេងដែលមានប្រសិទ្ធភាពបំផុត ដើម្បីកែលម្អខ្លឹមសារ។ យើងអាចផ្ញើការជូនដំណឹងសំខាន់ (ដូចជាការជូនដំណឹងសុវត្ថិភាពគណនី) ប៉ុន្តែមិនផ្ញើអ៊ីមែលទីផ្សារដោយគ្មានការយល់ព្រមរបស់អ្នកទេ។

KWD ត្រូវបានរចនាសម្រាប់បរិយាកាសសាលា។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។ ឪពុកម្តាយ ឬអាណាព្យាបាលអាចទាក់ទងយើងដើម្បីស្នើសុំចូលមើល កែ ឬលុបទិន្នន័យកូនរបស់ពួកគេ។ អ្នកណែនាំ និងអ្នកស្ម័គ្រចិត្តទាំងអស់ដែលធ្វើការជាមួយក្រុមរបស់យើងអនុវត្តតាម Technovation Volunteer Code of Conduct ដើម្បីធានាបរិយាកាសសិក្សាដែលមានសុវត្ថិភាព។

ទិន្នន័យត្រូវរក្សាទុកនៅ Neon (PostgreSQL) ជាមួយការភ្ជាប់ដែលបានអ៊ិនគ្រីប។ រូបភាពប្រវត្តិរូបត្រូវរក្សាទុកនៅ Cloudinary ជាមួយការគ្រប់គ្រងការចូលប្រើ។ ពាក្យសម្ងាត់ត្រូវបានហ្ហាស (hash) ដោយប្រើក្បួនដោះស្រាយស្តង់ដារ។ វគ្គប្រើប្រាស់ JWT tokens ដែលមានកំណត់ពេល។ ផ្លូវ API ទាំងអស់អនុវត្តការគ្រប់គ្រងការចូលប្រើតាមតួនាទី។ ក្នុងករណីមានការបំពានទិន្នន័យ យើងនឹងជូនដំណឹងអ្នកភ្លាមៗតាមអ៊ីមែលដែលបានចុះឈ្មោះ។

អ្នកអាចមើល និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រវត្តិរូបរបស់អ្នកបានគ្រប់ពេលពីការកំណត់គណនី។ អ្នកអាចស្នើសុំលុបគណនី និងទិន្នន័យដែលពាក់ព័ន្ធ — ពិន្ទុហ្គេមនៅក្នុងចំណាត់ថ្នាក់សាធារណៈអាចត្រូវរក្សាទុកក្នុងទម្រង់អនាមិក។ យើងប្រើ Cloudinary, Neon, និង Vercel — នីមួយៗមានគោលការណ៍ភាពឯកជនផ្ទាល់ខ្លួន។ យើងមិនលក់ទិន្នន័យរបស់អ្នកទៅភាគីទីបីណាមួយឡើយ។

KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុងប្រកបដោយចីរភាព) ដោយផ្តល់ការអប់រំទ្រឹស្ដីបើកបរឥតគិតថ្លៃ ជាភាសាខ្មែរ-អង់គ្លេស ដោយផ្តោតលើការផ្តល់អំណាចដល់ក្មេងស្រីតាមរយៈបច្ចេកវិទ្យា។ យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍នេះ — ការប្រើប្រាស់ KWD បន្តបន្ទាប់ពីការផ្លាស់ប្តូរ មានន័យថាអ្នកទទួលយកគោលការណ៍ដែលបានធ្វើបច្ចុប្បន្នភាព។ សម្រាប់សំណួរទាក់ទងភាពឯកជន សូមទំនាក់ទំនងក្រុម KWD នៅសាលាបឋមសិក្សាកេសរារាម ឬតាមរយៈទំព័រ About។`,
  } : {
    badge: "Legal Document",
    title: "Privacy Policy",
    subtitle: "Last updated: March 2026 — KWD, Kesararam With Digital, Technovation Girls Cambodia",
    termsBtn: "Terms of Service",
    aboutBtn: "About KWD",
    footer: "2026 KWD — Kesararam With Digital. Kesararam Primary School. Technovation Girls Cambodia.",
    body: `KWD (Kesararam With Digital) is a driving and traffic sign learning platform built by young Cambodian girls from Kesararam Primary School, participating in Technovation Girls. We are committed to protecting the privacy of every student, teacher, and user on our platform. This policy explains what data we collect, why, and how we protect it — in alignment with Technovation safety standards and the UN Sustainable Development Goals.

When you register, we collect your name, username, email address, and password stored as a secure hash. Teachers and admins may also provide a school name and role. Student accounts are created by teachers or school administrators — not directly by students under 13. We collect only the display name and username needed to participate in quizzes and track progress. We do not collect date of birth, phone numbers, or home addresses from students. We also automatically collect game scores, quiz results, session participation records, and feature usage patterns to improve the platform.

Your information is used to authenticate users, display leaderboards, track learning progress, run live quiz sessions, and deliver rewards. Aggregated, anonymized usage data helps us understand which categories and game modes are most effective so we can improve content quality. We may send important service notices such as account security alerts — we do not send marketing emails without your explicit consent.

KWD is designed for school environments. Student accounts for users under 13 must be created and managed by a teacher or school administrator. We do not knowingly collect personal information directly from children under 13. This aligns with Technovation's child safety guidelines. Parents or guardians may contact us to request access to, correction of, or deletion of their child's data at any time. All mentors and volunteers follow the Technovation Volunteer Code of Conduct to ensure a safe learning environment.

Data is stored on Neon (PostgreSQL) with encrypted connections. Profile images are stored on Cloudinary with access controls. Passwords are hashed using industry-standard algorithms. Sessions use signed JWT tokens with expiry. All API routes enforce role-based access control. In the event of a data breach affecting your account, we will notify you promptly via your registered email.

You can view and update your profile information at any time from your account settings. You may request deletion of your account and associated data — game scores on the public leaderboard may be retained in anonymized form. We use Cloudinary, Neon, and Vercel — each has its own privacy policy. We do not sell your data to any third party.

KWD supports SDG 4 (Quality Education) and SDG 11 (Sustainable Cities & Communities) by providing free, bilingual driving theory education to Cambodian students, with a focus on empowering young girls through technology. We may update this policy from time to time — continued use of KWD after changes constitutes acceptance. For privacy-related questions, contact the KWD team at Kesararam Primary School or through the About page.`,
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
          <Image src="/brand/kwd-black-text.png" alt="KWD" width={80} height={80} className="object-contain" unoptimized />
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
            <Link href="/terms" className="text-xs font-black px-4 py-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-colors" style={kf}>{l.termsBtn}</Link>
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

        {/* Footer */}
        <div className="border-t border-black/10 pt-8 mt-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/kwd-black-text.png" alt="KWD" width={24} height={24} className="object-contain opacity-40" unoptimized />
            <p className="text-xs text-zinc-400 font-medium" style={kf}>{l.footer}</p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <Link href="/terms" className="text-zinc-500 hover:text-black transition-colors" style={kf}>{l.termsBtn}</Link>
            <Link href="/about" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{l.aboutBtn}</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
