"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/context/lang-context";

const CONTENT = {
  en: {
    badge: "Legal",
    title: "Privacy Policy",
    subtitle: "Last updated: March 2026 · KWD — Kesararam With Digital · Technovation Girls Cambodia",
    intro: "KWD (Kesararam With Digital) is a driving theory learning platform built by a team of young Cambodian girls from Kesararam Primary School, participating in Technovation Girls. We are committed to protecting the privacy of every student, teacher, and user on our platform. This policy explains what data we collect, why, and how we protect it — in alignment with Technovation's safety standards and the UN Sustainable Development Goals.",
    termsBtn: "Terms of Service →",
    aboutBtn: "About KWD",
    footerCopy: "© 2026 KWD — Kesararam With Digital · Kesararam Primary School · Technovation Girls Cambodia",
    sections: [
      {
        id: "01",
        title: "Information We Collect",
        items: [
          { sub: "Account Information", text: "When you register, we collect your name, username, email address, and password (stored as a secure hash). Teachers and admins may also provide a school name and role." },
          { sub: "Student Information", text: "Student accounts are created by teachers or school administrators — not directly by students under 13. We collect only the display name and username needed to participate in quizzes and track progress. We do not collect date of birth, phone numbers, or home addresses from students." },
          { sub: "Usage Data", text: "We automatically collect game scores, quiz results, session participation records, and feature usage patterns to improve the platform." },
          { sub: "Profile Images", text: "If you upload a profile photo, it is stored securely on Cloudinary and served through our proxy to prevent direct URL exposure." },
        ],
      },
      {
        id: "02",
        title: "How We Use Your Information",
        items: [
          { sub: "Platform Operation", text: "To authenticate users, display leaderboards, track learning progress, run live quiz sessions, and deliver rewards." },
          { sub: "Improvement", text: "Aggregated, anonymized usage data helps us understand which categories and game modes are most effective so we can improve content quality." },
          { sub: "Communication", text: "We may send important service notices (e.g., account security alerts). We do not send marketing emails without your explicit consent." },
        ],
      },
      {
        id: "03",
        title: "Children's Privacy",
        items: [
          { sub: "Under-13 Policy", text: "KWD is designed for school environments. Student accounts for users under 13 must be created and managed by a teacher or school administrator. We do not knowingly collect personal information directly from children under 13. This aligns with Technovation's child safety guidelines at technovationchallenge.org/safety/." },
          { sub: "Parental Rights", text: "Parents or guardians may contact us to request access to, correction of, or deletion of their child's data at any time." },
          { sub: "Volunteer & Mentor Safety", text: "All mentors and volunteers working with our team follow the Technovation Volunteer Code of Conduct (technovation.org/safety/volunteer-code-of-conduct/) to ensure a safe learning environment." },
        ],
      },
      {
        id: "04",
        title: "Data Storage & Security",
        items: [
          { sub: "Storage", text: "Data is stored on Neon (PostgreSQL) with encrypted connections. Profile images are stored on Cloudinary with access controls." },
          { sub: "Security Measures", text: "Passwords are hashed using industry-standard algorithms. Sessions use signed JWT tokens with expiry. All API routes enforce role-based access control." },
          { sub: "Breach Notification", text: "In the event of a data breach affecting your account, we will notify you promptly via your registered email." },
        ],
      },
      {
        id: "05",
        title: "Your Rights",
        items: [
          { sub: "Access & Correction", text: "You can view and update your profile information at any time from your account settings." },
          { sub: "Deletion", text: "You may request deletion of your account and associated data by contacting us. Game scores on the public leaderboard may be retained in anonymized form." },
          { sub: "Data Portability", text: "You may request an export of your personal data in a machine-readable format." },
        ],
      },
      {
        id: "06",
        title: "Third-Party Services",
        items: [
          { sub: "Services Used", text: "We use Cloudinary (image hosting), Neon (database), and Vercel (hosting). Each has its own privacy policy. We do not sell your data to any third party." },
          { sub: "Technovation Affiliation", text: "KWD is a project submitted to Technovation Girls (technovation.org). Technovation's own privacy policy applies to their platform separately from ours." },
        ],
      },
      {
        id: "07",
        title: "SDG Alignment",
        items: [
          { sub: "UN Sustainable Development Goals", text: "KWD supports SDG 4 (Quality Education) and SDG 5 (Gender Equality) by providing free, bilingual driving theory education to Cambodian students, with a focus on empowering young girls through technology. Learn more at sdgs.un.org/goals." },
        ],
      },
      {
        id: "08",
        title: "Changes & Contact",
        items: [
          { sub: "Updates", text: "We may update this policy from time to time. The date at the top reflects the most recent revision. Continued use of KWD after changes constitutes acceptance." },
          { sub: "Contact", text: "For privacy-related questions, contact the KWD team at Kesararam Primary School or through the About page." },
        ],
      },
    ],
  },
  kh: {
    badge: "ច្បាប់",
    title: "គោលការណ៍ភាពឯកជន",
    subtitle: "ធ្វើបច្ចុប្បន្នភាព: មីនា ២០២៦ · KWD — Kesararam With Digital · Technovation Girls Cambodia",
    intro: "KWD (Kesararam With Digital) គឺជាវេទិកាសិក្សាទ្រឹស្ដីបើកបរ ដែលបង្កើតឡើងដោយក្មេងស្រីខ្មែរពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls។ យើងប្តេជ្ញាការពារភាពឯកជនរបស់សិស្ស គ្រូ និងអ្នកប្រើប្រាស់ទាំងអស់ ស្របតាមស្តង់ដារសុវត្ថិភាព Technovation និងគោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាពរបស់អង្គការសហប្រជាជាតិ។",
    termsBtn: "លក្ខខណ្ឌប្រើប្រាស់ →",
    aboutBtn: "អំពី KWD",
    footerCopy: "© ២០២៦ KWD — Kesararam With Digital · សាលាបឋមសិក្សាកេសរារាម · Technovation Girls Cambodia",
    sections: [
      {
        id: "០១",
        title: "ព័ត៌មានដែលយើងប្រមូល",
        items: [
          { sub: "ព័ត៌មានគណនី", text: "នៅពេលចុះឈ្មោះ យើងប្រមូលឈ្មោះ ឈ្មោះអ្នកប្រើ អ៊ីមែល និងពាក្យសម្ងាត់ (រក្សាទុកជាលេខកូដសុវត្ថិភាព)។ គ្រូ និងអ្នកគ្រប់គ្រងអាចផ្តល់ឈ្មោះសាលា និងតួនាទីផងដែរ។" },
          { sub: "ព័ត៌មានសិស្ស", text: "គណនីសិស្សត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រងសាលា — មិនមែនដោយផ្ទាល់ពីសិស្សអាយុក្រោម ១៣ ឆ្នាំទេ។ យើងប្រមូលតែឈ្មោះបង្ហាញ និងឈ្មោះអ្នកប្រើ ដើម្បីចូលរួមក្នុងការប្រឡង និងតាមដានវឌ្ឍនភាព។" },
          { sub: "ទិន្នន័យការប្រើប្រាស់", text: "យើងប្រមូលពិន្ទុហ្គេម លទ្ធផលប្រឡង កំណត់ត្រាចូលរួម និងទម្លាប់ប្រើប្រាស់ ដើម្បីកែលម្អវេទិកា។" },
          { sub: "រូបភាពប្រវត្តិរូប", text: "ប្រសិនបើអ្នកផ្ទុករូបភាព វានឹងត្រូវរក្សាទុកនៅ Cloudinary ហើយបម្រើតាមរយៈប្រព័ន្ធ proxy ដើម្បីការពារ URL ផ្ទាល់។" },
        ],
      },
      {
        id: "០២",
        title: "របៀបប្រើប្រាស់ព័ត៌មានរបស់អ្នក",
        items: [
          { sub: "ប្រតិបត្តិការវេទិកា", text: "ដើម្បីផ្ទៀងផ្ទាត់អ្នកប្រើ បង្ហាញចំណាត់ថ្នាក់ តាមដានវឌ្ឍនភាព ដំណើរការវគ្គប្រឡងផ្ទាល់ និងផ្តល់រង្វាន់។" },
          { sub: "ការកែលម្អ", text: "ទិន្នន័យប្រមូលផ្តុំ (មិនបង្ហាញអត្តសញ្ញាណ) ជួយយើងយល់ពីប្រភេទ និងរបៀបលេងដែលមានប្រសិទ្ធភាពបំផុត ដើម្បីកែលម្អខ្លឹមសារ។" },
          { sub: "ការទំនាក់ទំនង", text: "យើងអាចផ្ញើការជូនដំណឹងសំខាន់ (ដូចជាការជូនដំណឹងសុវត្ថិភាពគណនី)។ យើងមិនផ្ញើអ៊ីមែលទីផ្សារដោយគ្មានការយល់ព្រមរបស់អ្នកទេ។" },
        ],
      },
      {
        id: "០៣",
        title: "ភាពឯកជនរបស់កុមារ",
        items: [
          { sub: "គោលការណ៍អាយុក្រោម ១៣ ឆ្នាំ", text: "KWD ត្រូវបានរចនាសម្រាប់បរិយាកាសសាលា។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង។ ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation (technovationchallenge.org/safety/)។" },
          { sub: "សិទ្ធិឪពុកម្តាយ", text: "ឪពុកម្តាយ ឬអាណាព្យាបាលអាចទាក់ទងយើងដើម្បីស្នើសុំចូលមើល កែ ឬលុបទិន្នន័យកូនរបស់ពួកគេ។" },
          { sub: "សុវត្ថិភាពអ្នកណែនាំ", text: "អ្នកណែនាំ និងអ្នកស្ម័គ្រចិត្តទាំងអស់ដែលធ្វើការជាមួយក្រុមរបស់យើងអនុវត្តតាម Technovation Volunteer Code of Conduct ដើម្បីធានាបរិយាកាសសិក្សាដែលមានសុវត្ថិភាព។" },
        ],
      },
      {
        id: "០៤",
        title: "ការរក្សាទុក និងសុវត្ថិភាពទិន្នន័យ",
        items: [
          { sub: "ការរក្សាទុក", text: "ទិន្នន័យត្រូវរក្សាទុកនៅ Neon (PostgreSQL) ជាមួយការភ្ជាប់ដែលបានអ៊ិនគ្រីប។ រូបភាពប្រវត្តិរូបត្រូវរក្សាទុកនៅ Cloudinary ជាមួយការគ្រប់គ្រងការចូលប្រើ។" },
          { sub: "វិធានការសុវត្ថិភាព", text: "ពាក្យសម្ងាត់ត្រូវបានហ្ហាស (hash) ដោយប្រើក្បួនដោះស្រាយស្តង់ដារ។ វគ្គប្រើប្រាស់ JWT tokens ដែលមានកំណត់ពេល។ ផ្លូវ API ទាំងអស់អនុវត្តការគ្រប់គ្រងការចូលប្រើតាមតួនាទី។" },
          { sub: "ការជូនដំណឹងការបំពាន", text: "ក្នុងករណីមានការបំពានទិន្នន័យ យើងនឹងជូនដំណឹងអ្នកភ្លាមៗតាមអ៊ីមែលដែលបានចុះឈ្មោះ។" },
        ],
      },
      {
        id: "០៥",
        title: "សិទ្ធិរបស់អ្នក",
        items: [
          { sub: "ការចូលមើល និងការកែ", text: "អ្នកអាចមើល និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រវត្តិរូបរបស់អ្នកបានគ្រប់ពេលពីការកំណត់គណនី។" },
          { sub: "ការលុប", text: "អ្នកអាចស្នើសុំលុបគណនី និងទិន្នន័យដែលពាក់ព័ន្ធ។ ពិន្ទុហ្គេមនៅក្នុងចំណាត់ថ្នាក់សាធារណៈអាចត្រូវរក្សាទុកក្នុងទម្រង់អនាមិក។" },
          { sub: "ការផ្ទេរទិន្នន័យ", text: "អ្នកអាចស្នើសុំការនាំចេញទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកក្នុងទម្រង់ដែលអាចអានបានដោយម៉ាស៊ីន។" },
        ],
      },
      {
        id: "០៦",
        title: "សេវាភាគីទីបី",
        items: [
          { sub: "សេវាដែលប្រើ", text: "យើងប្រើ Cloudinary (ផ្ទុករូបភាព), Neon (មូលដ្ឋានទិន្នន័យ), និង Vercel (ការបង្ហោះ)។ នីមួយៗមានគោលការណ៍ភាពឯកជនផ្ទាល់ខ្លួន។ យើងមិនលក់ទិន្នន័យរបស់អ្នកទៅភាគីទីបីណាមួយឡើយ។" },
          { sub: "ការភ្ជាប់ Technovation", text: "KWD គឺជាគម្រោងដែលបានដាក់ស្នើទៅ Technovation Girls (technovation.org)។ គោលការណ៍ភាពឯកជនរបស់ Technovation ចំពោះវេទិការបស់ពួកគេគឺដាច់ដោយឡែកពីយើង។" },
        ],
      },
      {
        id: "០៧",
        title: "ការតម្រឹមជាមួយ SDG",
        items: [
          { sub: "គោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព", text: "KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 5 (សមភាពយេនឌ័រ) ដោយផ្តល់ការអប់រំទ្រឹស្ដីបើកបរឥតគិតថ្លៃ ជាភាសាខ្មែរ-អង់គ្លេស ដោយផ្តោតលើការផ្តល់អំណាចដល់ក្មេងស្រីតាមរយៈបច្ចេកវិទ្យា។ ស្វែងយល់បន្ថែមនៅ sdgs.un.org/goals។" },
        ],
      },
      {
        id: "០៨",
        title: "ការផ្លាស់ប្តូរ និងទំនាក់ទំនង",
        items: [
          { sub: "ការធ្វើបច្ចុប្បន្នភាព", text: "យើងអាចធ្វើបច្ចុប្បន្នភាពគោលការណ៍នេះ។ កាលបរិច្ឆេទនៅខាងលើបង្ហាញការកែប្រែចុងក្រោយ។ ការប្រើប្រាស់ KWD បន្តបន្ទាប់ពីការផ្លាស់ប្តូរ មានន័យថាអ្នកទទួលយកគោលការណ៍ដែលបានធ្វើបច្ចុប្បន្នភាព។" },
          { sub: "ទំនាក់ទំនង", text: "សម្រាប់សំណួរទាក់ទងភាពឯកជន សូមទំនាក់ទំនងក្រុម KWD នៅសាលាបឋមសិក្សាកេសរារាម ឬតាមរយៈទំព័រ About។" },
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
  const { lang } = useLang();
  const [showLang, setShowLang] = useState<"en" | "kh">(lang === "kh" ? "kh" : "en");
  const c = CONTENT[showLang];
  const khFont = showLang === "kh" ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-black border-b-4 border-yellow-400">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 border-2 border-yellow-400">
              <span className="w-1.5 h-1.5 bg-black rounded-full" />
              {c.badge}
            </div>
            {/* Language toggle */}
            <div className="flex border-2 border-yellow-400 overflow-hidden">
              <button onClick={() => setShowLang("en")} className={`px-4 py-1.5 text-xs font-black transition-all ${showLang === "en" ? "bg-yellow-400 text-black" : "bg-transparent text-yellow-400"}`}>EN</button>
              <button onClick={() => setShowLang("kh")} className={`px-4 py-1.5 text-xs font-black transition-all ${showLang === "kh" ? "bg-yellow-400 text-black" : "bg-transparent text-yellow-400"}`} style={{ fontFamily: "Siemreap, sans-serif" }}>ខ្មែរ</button>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-3" style={khFont}>{c.title}</h1>
          <p className="text-white/40 text-xs" style={khFont}>{c.subtitle}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-b-2 border-zinc-100">
        <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl" style={khFont}>{c.intro}</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link href="/terms" className="text-xs font-black px-4 py-2 bg-black text-yellow-400 border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow: "3px 3px 0 #ca8a04", ...khFont }}>{c.termsBtn}</Link>
          <Link href="/about" className="text-xs font-black px-4 py-2 bg-white text-black border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>{c.aboutBtn}</Link>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
        {c.sections.map((section) => (
          <div key={section.id} className="flex gap-5 md:gap-8">
            <div className="flex-shrink-0 w-11 h-11 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-xs" style={{ boxShadow: "3px 3px 0 #000" }}>{section.id}</div>
            <div className="flex-1 pt-0.5">
              <h2 className="text-lg md:text-xl font-black text-black mb-3 border-b-2 border-black pb-2" style={khFont}>{section.title}</h2>
              <div className="flex flex-col gap-3">
                {section.items.map((item, i) => (
                  <div key={i}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5" style={khFont}>{item.sub}</span>
                    <p className="text-sm text-zinc-600 leading-relaxed" style={khFont}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-zinc-950 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-xs text-center md:text-left" style={khFont}>{c.footerCopy}</p>
          <div className="flex gap-4 text-xs font-black">
            <Link href="/terms" className="text-yellow-400 hover:underline">Terms of Service</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white">About</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
