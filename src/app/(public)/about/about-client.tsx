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
      { title: "Mission", color: "#eab308", text: "Make Cambodia's driving theory and traffic sign education accessible to every student through modern, bilingual digital tools — reducing road accidents by building knowledge before the wheel." },
      { title: "Vision", color: "#22c55e", text: "A Cambodia where every driver understands road safety and traffic signs deeply. Where young girls from monastery schools are recognized as technology creators, not just consumers." },
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
      { icon: "🧑‍🏫", name: "Mentor", role: "Technovation Girls Mentor", text: "These girls didn't just build an app — they built confidence. Watching them go from 'I don't know how' to 'I built this' is the most rewarding thing I've ever been part of." },
      { icon: "📚", name: "Teacher", role: "Kesararam Primary School", text: "KWD proves that road safety education can be engaging, bilingual, and student-led. Our students are proud to see their school on a global stage." },
      { icon: "🎓", name: "Student", role: "KWD User", text: "I used to be afraid of the driving theory exam. Now I practice every day on KWD and I feel ready. The Khmer language support makes everything so much clearer." },
      { icon: "👮", name: "Local Police Officer", role: "Traffic Safety Department", text: "We are impressed by this platform. It asks more questions and covers more types of questions than we expected from a student project. This kind of education can genuinely reduce road accidents in our community." },
      { icon: "👨‍👩‍👧", name: "Parent", role: "Parent of KWD Student", text: "I am so proud of this platform. My child uses it every day to study for the driving exam and has improved so much. The Khmer language makes it easy for our whole family to learn together." },
    ],
    legalTitle: "Legal & Privacy",
    legalText: "KWD is committed to protecting user privacy, especially for students. Our platform follows Technovation's safety guidelines and Cambodia's data protection principles.",
    privacyBtn: "Privacy Policy",
    termsBtn: "Terms of Service",
  },
  kh: {
    badge: "អំពីយើង",
    title: "កេសរារាម\nជាមួយឌីជីថល",
    tagline: "ស្នាដៃយុវនារីខ្មែរ៖ លើកកម្ពស់ការអប់រំសុវត្ថិភាពចរាចរណ៍ តាមរយៈនវានុវត្តន៍បច្ចេកវិទ្យា",
    story: [
      "«កេសរារាម» ទីអារាម និងសាលារៀន ដែលជាថ្នាលបណ្ដុះចំណេះដឹងចំណាស់ជាងគេក្នុងសហគមន៍របស់យើង។ ទីជម្រកអប់រំដ៏មានតម្លៃមួយនេះ បានបណ្តុះស្មារតីកុមារគ្រប់រូបឱ្យដឹងច្បាស់ថា៖ ការសិក្សាមិនមែនជាការត្រៀមលក្ខណៈសម្រាប់ជីវិតនោះទេ ព្រោះការរៀនសូត្រ គឺជាសោរដែលបើកទ្វារទៅកាន់ពិភពលោកនៃជីវិតទាំងមូល។",
      "យើងយកស្មារតីមួយនេះទៅបង្ហាញពិភពលោក ដែលបច្ចេកវិទ្យាកំពុងដើរទៅមុខយ៉ាងលឿន។ ថ្វីបើ AI និងប្រព័ន្ធស្វ័យប្រវត្តិកំពុងផ្លាស់ប្ដូរគ្រប់វិស័យការងារ ប៉ុន្តែឱកាសសម្រាប់យុវនារីក្នុងសហគមន៍ដូចពួកយើង នៅមានតិចតួចណាស់។ ហើយពួកយើងនៅទីនេះ គឺដើម្បីរួមគ្នាផ្លាស់ប្ដូរតថភាពសង្គមមួយនេះឱ្យបាន។",
      "«កេសរារាម ជាមួយឌីជីថល» (Kesararam With Digital) គឺជាបណ្តុំយុវនារីខ្មែរដែលបោះជំហានឈានចូលយុគសម័យបច្ចេកវិទ្យា និង AI ដោយមិនត្រឹមតែធ្វើជាអ្នកទទួលចំណេះដឹងពីឌីជីថលនោះទេ ប៉ុន្តែគឺដើម្បីដើរតួជាអ្នកបង្កើត និងបញ្ចេញពន្លឺអភិវឌ្ឍន៍ដោយផ្ទាល់។",
      "គាត់បានបង្រៀនយើងថា AI មិនមែនជាការគំរាមកំហែងដែលត្រូវខ្លាចនោះទេ ប៉ុន្តែវាជាឧបករណ៍ដែលត្រូវចេះប្រើប្រាស់ឱ្យត្រូវទិសដៅ។ តួនាទីរបស់វាគឺជួយដុសខាត់ការគិតរបស់យើងឱ្យកាន់តែមុតស្រួច ពោលគឺមកដើម្បីជាកម្លាំងជំនួយដល់ការត្រិះរិះ មិនមែនមកជំនួសការគិតរបស់យើងឡើយ។",
      "វត្តអារាមបង្រៀនយើងឱ្យមានវិន័យ សាលារៀនបង្រៀនយើងឱ្យស្គាល់ទ្រឹស្ដី រីឯគ្រូ Mentors បណ្តុះយើងឱ្យចេះអនុវត្តផ្ទាល់។ ក្នុងនាមជាបេក្ខនារីនៃកម្មវិធី Technovation Girls ពួកយើងកំពុងរៀនគិត និងបោះជំហានធ្វើការដូចជាសហគ្រិនវ័យក្មេង ដែលច្នៃប្រឌិតដំណោះស្រាយឌីជីថលសម្រាប់សង្គមជាតិ។",
      "«កេសរារាម ជាមួយឌីជីថល»។ គ្រឹះនៃស្មារតីសហគ្រិន ភាពច្បាស់លាស់នៃគោលបំណង និងជំហានម៉ឺងម៉ាត់ឆ្ពោះទៅកាន់ភាពជាអ្នកដឹកនាំ។",
    ],
    mvv: [
      { title: "បេសកកម្ម", color: "#eab308", text: "យើងជឿជាក់ថា បច្ចេកវិទ្យាគឺជាស្ពានចម្លងចំណេះដឹងដ៏មានប្រសិទ្ធភាពបំផុត។ តាមរយៈការធ្វើទំនើបកម្មប្រព័ន្ធអប់រំចរាចរណ៍ទៅជាទម្រង់ឌីជីថល គម្រោងរបស់យើងបានលុបបំបាត់របាំងនៃទីកន្លែង និងពេលវេលា។ សិស្សគ្រប់រូបអាចស្វែងយល់ពីទ្រឹស្ដី និងសញ្ញាចរាចរណ៍ពីរភាសាយ៉ាងងាយស្រួលត្រឹមចុងម្រាមដៃ ឱ្យតែមានការតភ្ជាប់អ៊ីនធឺណិត ដែលនេះជាគ្រឹះដ៏សំខាន់ក្នុងការកាត់បន្ថយគ្រោះថ្នាក់ និងបង្កើតវប្បធម៌បើកបរប្រកបដោយការទទួលខុសត្រូវនៅកម្ពុជា។" },
      { title: "ចក្ខុវិស័យ", color: "#22c55e", text: "ចក្ខុវិស័យរបស់យើង៖ ការចាក់គ្រឹះនៃវប្បធម៌បើកបរប្រកបដោយស្មារតីទទួលខុសត្រូវ និងចំណេះដឹងច្បាស់លាស់នៅកម្ពុជា រួមជាមួយការបើកទំព័រថ្មីសម្រាប់យុវនារីសាលាវត្តអារាម ក្នុងការបង្ហាញសក្តានុពលពិតប្រាកដ ជាអ្នកដឹកនាំបច្ចេកវិទ្យា និងជាអ្នកបង្កើតពិភពឌីជីថល។" },
      { title: "គុណតម្លៃ", color: "#3b82f6", text: "ដំណោះស្រាយឌីជីថលទ្វិភាសា (ខ្មែរ-អង់គ្លេស) ដែលឆ្លើយតបចំតម្រូវការសិស្ស ផ្អែកលើភាពងាយស្រួល និងភាពត្រឹមត្រូវកម្រិតខ្ពស់។ យើងប្រើប្រាស់បច្ចេកវិទ្យាជាកម្លាំងចលករក្នុងការបើកឱកាសសិក្សា ប្រកបដោយការប្តេជ្ញាចិត្តយ៉ាងមុតមាំក្នុងការចូលរួមសម្រេចគោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព (SDG) របស់អង្គការសហប្រជាជាតិ គឺការធានា «ការអប់រំប្រកបដោយគុណភាព (SDG 4)» និងការចូលរួមកសាង «ទីក្រុង និងសហគមន៍ប្រកបដោយចីរភាព (SDG 11)»។" },
    ],
    techSection: "ការផ្សារភ្ជាប់ជាមួយកម្មវិធី Technovation",
    techItems: [
      { label: "កម្មវិធីប្រកួតប្រជែង", text: "Technovation Girls គឺជាកម្មវិធីប្រកួតប្រជែងសហគ្រិនភាពបច្ចេកវិទ្យាកម្រិតពិភពលោក សម្រាប់យុវនារី។", href: "https://technovationchallenge.org/competition/" },
      { label: "កម្មវិធីសិក្សា", text: "វគ្គសិក្សា «AI in Action» និងមាតិកាសម្រាប់ក្រុមធំ (Senior Division) ត្រូវបានដាក់បញ្ចូលក្នុងវេទិការៀនរបស់យើង។", href: "https://technovationchallenge.org/courses/ai-in-action-curriculum/" },
      { label: "ការណែនាំអំពីការដាក់ស្នើគម្រោង", text: "គម្រោងរបស់យើងធ្វើឡើងស្របតាមស្តង់ដារ និងលក្ខខណ្ឌដាក់ស្នើផ្លូវការរបស់ Technovation។", href: "https://technovationchallenge.org/submission-guidelines/" },
      { label: "ស្តង់ដារសុវត្ថិភាព", text: "យើងអនុវត្តយ៉ាងម៉ឺងម៉ាត់នូវគោលការណ៍សុវត្ថិភាពកុមារ និងក្រមសីលធម៌សម្រាប់អ្នកស្ម័គ្រចិត្ត។", href: "https://technovationchallenge.org/safety/" },
      { label: "ស្តង់ដារអ្នកអប់រំ", text: "មាតិកាសិក្សារៀបចំឡើងស្របតាមស្តង់ដារអប់រំកម្រិតអន្តរជាតិ។", href: "https://www.technovation.org/educators/" },
      { label: "ស្របតាមគោលដៅ SDG", text: "គាំទ្រដល់គោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុង និងសហគមន៍ប្រកបដោយចីរភាព)។", href: "https://sdgs.un.org/goals" },
    ],
    galleryTitle: "ដំណើររបស់យើង",
    gallerySubtitle: "ចុចលើរូបភាពណាមួយ ដើម្បីពង្រីកមើល",
    testimonialsTitle: "មតិអ្នកប្រើប្រាស់ និងសហគមន៍",
    testimonials: [
      { icon: "🧑‍🏫", name: "គ្រូបង្វឹក (Mentor)", role: "Technovation Girls Mentor", text: "បេសកកម្មពិតប្រាកដរបស់យើង គឺការកសាងមនុស្ស រួមទន្ទឹមនឹងការបង្កើតកម្មវិធី។ ការមើលឃើញយុវនារីផ្លាស់ប្តូរឥរិយាបថពីភាពរារែក «ខ្ញុំមិនអាច» មកជាភាពម្ចាស់ការ «ខ្ញុំធ្វើបាន» គឺជាភស្តុតាងច្បាស់លាស់ថា បច្ចេកវិទ្យាបានក្លាយជាឧបករណ៍ផ្តល់អំណាចដល់ស្ត្រី ហើយនេះជាមោទនភាពដ៏ធំធេងបំផុតក្នុងនាមជាគ្រូបង្វឹក។" },
      { icon: "📚", name: "លោកគ្រូ-អ្នកគ្រូ", role: "សាលាបឋមសិក្សាកេសរារាម", text: "គម្រោង KWD គឺជាភស្តុតាងថា ការអប់រំចរាចរណ៍មិនមែនជារឿងគួរឱ្យធុញទ្រាន់ឡើយ គឺវាអាចប្រកបដោយភាពច្នៃប្រឌិត មានពីរភាសា និងជំរុញដោយថាមពលរបស់សិស្សផ្ទាល់។ វាជាមោទនភាពដ៏ធំធេងសម្រាប់សិស្សរបស់យើង ដែលបាននាំឈ្មោះសាលារបស់ខ្លួនទៅបង្ហាញពិភពលោកនៅលើឆាកអន្តរជាតិ។" },
      { icon: "🎓", name: "សិស្សានុសិស្ស", role: "អ្នកប្រើ KWD", text: "ពីការមិនសូវយល់ដឹងពីច្បាប់ផ្លូវថ្នល់ មកជាភាពច្បាស់លាស់រាល់ថ្ងៃជាមួយ KWD។ មេរៀនជាភាសាខ្មែរច្បាស់ៗ ងាយយល់ និងជួយឱ្យខ្ញុំយល់ដឹងពីសុវត្ថិភាពបាន ១០០%។" },
      { icon: "👮", name: "មន្ត្រីនគរបាលចរាចរណ៍", role: "នាយកដ្ឋានសុវត្ថិភាពចរាចរ", text: "ប្រព័ន្ធសិក្សានេះពិតជាគួរឱ្យកោតសរសើរ ទាំងការរៀបចំកម្រងសំណួរ និងប្រភេទវិញ្ញាសាដ៏សម្បូរបែប ដែលមានស្តង់ដារខ្ពស់ហួសពីការរំពឹងទុកសម្រាប់គម្រោងរបស់សិស្សសាលា។ នេះជាដំណោះស្រាយអប់រំដ៏ចំគោលដៅ ដែលនឹងក្លាយជាខែលការពារ និងកាត់បន្ថយគ្រោះថ្នាក់ចរាចរណ៍ក្នុងសហគមន៍។" },
      { icon: "👨‍👩‍👧", name: "អាណាព្យាបាលសិស្ស", role: "ឪពុកម្តាយរបស់សិស្ស KWD", text: "ខ្ញុំពិតជាមានមោទនភាពចំពោះកម្មវិធីសិក្សានេះណាស់។ កូនរបស់ខ្ញុំបានប្រើប្រាស់កម្មវិធីនេះ ដើម្បីរៀនសូត្រពីច្បាប់ចរាចរណ៍ជារៀងរាល់ថ្ងៃ ហើយគាត់យល់ដឹងបានច្រើនជាងមុន។ ម្យ៉ាងវិញទៀត ដោយសារតែកម្មវិធីនេះមានជាភាសាខ្មែរ ធ្វើឱ្យសមាជិកគ្រួសារទាំងអស់ អាចសិក្សាស្វែងយល់ជាមួយគ្នាបានយ៉ាងងាយស្រួល។" },
    ],
    legalTitle: "ច្បាប់ និងភាពឯកជន",
    legalText: "KWD ប្តេជ្ញាចិត្តយ៉ាងម៉ឺងម៉ាត់ក្នុងការការពារឯកជនភាពរបស់អ្នកប្រើប្រាស់ ជាពិសេសសិស្សានុសិស្ស។ វេទិការបស់យើងអនុវត្តតាមការណែនាំអំពីសុវត្ថិភាពរបស់ Technovation និងគោលការណ៍ការពារទិន្នន័យផ្ទាល់ខ្លួននៃព្រះរាជាណាចក្រកម្ពុជា។",
    privacyBtn: "គោលការណ៍ភាពឯកជន",
    termsBtn: "លក្ខខណ្ឌនៃការប្រើប្រាស់",
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
