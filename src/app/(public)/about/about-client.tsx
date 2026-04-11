"use client";

import { useState } from "react";import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { TeamSection } from "@/components/about/team-section";

// ── Gallery images ────────────────────────────────────────────────────────────
// Index 0 = hero cover | Index 1-2 = story sidebar | rest = gallery grid
// All URLs pass through protect() which adds fl_attachment:false via Cloudinary
// so "Save image as" downloads a renamed binary, not the original file.

const protect = (url: string) =>
  url.replace("/upload/", "/upload/fl_attachment:false,q_auto,f_auto/");

const GALLERY = [
  // ── Cover / Hero ──
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760771/00062File_rrjfgx.jpg",
  // ── Story sidebar (2 shown) ──
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760771/00057File_d4gnzg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760770/00056File_mlwsxx.jpg",
  // ── Gallery grid ──
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760776/00041File_bhyh9b.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760782/00078File_mqcrbt.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760777/00074File_a4s9d1.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760788/00081File_vs67kw.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760665/00058File_kxtz1c.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760665/00059File_j0awm8.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760668/00088File_pgummw.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760668/00071File_myv0mv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760670/00006File_pjh9sg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760671/00007File_e4vvkr.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760654/00001File_czh4j7.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760654/00077File_ubv4ty.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760655/00042File_gbkjja.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760655/00034File_exfbks.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760655/00035File_deopei.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760655/00043File_j6pjlm.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760656/00028File_rgojcn.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760656/00029File_xsjggl.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760658/00060File_jcqqu4.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760658/00061File_quv7ox.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760658/00084File_x6i04a.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760659/00085File_m98mkf.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760659/00016File_pm7cw5.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760659/00017File_onp7hz.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760660/00022File_mpxqpp.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760660/00023File_ehvgx1.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760661/00054File_inhoxv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760661/00055File_xvn8fp.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760662/00066File_qvp6jx.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760663/00010File_hufaxd.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760663/00011File_kimueh.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760664/00082File_w1njqg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760664/00083File_xkl6me.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760666/00024File_fi6lhv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760666/00025File_f5evuv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760667/00052File_s9kbtt.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760667/00053File_hkvmpg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760669/00070File_mnm8tv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760670/00038File_eqp0oi.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760670/00039File_azqsug.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760772/00087File_xqmqkp.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760773/00086File_xccpom.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760773/00014File_ggyxsw.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760773/00015File_zyjmsg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760774/00036File_obwwxv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760774/00037File_qugphy.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760775/00008File_wsbgzp.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760775/00009File_h6726g.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760776/00040File_d8ebe7.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760777/00075File_wssw0j.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760778/00002File_qyqq5e.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760779/00003File_zyf9na.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760779/00030File_mmtymn.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760779/00031File_eytjpr.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760780/00079File_xymn3l.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760781/00047File_ak7oon.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760781/00072File_tr20of.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760782/00046File_yoiygn.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760782/00073File_oj7olf.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760782/00026File_vwjvqv.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760783/00027File_mr0rqz.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760783/00051File_xfm6p8.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760784/00050File_lhp6v4.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760784/00018File_hfe7j9.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760785/00019File_ub7vbc.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760786/00064File_yq93m8.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760786/00065File_cbhxfx.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760786/00012File_u0ssax.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760787/00013File_jic7lb.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760788/00080File_zeu3ru.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760653/00048File_vfbhrk.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760653/00049File_wr3wqh.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760653/00076File_wt9cxe.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760768/00044File_ncikll.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760768/00045File_lhay09.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760768/00068File_xfxecn.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760768/00069File_bd9fyg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760769/00021File_qmiia3.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760767/00032File_lzjrbx.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760767/00033File_zx07ep.jpg",
  // ── Previous team photos kept ──
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775673217/photo_2026-04-09_02-29-33_zyueex.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775673274/photo_2026-04-09_02-29-29_nxuioi.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775673225/DSC_0006_uzmstz.jpg",
];

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ images, index, onClose, onPrev, onNext }: {
  images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10">
        <ChevronLeft className="text-white" size={24} />
      </button>
      {/* Wrapper blocks right-click and drag */}
      <div
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={e => e.stopPropagation()}
        onContextMenu={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
      >
        <img
          src={images[index]}
          alt=""
          draggable={false}
          className="max-h-[85vh] max-w-[90vw] object-contain pointer-events-none"
          style={{ userSelect: "none" }}
        />
        {/* Invisible overlay blocks right-click on the image itself */}
        <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} />
      </div>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10">
        <ChevronRight className="text-white" size={24} />
      </button>
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10">
        <X className="text-white" size={18} />
      </button>
      <div className="absolute bottom-4 text-white/40 text-xs font-bold">{index + 1} / {images.length}</div>
    </div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    badge: "About",
    title: "Kesararam.\nWith Digital.",
    tagline: "Young Cambodian girls building road safety education through technology.",
    story: [
      "Kesararam is a primary school. A monastery. The oldest place of learning in our community, where children grow up knowing that education does not just prepare them for life — it is the foundation of life.",
      "We carry that belief into a world that technology is changing every single day. AI is changing how people work. Automation is changing every industry. But young girls from communities like ours are rarely in that picture. We are here to change that.",
      "Kesararam With Digital is a team of young Cambodian girls stepping into the world of AI and technology — not to watch, but to create.",
      "We have a mentor who believed in us before we believed in ourselves. Who taught us that AI is not something to fear — it is something to use with intention. Not to replace our thinking, but to sharpen it.",
      "The monastery taught us discipline. The school taught us to think in theory. Our mentor is teaching us to think in practice. And through Technovation Girls we are learning to think like entrepreneurs who build for the world.",
      "Kesararam. With Digital. Guided with purpose. Ready to lead.",
    ],
    mvv: [
      { title: "Mission", color: "#eab308", text: "Make Cambodia's driving theory education accessible to every student through modern, bilingual digital tools — reducing road accidents by building knowledge before the wheel." },
      { title: "Vision", color: "#22c55e", text: "A Cambodia where every driver understands road safety deeply. Where young girls from monastery schools are recognized as technology creators, not just consumers." },
      { title: "Values", color: "#3b82f6", text: "Accessibility. Accuracy. Student-first design. Bilingual by default. Empowerment through technology. Guided by the UN SDGs — Quality Education (SDG 4) and Sustainable Cities & Communities (SDG 11)." },
    ],
    techSection: "Technovation Alignment",
    techItems: [
      { label: "Competition", text: "Technovation Girls — Global technology entrepreneurship program for girls.", href: "https://technovationchallenge.org/competition/" },
      { label: "Curriculum", text: "AI in Action & Senior Division curriculum aligned with our platform.", href: "https://technovationchallenge.org/courses/ai-in-action-curriculum/" },
      { label: "Submission Guidelines", text: "Our project follows Technovation's official submission standards.", href: "https://technovationchallenge.org/submission-guidelines/" },
      { label: "Safety Standards", text: "Child safety and volunteer code of conduct strictly followed.", href: "https://technovationchallenge.org/safety/" },
      { label: "Educator Standards", text: "Curriculum aligned with global education standards.", href: "https://www.technovation.org/educators/" },
      { label: "SDG Alignment", text: "Supporting SDG 4 (Quality Education) and SDG 11 (Sustainable Cities & Communities).", href: "https://sdgs.un.org/goals" },
    ],
    galleryTitle: "Our Journey",
    gallerySubtitle: "Click any photo to view full size",
    testimonialsTitle: "What People Say",
    testimonials: [
      { name: "Mentor", role: "Technovation Girls Mentor", text: "These girls didn't just build an app — they built confidence. Watching them go from 'I don't know how' to 'I built this' is the most rewarding thing I've ever been part of." },
      { name: "Teacher", role: "Kesararam Primary School", text: "KWD proves that road safety education can be engaging, bilingual, and student-led. Our students are proud to see their school on a global stage." },
      { name: "Student", role: "KWD User", text: "I used to be afraid of the driving theory exam. Now I practice every day on KWD and I feel ready. The Khmer language support makes everything so much clearer." },    ],
    legalTitle: "Legal & Privacy",
    legalText: "KWD is committed to protecting user privacy, especially for students. Our platform follows Technovation's safety guidelines and Cambodia's data protection principles.",
    privacyBtn: "Privacy Policy",
    termsBtn: "Terms of Service",
  },
  kh: {
    badge: "អំពីយើង",
    title: "កេសរារាម.\nជាមួយឌីជីថល.",
    tagline: "ក្មេងស្រីខ្មែរកំពុងបង្កើតការអប់រំសុវត្ថិភាពផ្លូវវិថីតាមរយៈបច្ចេកវិទ្យា។",
    story: [
      "កេសរារាមគឺជាសាលាបឋមសិក្សា។ ជាវត្តអារាម។ ជាកន្លែងសិក្សាចំណាស់បំផុតក្នុងសហគមន៍យើង ដែលកុមារធំឡើងដោយដឹងថាការអប់រំមិនត្រឹមតែត្រៀមខ្លួនសម្រាប់ជីវិតប៉ុណ្ណោះ — វាជាគ្រឹះនៃជីវិត។",
      "យើងនាំទស្សននោះចូលក្នុងពិភពលោកដែលបច្ចេកវិទ្យាកំពុងផ្លាស់ប្តូររៀងរាល់ថ្ងៃ។ AI កំពុងផ្លាស់ប្តូររបៀបធ្វើការ។ ស្វ័យប្រវត្តិកម្មកំពុងផ្លាស់ប្តូររាល់ឧស្សាហកម្ម។ ប៉ុន្តែក្មេងស្រីពីសហគមន៍ដូចយើងកម្រនៅក្នុងរូបភាពនោះ។ យើងនៅទីនេះដើម្បីផ្លាស់ប្តូរវា។",
      "Kesararam With Digital គឺជាក្រុមក្មេងស្រីខ្មែរដែលកំពុងជ្រៀតចូលក្នុងពិភព AI និងបច្ចេកវិទ្យា — មិនមែនដើម្បីមើល ប៉ុន្តែដើម្បីបង្កើត។",
      "យើងមានអ្នកណែនាំដែលជឿជាក់លើយើងមុនពេលយើងជឿជាក់លើខ្លួនឯង។ ដែលបង្រៀនយើងថា AI មិនមែនជារឿងដែលត្រូវខ្លាច — វាជារឿងដែលត្រូវប្រើប្រាស់ដោយចេតនា។",
      "វត្តបង្រៀនយើងនូវវិន័យ។ សាលាបង្រៀនយើងឱ្យគិតក្នុងទ្រឹស្ដី។ អ្នកណែនាំបង្រៀនយើងឱ្យគិតក្នុងការអនុវត្ត។ ហើយតាមរយៈ Technovation Girls យើងកំពុងរៀនគិតដូចជាអ្នកសហគ្រិនដែលបង្កើតសម្រាប់ពិភពលោក។",
      "កេសរារាម ជាមួយ ឌីជីថល។ ដឹកនាំដោយគោលបំណង។ ត្រៀមខ្លួនប្រគួតប្រជែងភាពឆ្នៃប្រឌិត។",
    ],
    mvv: [
      { title: "បេសកកម្ម", color: "#eab308", text: "ធ្វើឱ្យការអប់រំទ្រឹស្ដីបើកបរ ស្គាល់សញ្ញាចរាចរ ​អាចចូលប្រើបានដោយសិស្សគ្រប់រូប តាមរយៈឧបករណ៍ឌីជីថលទំនើប ជាភាសាខ្មែរ-អង់គ្លេស — កាត់បន្ថយគ្រោះថ្នាក់ចរាចរដោយបង្កើតចំណេះដឹងមុនពេលបើកបរ។" },
      { title: "ចក្ខុវិស័យ", color: "#22c55e", text: "កម្ពុជាដែលអ្នកបើកបររាល់រូបយល់ដឹងអំពីសុវត្ថិភាពផ្លូវវិថីយ៉ាងជ្រៅ។ ដែលក្មេងស្រីពីសាលាក្បែរវត្តអារាម ត្រូវបានទទួលស្គាល់ជាអ្នកបង្កើតបច្ចេកវិទ្យា មិនមែនត្រឹមតែជាអ្នកប្រើប្រាស់ប៉ុណ្ណោះ។" },
      { title: "គុណតម្លៃ", color: "#3b82f6", text: "ភាពអាចចូលប្រើបាន។ ភាពត្រឹមត្រូវ។ ការរចនាដែលផ្តោតលើសិស្ស។ ជាភាសាពីរដោយលំនាំដើម។ ការផ្តល់អំណាចតាមរយៈបច្ចេកវិទ្យា។ ដឹកនាំដោយ SDG របស់អង្គការសហប្រជាជាតិ — ការអប់រំប្រកបដោយគុណភាព (SDG 4) និងទីក្រុងប្រកបដោយចីរភាព (SDG 11)។" },
    ],
    techSection: "ការតម្រឹមស្របជាមួយ Technovation",
    techItems: [
      { label: "ការប្រកួត", text: "Technovation Girls — កម្មវិធីសហគ្រិនភាពបច្ចេកវិទ្យាសកលសម្រាប់ក្មេងស្រី។", href: "https://technovationchallenge.org/competition/" },
      { label: "កម្មវិធីសិក្សា", text: "AI in Action និងកម្មវិធីសិក្សា Jonior Division ត្រូវបានតម្រឹមស្របជាមួយវេទិការបស់យើង។", href: "https://technovationchallenge.org/courses/ai-in-action-curriculum/" },
      { label: "ការណែនាំការដាក់ស្នើ", text: "គម្រោងរបស់យើងអនុវត្តតាមស្តង់ដារការដាក់ស្នើផ្លូវការរបស់ Technovation។", href: "https://technovationchallenge.org/submission-guidelines/" },
      { label: "ស្តង់ដារសុវត្ថិភាព", text: "សុវត្ថិភាពកុមារ និងក្រមប្រតិបត្តិអ្នកស្ម័គ្រចិត្តត្រូវបានអនុវត្តយ៉ាងតឹងរ៉ឹង។", href: "https://technovationchallenge.org/safety/" },
      { label: "ស្តង់ដារអ្នកអប់រំ", text: "កម្មវិធីសិក្សាត្រូវបានតម្រឹមស្របជាមួយស្តង់ដារអប់រំសកល។", href: "https://www.technovation.org/educators/" },
      { label: "ការតម្រឹម SDG", text: "គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុងប្រកបដោយចីរភាព)។", href: "https://sdgs.un.org/goals" },
    ],
    galleryTitle: "ដំណើររបស់យើង",
    gallerySubtitle: "ចុចលើរូបភាពណាមួយដើម្បីមើលពេញ",
    testimonialsTitle: "អ្វីដែលមនុស្សនិយាយ",
    testimonials: [
      { name: "អ្នកណែនាំ", role: "Technovation Girls Mentor", text: "ក្មេងស្រីទាំងនេះមិនត្រឹមតែបង្កើតកម្មវិធីប៉ុណ្ណោះ — ពួកគេបង្កើតទំនុកចិត្ត។ ការមើលឃើញពួកគេផ្លាស់ប្តូរពី 'ខ្ញុំមិនដឹងរបៀប' ទៅ 'ខ្ញុំបង្កើតវា' គឺជារឿងដ៏ពេញចិត្តបំផុតដែលខ្ញុំធ្លាប់ចូលរួម។" },
      { name: "គ្រូ", role: "សាលាបឋមសិក្សាកេសរារាម", text: "KWD បង្ហាញថាការអប់រំសុវត្ថិភាពផ្លូវវិថីអាចទាក់ទាញ ជាភាសាពីរ និងដឹកនាំដោយសិស្ស។ សិស្សរបស់យើងមានមោទនភាពដែលឃើញសាលារបស់ពួកគេនៅលើឆាកសកល។" },
      { name: "សិស្ស", role: "អ្នកប្រើ KWD", text: "ខ្ញុំធ្លាប់ខ្លាចការប្រឡងទ្រឹស្ដីបើកបរ។ ឥឡូវខ្ញុំហ្វឹកហ្វឺនរៀងរាល់ថ្ងៃនៅ KWD ហើយខ្ញុំត្រៀមខ្លួន។ ការគាំទ្រភាសាខ្មែរធ្វើឱ្យអ្វីៗច្បាស់ជាងច្រើន។" },
    ],
    legalTitle: "ច្បាប់ និងភាពឯកជន",
    legalText: "KWD ប្តេជ្ញាការពារភាពឯកជនរបស់អ្នកប្រើ ជាពិសេសសិស្ស។ វេទិការបស់យើងអនុវត្តតាមការណែនាំសុវត្ថិភាពរបស់ Technovation និងគោលការណ៍ការពារទិន្នន័យរបស់កម្ពុជា។",
    privacyBtn: "គោលការណ៍ភាពឯកជន",
    termsBtn: "លក្ខខណ្ឌប្រើប្រាស់",
  },
};

// ── Main component ────────────────────────────────────────────────────────────

export function AboutClient() {
  const { lang } = useLang();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);

  const c = CONTENT[lang === "kh" ? "kh" : "en"];
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  function openLightbox(i: number) { setLightboxIdx(i); }
  function closeLightbox() { setLightboxIdx(null); }
  function prevImg() { setLightboxIdx(i => i !== null ? (i - 1 + GALLERY.length) % GALLERY.length : 0); }
  function nextImg() { setLightboxIdx(i => i !== null ? (i + 1) % GALLERY.length : 0); }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b-4 border-black" style={{ background: "linear-gradient(135deg,#09090b 0%,#18181b 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-xl">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 border-2 border-yellow-400">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />{c.badge}
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight whitespace-pre-line" style={khFont}>{c.title}</h1>
              <p className="text-white/50 text-sm md:text-base leading-relaxed" style={khFont}>{c.tagline}</p>
            </div>
            {/* Hero team photo */}
            <div className="relative w-full md:w-72 h-52 md:h-64 border-2 border-yellow-400 overflow-hidden flex-shrink-0" style={{ boxShadow:"6px 6px 0 #ca8a04" }}
              onContextMenu={e => e.preventDefault()}>
              <img src={GALLERY[0]} alt="Team KWD" draggable={false} className="w-full h-full object-cover pointer-events-none" style={{ userSelect:"none" }} />
              <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
                <p className="text-white font-black text-xs" style={khFont}>Team KWD · Technovation Girls Cambodia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-16">

        {/* ── Team Story ── */}
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1 flex flex-col gap-4">
            {c.story.map((para, i) => (
              <p key={i} className={`leading-relaxed text-zinc-700 ${i === c.story.length - 1 ? "font-black text-black text-base" : "text-sm md:text-base"}`} style={khFont}>{para}</p>
            ))}
          </div>
          <div className="w-full md:w-64 flex-shrink-0 border-2 border-black overflow-hidden" style={{ boxShadow:"4px 4px 0 #000" }}
            onContextMenu={e => e.preventDefault()}>
            <div className="relative overflow-hidden">
              <img src={GALLERY[1]} alt="Team" draggable={false} className="w-full h-48 object-cover pointer-events-none" style={{ userSelect:"none" }} />
              <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
            </div>
            <div className="relative overflow-hidden border-t-2 border-black">
              <img src={GALLERY[2]} alt="Team" draggable={false} className="w-full h-48 object-cover pointer-events-none" style={{ userSelect:"none" }} />
              <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
            </div>
          </div>
        </div>

        {/* ── Mission Vision Values ── */}
        <div>
          <div className="inline-block bg-black text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-5">
            {kh ? "បេសកកម្ម · ចក្ខុវិស័យ · គុណតម្លៃ" : "Mission · Vision · Values"}
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {c.mvv.map(({ title, color, text }) => (
              <div key={title} className="bg-white border-2 border-black p-6 flex flex-col gap-3" style={{ boxShadow:`4px 4px 0 ${color}` }}>
                <div className="w-8 h-2 border-2 border-black" style={{ backgroundColor: color }} />
                <h3 className="text-lg font-black" style={khFont}>{title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed" style={khFont}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Technovation Alignment ── */}
        <div>
          <div className="inline-block bg-black text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-5">{c.techSection}</div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {c.techItems.map(({ label, text, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-2 p-4 bg-white border-2 border-black hover:-translate-y-1 transition-all"
                style={{ boxShadow:"3px 3px 0 #000" }}>
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600" style={khFont}>{label}</span>
                <p className="text-xs text-zinc-600 leading-relaxed flex-1" style={khFont}>{text}</p>
                <span className="text-[10px] text-zinc-400 font-bold">↗ {href.replace("https://","").split("/")[0]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Gallery ── */}
        <div>
          <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
            <div>
              <div className="inline-block bg-black text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-2">{c.galleryTitle}</div>
              <p className="text-xs text-zinc-400" style={khFont}>{c.gallerySubtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {GALLERY.map((src, i) => (
              <button key={i} onClick={() => openLightbox(i)}
                className="relative aspect-square overflow-hidden border-2 border-black group"
                onMouseEnter={() => setHoveredImg(i)} onMouseLeave={() => setHoveredImg(null)}
                onContextMenu={e => e.preventDefault()}>
                <img src={src} alt="" draggable={false}
                  className="w-full h-full object-cover transition-all duration-400 pointer-events-none"
                  style={{ filter: hoveredImg === i ? "none" : "grayscale(100%)", transform: hoveredImg === i ? "scale(1.08)" : "scale(1)", userSelect: "none" }} />
                {/* Full-cover transparent shield — blocks right-click save */}
                <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Testimonials ── */}
        <div>
          <div className="inline-block bg-black text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-5">{c.testimonialsTitle}</div>
          <div className="grid md:grid-cols-3 gap-5">
            {c.testimonials.map(({ name, role, text }) => {
              const initials = name.slice(0, 2).toUpperCase();
              const colors = ["#eab308", "#22c55e", "#3b82f6"];
              const ci = c.testimonials.indexOf({ name, role, text } as typeof c.testimonials[0]);
              const color = colors[c.testimonials.findIndex(t => t.name === name)] ?? "#eab308";
              return (
              <div key={name} className="bg-white border-2 border-black p-6 flex flex-col gap-3" style={{ boxShadow:"4px 4px 0 #eab308" }}>
                <div className="text-yellow-400 text-2xl font-black leading-none">"</div>
                <p className="text-sm text-zinc-700 leading-relaxed flex-1 italic" style={khFont}>{text}</p>
                <div className="border-t-2 border-black pt-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0 border-2 border-black"
                    style={{ backgroundColor: color }}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-black text-sm text-black leading-tight" style={khFont}>{name}</p>
                    <p className="text-[10px] text-zinc-400" style={khFont}>{role}</p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* ── Legal ── */}
        <div className="bg-zinc-950 border-2 border-black p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5" style={{ boxShadow:"4px 4px 0 #000" }}>
          <div>
            <p className="font-black text-white text-lg mb-2" style={khFont}>{c.legalTitle}</p>
            <p className="text-zinc-400 text-sm max-w-lg leading-relaxed" style={khFont}>{c.legalText}</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Link href="/privacy" className="text-xs font-black px-4 py-2 bg-yellow-400 text-black border-2 border-yellow-400 hover:-translate-y-0.5 transition-all" style={{ boxShadow:"3px 3px 0 #ca8a04", ...khFont }}>{c.privacyBtn}</Link>
            <Link href="/terms" className="text-xs font-black px-4 py-2 bg-transparent text-white border-2 border-white/30 hover:border-white transition-all" style={khFont}>{c.termsBtn}</Link>
          </div>
        </div>

      </div>

      {/* ── Team Section ── */}
      <TeamSection />

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox images={GALLERY} index={lightboxIdx} onClose={closeLightbox} onPrev={prevImg} onNext={nextImg} />
      )}
    </div>
  );
}
