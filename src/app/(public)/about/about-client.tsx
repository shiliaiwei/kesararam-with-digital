"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { X, ChevronLeft, ChevronRight, ArrowUpRight, Maximize2 } from "lucide-react";
import { TeamSection } from "@/components/about/team-section";

// ── Image protection helpers ──────────────────────────────────────────────────
// URL-safe Base64 versions of the six production-hosted road-sign mask assets.
const FACE_MASK_OVERLAYS = [
  "aHR0cHM6Ly93d3cua2VzYXJhcmFtd2l0aGRpZ2l0YWwudGVjaC9hYm91dC9mYWNlLW1hc2tzL2RpYW1vbmQtd2FybmluZy5zdmc",
  "aHR0cHM6Ly93d3cua2VzYXJhcmFtd2l0aGRpZ2l0YWwudGVjaC9hYm91dC9mYWNlLW1hc2tzL29jdGFnb24tc3RvcC5zdmc",
  "aHR0cHM6Ly93d3cua2VzYXJhcmFtd2l0aGRpZ2l0YWwudGVjaC9hYm91dC9mYWNlLW1hc2tzL2NpcmNsZS1wcm9oaWJpdG9yeS5zdmc",
  "aHR0cHM6Ly93d3cua2VzYXJhcmFtd2l0aGRpZ2l0YWwudGVjaC9hYm91dC9mYWNlLW1hc2tzL3NpZ24taW5mb3JtYXRpb24uc3Zn",
  "aHR0cHM6Ly93d3cua2VzYXJhcmFtd2l0aGRpZ2l0YWwudGVjaC9hYm91dC9mYWNlLW1hc2tzL3RyaWFuZ2xlLWNhdXRpb24uc3Zn",
  "aHR0cHM6Ly93d3cua2VzYXJhcmFtd2l0aGRpZ2l0YWwudGVjaC9hYm91dC9mYWNlLW1hc2tzL2Jhbm5lci1ndWlkZS5zdmc",
] as const;

const protect = (url: string, index: number) => {
  const mask = FACE_MASK_OVERLAYS[index % FACE_MASK_OVERLAYS.length];

  return url.replace(
    "/upload/",
    `/upload/e_blur_faces:1000/l_fetch:${mask}/c_scale,fl_region_relative,w_1.35/fl_layer_apply,g_faces/q_auto,f_auto/`,
  );
};

const GALLERY = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1783435140/OURTEAMFOUNDER_wcg9ao.webp",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760771/00057File_d4gnzg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1783437729/DSC_1031_pxbzfi.jpg",
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
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775673217/photo_2026-04-09_02-29-33_zyueex.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775673274/photo_2026-04-09_02-29-29_nxuioi.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775673225/DSC_0006_uzmstz.jpg",
  // ── June 2026 additions ──────────────────────────────────────────────────
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360550/photo_2026-06-13_17-54-17_jfey6h.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360551/dkjhgsjkhgshglsd_otb3o0.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360550/dskgsdjkhgkdshg_vilaqg.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360555/jdsghsjdhgiuehti_s2uujl.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360550/kdjhgdskjhglds_o2w9ud.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360552/kdsjhgskdhgk_s_vqi8ky.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360552/kdsjhgskldhgls_i4fvtn.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360553/kjdgfsdhgksdhlg_eiihvz.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360557/kjdngkjsdhgjkdsfhgk_wc9sb5.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360554/kjsdhgksjhgksdhguri_s9tvuw.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360555/ksghsdhtgsdfbn_u6fv92.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360555/ksjdgjksdhgk_gxfeiz.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360556/ksjdhgkjshgkjls_trlutp.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360556/photo_2026-06-12_19-24-10_mpmbsw.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360551/photo_2026-06-13_15-03-22_fx7cjs.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360553/photo_2026-06-13_17-54-23_wmfro9.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360554/photo_2026-06-13_17-54-37_kh1njh.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360554/photo_2026-06-13_17-54-52_bmdkp9.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360557/photo_2026-06-13_17-55-04_bskqbh.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360556/photo_2026-06-13_17-55-05_rjv7eu.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360557/photo_2026-06-13_17-55-39_sf6q3s.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360557/photo_2026-06-13_17-55-40_qvxpgl.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360557/photo_2026-06-13_17-56-10_gvxxz4.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360558/photo_2026-06-13_17-56-26_zkkfoa.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360558/photo_2026-06-13_18-08-55_lsnchn.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360558/photo_2026-06-13_18-09-16_rcij2d.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360558/photo_2026-06-13_18-09-42_zsgrvp.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360605/photo_2026-06-13_18-10-03_zmhdsc.jpg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1781360558/photo_2026-06-13_21-18-20_sm7chz.jpg",
];

const PROTECTED_GALLERY = GALLERY.map(protect);

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, index, onClose, onPrev, onNext }: {
  images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10">
        <ChevronLeft className="text-white" size={24} />
      </button>
      <div className="relative max-h-[85vh] max-w-[90vw]" onClick={e => e.stopPropagation()} onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()}>
        <img src={images[index]} alt="" draggable={false} className="max-h-[85vh] max-w-[90vw] object-contain pointer-events-none" style={{ userSelect: "none" }} />
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
    eyebrow: "About KWD",
    titleLine1: "KESARARAM.",
    titleLine2: "WITH DIGITAL.",
    tagline: "Young Cambodian women advancing road safety education through digital innovation and technology.",
    pullQuote: "The monastery taught us discipline. The school taught us theory. Our mentors are teaching us to apply what we have learned.",
    story: [
      "Kesararam is the name of a monastery and a primary school — the oldest seat of learning in our community. This place of great value has instilled in every child a clear understanding: the knowledge gained through education is the strong foundation for building the future, for education is the bridge toward opportunity and the very foundation of life's transformation.",
      "We carry this conviction into a world where technology is advancing at remarkable speed. As AI and automated systems transform every sector of work, we must ensure that every young woman has an equal opportunity to learn, to create, and to grow in the digital age. And we are here — together — to change that reality.",
      "Kesararam With Digital is a team of young Cambodian women actively engaging with the age of AI and digital technology — transforming knowledge into real creation and development, with a clear focus on turning problems into tangible, practical solutions.",
      "Our mentors taught us that AI is not a threat to be feared, but a tool to be used with clear direction. Its role is to sharpen our thinking — to serve as a force that strengthens our reasoning, not to replace it.",
      "The monastery taught us discipline. The school taught us theory. Our mentors are teaching us to apply what we have learned. As candidates of the Technovation Girls program, we are learning to think and work like young entrepreneurs — developing new digital solutions to solve social problems and drive national progress.",
      "Kesararam With Digital is our team — the foundation of an entrepreneurial mindset, and our collective drive toward becoming leaders guided by vision.",
    ],
    stats: [
      { value: "5", label: "Students" },
      { value: "2", label: "Mentors" },
      { value: "2", label: "Languages" },
      { value: "SDG 4 · 11", label: "UN Goals" },
    ],
    mvv: [
      { tag: "Mission", color: "#eab308", text: "We are grounded in the belief that technology is the most effective bridge for transmitting and sharing knowledge. By modernising road safety education into a digital format, we have removed the barriers of location and time — allowing every student to study driving theory and traffic signs in two languages, easily, from any smartphone or computer with internet access. This is the essential foundation for reducing accidents and building a culture of responsible driving in Cambodia." },
      { tag: "Vision",  color: "#22c55e", text: "To build the foundations of a safe, responsible, and knowledgeable driving culture in Cambodia — and to open a new chapter for young women in schools and communities, enabling them to become leaders in technology and creative builders of the digital world." },
      { tag: "Values",  color: "#3b82f6", text: "A bilingual digital solution (Khmer–English) built to respond to students' needs, with a focus on accessibility and the highest level of accuracy. We use technology as a driving force to open educational opportunity, with a firm commitment to achieving the United Nations Sustainable Development Goals — Quality Education (SDG 4) and Sustainable Cities and Communities (SDG 11)." },
    ],
    techSection: "Technovation Alignment",
    techItems: [
      { label: "Competition",          text: "Technovation Girls — Global technology entrepreneurship for girls.", href: "https://technovationchallenge.org/competition/" },
      { label: "Curriculum",           text: "AI in Action & Senior Division curriculum aligned with our platform.", href: "https://technovationchallenge.org/courses/ai-in-action-curriculum/" },
      { label: "Submission",           text: "Follows Technovation's official submission standards.", href: "https://technovationchallenge.org/submission-guidelines/" },
      { label: "Safety Standards",     text: "Child safety and volunteer code of conduct strictly followed.", href: "https://technovationchallenge.org/safety/" },
      { label: "Educator Standards",   text: "Curriculum aligned with global education standards.", href: "https://www.technovation.org/educators/" },
      { label: "SDG Alignment",        text: "SDG 4 (Quality Education) and SDG 11 (Sustainable Cities & Communities).", href: "https://sdgs.un.org/goals" },
    ],
    galleryTitle: "Our Journey",
    galleryView: "View photo",
    testimonials: [
      { name: "Mentor",            role: "Technovation Girls",          text: "These girls didn't just build an app — they built confidence. Watching them go from 'I don't know how' to 'I built this' is the most rewarding thing I've ever been part of." },
      { name: "Teacher",           role: "Kesararam Primary School",    text: "KWD proves that road safety education can be engaging, bilingual, and student-led. Our students are proud to see their school on a global stage." },
      { name: "Student",           role: "KWD User",                    text: "I used to be afraid of the driving theory exam. Now I practice every day on KWD and feel ready. The Khmer support makes everything so much clearer." },
      { name: "Police Officer",    role: "Traffic Safety Department",   text: "We are impressed by this platform. It covers more than we expected from a student project. This kind of education can genuinely reduce road accidents." },
      { name: "Parent",            role: "Parent of KWD Student",       text: "I am so proud of this platform. My child uses it every day to study for the exam. The Khmer language makes it easy for our whole family to learn together." },
    ],
    legalTitle: "Legal & Privacy",
    legalText: "KWD is committed to protecting user privacy, especially for students. Our platform follows Technovation's safety guidelines and Cambodia's data protection principles.",
    privacyBtn: "Privacy Policy",
    termsBtn: "Terms of Use",
  },
  kh: {
    eyebrow: "អំពីយើង",
    titleLine1: "កេសរារាម.",
    titleLine2: "ជាមួយឌីជីថល.",
    tagline: "ស្នាដៃយុវតីខ្មែរ៖ លើកកម្ពស់ការអប់រំ យល់ដឹងពីសុវត្ថិភាពចរាចរណ៍ តាមរយៈនវានុវត្តន៍បច្ចេកវិទ្យា",
    pullQuote: "វត្តអារាមបង្រៀនយើងឱ្យមានវិន័យ សាលារៀនបង្រៀនយើងឱ្យស្គាល់ទ្រឹស្ដី រីឯគ្រូ Mentors បណ្តុះយើងឱ្យចេះអនុវត្តផ្ទាល់។",
    story: [
      "កេសរារាម ជាឈ្មោះសម្គាល់នៃទីអារាម និងសាលារៀន ដែលជាថ្នាលបណ្ដុះចំណេះដឹងចំណាស់ជាងគេក្នុងសហគមន៍របស់យើង។ ទីគ្រឹះស្ថានដ៏មានតម្លៃមួយនេះ បានបណ្តុះស្មារតីកុមារគ្រប់រូបឱ្យដឹងច្បាស់ថា ចំណេះដឹងដែលទទួលបានពីការសិក្សា គឺជាគ្រឹះដ៏រឹងមាំសម្រាប់កសាងអនាគត ព្រោះការអប់រំ គឺជាស្ពានឆ្ពោះទៅរកឱកាស និងជាមូលដ្ឋានគ្រឹះនៃការផ្លាស់ប្តូរជីវិត។",
      "យើងយកស្មារតីមួយនេះទៅបង្ហាញពិភពលោក ដែលបច្ចេកវិទ្យាកំពុងដើរទៅមុខយ៉ាងលឿន។ នៅពេលដែល AI និងប្រព័ន្ធស្វ័យប្រវត្តិកំពុងផ្លាស់ប្ដូរគ្រប់វិស័យការងារ យើងត្រូវធានាថា រាល់យុវតីមានឱកាសស្មើគ្នាក្នុងការរៀន បង្កើត និងរីកចម្រើនក្នុងយុគសម័យឌីជីថល។ ហើយពួកយើងនៅទីនេះ គឺដើម្បីរួមគ្នាផ្លាស់ប្ដូរតថភាពសង្គមមួយនេះឱ្យបាន។",
      "កេសរារាម ជាមួយឌីជីថល (Kesararam With Digital) គឺជាក្រុមយុវតីខ្មែរដែលចូលរួមយ៉ាងសកម្មក្នុងយុគសម័យ AI និងបច្ចេកវិទ្យាឌីជីថល ការបម្លែងចំណេះដឹងទៅជាការបង្កើត និងការអភិវឌ្ឍពិតប្រាកដ ដោយផ្តោតលើការប្រែក្លាយបញ្ហាទៅជាដំណោះស្រាយជាក់ស្តែង។",
      "គ្រូ Mentors បានបង្រៀនយើងថា AI មិនមែនជាការគំរាមកំហែងដែលត្រូវខ្លាចនោះទេ ប៉ុន្តែវាជាឧបករណ៍ដែលត្រូវចេះប្រើប្រាស់ឱ្យត្រូវទិសដៅ។ តួនាទីរបស់វាគឺជួយដុសខាត់ការគិតរបស់យើងឱ្យកាន់តែមុតស្រួច ពោលគឺមកដើម្បីជាកម្លាំងជំនួយដល់ការត្រិះរិះ មិនមែនមកជំនួសការគិតរបស់យើងឡើយ។",
      "វត្តអារាមបង្រៀនយើងឱ្យមានវិន័យ សាលារៀនបង្រៀនយើងឱ្យស្គាល់ទ្រឹស្ដី រីឯគ្រូ Mentors បណ្តុះយើងឱ្យចេះអនុវត្តផ្ទាល់។ ក្នុងនាមជាបេក្ខនារីនៃកម្មវិធី Technovation Girls ពួកយើងកំពុងរៀនគិត និងបោះជំហានធ្វើការដូចជាសហគ្រិនវ័យក្មេង ដែលអភិវឌ្ឍដំណោះស្រាយឌីជីថលថ្មីៗ ដើម្បីដោះស្រាយបញ្ហាសង្គម និងជំរុញការរីកចម្រើនជាតិ។",
      "កេសរារាម ជាមួយឌីជីថល គឺជាក្រុមរបស់យើង ដែលជាគ្រឹះសម្រាប់ស្មារតីសហគ្រិន និងការរួមគ្នារុញឆ្ពោះទៅភាពជាអ្នកដឹកនាំប្រកបដោយចក្ខុវិស័យ។",
    ],
    stats: [
      { value: "5",       label: "សិស្ស" },
      { value: "2",       label: "គ្រូណែនាំ" },
      { value: "2",       label: "ភាសា" },
      { value: "SDG 4·11",label: "គោលដៅ UN" },
    ],
    mvv: [
      { tag: "បេសកកម្ម", color: "#eab308", text: "យើងផ្តោតលើការជឿជាក់ថាបច្ចេកវិទ្យាគឺជាស្ពានដ៏មានប្រសិទ្ធភាពក្នុងការចម្លង និងចែករំលែកចំណេះដឹង។ តាមរយៈការធ្វើទំនើបកម្មការអប់រំចរាចរណ៍ទៅជាទម្រង់ឌីជីថល យើងបានធ្វើឱ្យការរៀនមិនមានដែនកំណត់ទីកន្លែង និងពេលវេលា ដើម្បីឱ្យសិស្សគ្រប់រូបអាចរៀនសូត្រទ្រឹស្ដី និងសញ្ញាចរាចរណ៍ពីរភាសាបានយ៉ាងងាយស្រួលដោយប្រើស្មាតហ្វូន ឬកុំព្យូទ័រ នៅគ្រប់ទីកន្លែងដែលមានអ៊ីនធឺណិត។ នេះជាគ្រឹះសំខាន់ក្នុងការកាត់បន្ថយគ្រោះថ្នាក់ និងបង្កើតវប្បធម៌បើកបរដែលមានការទទួលខុសត្រូវនៅកម្ពុជា។" },
      { tag: "ចក្ខុវិស័យ",color: "#22c55e", text: "ចាក់គ្រឹះវប្បធម៌បើកបរដែលមានសុវត្ថិភាព ស្មារតីទទួលខុសត្រូវ និងចំណេះដឹងច្បាស់លាស់នៅកម្ពុជា ព្រមទាំងបើកទំព័រថ្មីសម្រាប់យុវតីសាលា និងសហគមន៍ ក្នុងការក្លាយជាអ្នកដឹកនាំប្រើបច្ចេកវិទ្យា និងអ្នកបង្កើតពិភពឌីជីថលប្រកបដោយច្នៃប្រឌិត។" },
      { tag: "គុណតម្លៃ", color: "#3b82f6", text: "ដំណោះស្រាយឌីជីថលពីរភាសា (ខ្មែរ–អង់គ្លេស) ដែលបង្កើតឡើងដើម្បីឆ្លើយតបតម្រូវការសិស្ស ដោយផ្តោតលើភាពងាយស្រួល និងភាពត្រឹមត្រូវកម្រិតខ្ពស់ យើងប្រើប្រាស់បច្ចេកវិទ្យាជាកម្លាំងចលករ ប្រកបដោយការប្តេជ្ញាចិត្តក្នុងការសម្រេចគោលដៅ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) និង SDG 11 (ទីក្រុង និងសហគមន៍ប្រកបដោយចីរភាព)។" },
    ],
    techSection: "ការផ្សារភ្ជាប់ Technovation",
    techItems: [
      { label: "ការប្រកួត",                text: "Technovation Girls — ការប្រកួតសហគ្រិនភាពបច្ចេកវិទ្យាពិភពលោក", href: "https://technovationchallenge.org/competition/" },
      { label: "កម្មវិធីសិក្សា",           text: "AI in Action & Senior Division ដែលសមស្របនឹងថ្នាល់របស់យើង", href: "https://technovationchallenge.org/courses/ai-in-action-curriculum/" },
      { label: "ការដាក់ស្នើ",             text: "ស្របតាម Submission Standards ផ្លូវការ", href: "https://technovationchallenge.org/submission-guidelines/" },
      { label: "ស្តង់ដារសុវត្ថិភាព",       text: "ក្រមសីលធម៌ការពារកុមារ និងអ្នកស្ម័គ្រចិត្ត", href: "https://technovationchallenge.org/safety/" },
      { label: "ស្តង់ដារអ្នកអប់រំ",        text: "ការអប់រំស្របតាមស្តង់ដារអន្តរជាតិ", href: "https://www.technovation.org/educators/" },
      { label: "SDG",                      text: "SDG 4 (ការអប់រំ) · SDG 11 (ទីក្រុងប្រកបដោយចីរភាព)", href: "https://sdgs.un.org/goals" },
    ],
    galleryTitle: "ដំណើររបស់យើង",
    galleryView: "មើលរូបភាព",
    testimonials: [
      { name: "គ្រូណែនាំ",          role: "Technovation Girls",         text: "ពួកគេមិនបានបង្កើតតែ app ប៉ុណ្ណោះទេ — ពួកគេបានបង្កើតទំនុកចិត្ត។ ការមើលឃើញការផ្លាស់ប្ដូរពី «ខ្ញុំមិនដឹងទេ» ទៅ «ខ្ញុំបានធ្វើ» ជាបទពិសោធន៍ដ៏មានន័យ ហើយជាមោទនភាពដ៏ធំធេងបំផុត។" },
      { name: "លោកគ្រូ",            role: "សាលាបឋមសិក្សាកេសរារាម",      text: "KWD បញ្ជាក់ថា ការអប់រំចរាចរអាចច្នៃប្រឌិត ២ ភាសា និងដឹកនាំដោយសិស្ស។ សិស្សរបស់យើងមោទនភាពដែលឈ្មោះសាលានៅលើឆាកអន្តរជាតិ។" },
      { name: "សិស្ស",               role: "អ្នកប្រើ KWD",               text: "ពីការភ័យខ្លាចការប្រឡង ទៅជាការហ្វឹកហ្វឺនរៀងរាល់ថ្ងៃ ដោយ KWD — ភាសាខ្មែរ ច្បាស់ ងាយ យល់ ១០០%។" },
      { name: "មន្ត្រីចរាចរ",        role: "នាយកដ្ឋានសុវត្ថិភាពចរាចរ",  text: "ប្រព័ន្ធសំណួរ និងប្រភេទវិញ្ញាសា មានស្តង់ដារខ្ពស់ ហួសពីការរំពឹងទុក។ ដំណោះស្រាយអប់រំដ៏ចំគោលដៅ ដែលនឹងកាត់បន្ថយគ្រោះថ្នាក់ចរាចរ។" },
      { name: "ឪពុក/ម្ដាយ",          role: "ឪពុកម្ដាយរបស់សិស្ស KWD",    text: "ខ្ញុំមោទនភាពពីកម្មវិធីនេះ។ កូនខ្ញុំប្រើរៀងរាល់ថ្ងៃ ហើយយល់ដឹងច្រើនជាមុន។ ភាសាខ្មែរ ជួយឱ្យក្រុមគ្រួសារទាំងមូលរៀនជាមួយគ្នា។" },
    ],
    legalTitle: "ច្បាប់ និងភាពឯកជន",
    legalText: "KWD ប្ដេជ្ញាការពារឯកជនភាពអ្នកប្រើ ជាពិសេសសិស្ស។ ថ្នាល់របស់យើងអនុវត្តតាមការណែនាំ Technovation និងគោលការណ៍ការពារទិន្នន័យកម្ពុជា។",
    privacyBtn: "គោលការណ៍ភាពឯកជន",
    termsBtn: "លក្ខខណ្ឌប្រើប្រាស់",
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export function AboutClient() {
  const { lang } = useLang();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);

  const c = CONTENT[lang === "kh" ? "kh" : "en"];
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};

  function openLightbox(i: number) { setLightboxIdx(i); }
  function closeLightbox() { setLightboxIdx(null); }
  function prevImg() { setLightboxIdx(i => i !== null ? (i - 1 + PROTECTED_GALLERY.length) % PROTECTED_GALLERY.length : 0); }
  function nextImg() { setLightboxIdx(i => i !== null ? (i + 1) % PROTECTED_GALLERY.length : 0); }

  return (
    <div className="min-h-screen bg-white">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HERO — Attention
          Psychology: High contrast anchors the eye (Von Restorff effect).
          The title is the single largest element — everything else recedes.
          Stats give immediate credibility (anchoring + social proof).
          The team photo triggers the face-recognition response — humanizes.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-zinc-950 border-b-4 border-yellow-400 overflow-hidden">
        <div className="h-1 bg-yellow-400" />
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
          <div className="grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_480px] gap-10 items-center">

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-px bg-yellow-400" />
                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-yellow-400" style={kf}>{c.eyebrow}</span>
              </div>

              {/* Primary focal point — size creates hierarchy */}
              <div style={kf}>
                <h1 className="font-black leading-[0.95] text-white" style={{ fontSize: "clamp(3rem, 9vw, 6.5rem)", letterSpacing: "-0.02em" }}>
                  {c.titleLine1}
                </h1>
                <h1 className="font-black leading-[0.95] text-yellow-400" style={{ fontSize: "clamp(3rem, 9vw, 6.5rem)", letterSpacing: "-0.02em" }}>
                  {c.titleLine2}
                </h1>
              </div>

              {/* Tagline: small contrast pulls attention back to the title */}
              <p className="text-white/50 text-sm max-w-md leading-relaxed" style={kf}>{c.tagline}</p>

              {/* Stats: social proof before the user reads a single word of body */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 mt-2">
                {c.stats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-2 px-4 py-2 border border-white/10 bg-white/5">
                    <span className="text-2xl font-black text-white leading-none">{s.value}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold" style={kf}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Face effect: real photo triggers trust faster than text */}
            <div
              className="relative w-full aspect-video border-2 border-yellow-400 overflow-hidden flex-shrink-0"
              style={{ boxShadow: "8px 8px 0 #ca8a04" }}
              onContextMenu={e => e.preventDefault()}
            >
              <img src={GALLERY[0]} alt="Team KWD" draggable={false}
                className="w-full h-full object-cover pointer-events-none"
                style={{ userSelect: "none" }} />
              <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 px-3 py-1.5 flex items-center justify-between">
                <span className="text-black font-black text-[10px] tracking-widest uppercase" style={kf}>
                  Team KWD · Technovation Girls 2026
                </span>
                <span className="text-black/50 text-[10px] font-bold">#50777</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. STORY — Interest
          Psychology: Chunking — 6 paragraphs split into 4 visual groups
          reduces cognitive load. Serial Position Effect — para 1 (first)
          and para 6 (last) get the strongest visual weight. Photos at
          natural narrative breaks act as memory anchors (Picture
          Superiority Effect). Para 4 (AI wisdom) gets a callout box —
          it is the most quotable, shareable insight on the page.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* Section label — tells users what chapter they're in */}
        <div className="flex items-center gap-3 mb-10">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400" style={kf}>
            {kh ? "សេចក្តីផ្តើម និងដំណើរការ" : "Origin & Journey"}
          </span>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        {/* GROUP A — Para 1: Foundation (Serial Position: first = most remembered)
            Full width, larger type. Sets the entire emotional tone. */}
        <div className="grid md:grid-cols-[1fr_240px] gap-10 items-start mb-12">
          <p className="text-base md:text-lg text-zinc-800 leading-relaxed font-medium" style={kf}>
            {c.story[0]}
          </p>
          <div className="relative w-full aspect-[3/2] border border-zinc-200 overflow-hidden flex-shrink-0 hidden md:block" onContextMenu={e => e.preventDefault()}>
            <img src={GALLERY[1]} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" style={{ userSelect: "none" }} />
            <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
          </div>
        </div>

        {/* GROUP B — Paras 2 + 3: Challenge → Response (2-col)
            Gestalt similarity: same size = same narrative weight (problem + response) */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 border-t border-zinc-100 pt-10">
          {c.story.slice(1, 3).map((para, i) => (
            <p key={i} className="text-sm text-zinc-600 leading-relaxed" style={kf}>{para}</p>
          ))}
        </div>

        {/* GROUP C — Para 4: AI Mentor Wisdom (Callout)
            Isolation effect: visually distinct = more memorable.
            This is the most quotable sentence in the entire story. */}
        <div className="border-l-4 border-yellow-400 bg-yellow-50 px-6 py-5 mb-12">
          <p className="text-sm md:text-base text-zinc-800 leading-relaxed italic" style={kf}>
            {c.story[3]}
          </p>
        </div>

        {/* GROUP D — Para 5: Three teachings (with photo alongside)
            The three-part structure in the text maps to a natural cognitive chunk. */}
        <div className="grid md:grid-cols-[240px_1fr] gap-10 items-start mb-12 border-t border-zinc-100 pt-10">
          <div className="relative w-full aspect-[3/2] border border-zinc-200 overflow-hidden flex-shrink-0 hidden md:block" onContextMenu={e => e.preventDefault()}>
            <img src={GALLERY[2]} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" style={{ userSelect: "none" }} />
            <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed" style={kf}>{c.story[4]}</p>
        </div>

        {/* GROUP E — Para 6: Closing declaration (Serial Position: last = most remembered)
            Yellow bar signals "this is the conclusion". Large type, wide spacing,
            isolated so the eye lands here naturally after reading everything above. */}
        <div className="mt-6 pt-10 border-t border-zinc-200">
          <div className="w-10 h-1 bg-yellow-400 mb-6" />
          <p className="text-lg md:text-2xl font-black text-zinc-900 leading-snug max-w-3xl" style={kf}>
            {c.story[5]}
          </p>
        </div>

      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. MISSION · VISION · VALUES — Desire
          Psychology: Rule of Three — humans chunk information naturally
          into threes. Mission is full-width (primary/largest) to establish
          importance via size before users reach Vision and Values.
          Color-coding gives each a distinct identity without extra words.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-zinc-50 border-t border-zinc-200 border-b border-b-zinc-200 py-14">
        <div className="max-w-6xl mx-auto px-6">

          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-zinc-300" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400" style={kf}>
              {kh ? "គោលបំណង · ចក្ខុវិស័យ · គុណតម្លៃ" : "Mission · Vision · Values"}
            </span>
            <div className="h-px flex-1 bg-zinc-300" />
          </div>

          <div className="flex flex-col gap-4">
            {/* Mission — full width, larger text = primary importance */}
            <div className="bg-white border border-zinc-200 p-8 flex flex-col gap-3"
              style={{ borderLeftWidth: 4, borderLeftColor: c.mvv[0].color }}>
              <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: c.mvv[0].color }}>
                {c.mvv[0].tag}
              </span>
              <p className="text-zinc-900 text-base md:text-lg leading-relaxed max-w-4xl" style={kf}>
                {c.mvv[0].text}
              </p>
            </div>

            {/* Vision + Values — 2-col, smaller = secondary */}
            <div className="grid md:grid-cols-2 gap-4">
              {c.mvv.slice(1).map((m) => (
                <div key={m.tag} className="bg-white border border-zinc-200 p-6 flex flex-col gap-3"
                  style={{ borderLeftWidth: 4, borderLeftColor: m.color }}>
                  <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: m.color }}>
                    {m.tag}
                  </span>
                  <p className="text-zinc-600 text-sm leading-relaxed" style={kf}>{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. TECHNOVATION — Credibility signal
          Psychology: Authority bias — alignment with a global institution
          (Technovation Girls) raises perceived credibility immediately.
          External links with ArrowUpRight signal transparency.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-zinc-900 text-yellow-400 text-[10px] font-black tracking-widest uppercase px-3 py-1" style={kf}>
            {c.techSection}
          </span>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {c.techItems.map(({ label, text, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-5 border border-zinc-200 bg-white hover:border-zinc-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600" style={kf}>{label}</span>
                <ArrowUpRight size={12} className="text-zinc-300 group-hover:text-zinc-900 shrink-0 mt-0.5 transition-colors" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed flex-1" style={kf}>{text}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. TEAM — Trust / Connection
          Psychology: The mere exposure effect + face recognition.
          Seeing real names and roles builds emotional connection.
          QR codes create active engagement (not passive reading).
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <TeamSection />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. GALLERY — Memory anchor
          Psychology: Picture superiority — images are remembered 6×
          better than words. The grayscale-to-color hover creates a
          reward loop that encourages exploration (operant conditioning).
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-t border-zinc-100 max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400" style={kf}>{c.galleryTitle}</span>
          <div className="h-px flex-1 bg-zinc-100" />
          <span className="text-[10px] text-zinc-300 font-mono">{PROTECTED_GALLERY.length}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
          {PROTECTED_GALLERY.map((src, i) => (
            <button key={i} onClick={() => openLightbox(i)}
              className="relative aspect-square overflow-hidden border border-zinc-100 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308] focus-visible:ring-offset-2"
              onMouseEnter={() => setHoveredImg(i)} onMouseLeave={() => setHoveredImg(null)}
              onContextMenu={e => e.preventDefault()}>
              <img src={src} alt="" draggable={false}
                className="w-full h-full object-cover transition-all duration-300 pointer-events-none"
                style={{
                  filter: hoveredImg === i ? "none" : "grayscale(100%) brightness(0.85)",
                  transform: hoveredImg === i ? "scale(1.06)" : "scale(1)",
                  userSelect: "none",
                }} />
              <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
              <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-300 pointer-events-none">
                <div className="caution-tape h-2" />
                <div className="flex items-center justify-between gap-2 border-t-2 border-black bg-[#eab308] px-2 py-1.5 text-black">
                  <span className="truncate text-[9px] font-black uppercase tracking-wider" style={kf}>{c.galleryView}</span>
                  <Maximize2 size={12} strokeWidth={3} className="shrink-0" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. TESTIMONIALS — Social proof
          Psychology: Diverse source types (teacher, police, parent,
          student) cover different cognitive concerns — expertise,
          authority, emotion, relatability. The featured testimonial
          (Mentor) is placed first and large because it comes from the
          person with the most institutional credibility.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-zinc-50 border-t border-zinc-200 py-14">
        <div className="max-w-6xl mx-auto px-6">

          {/* Featured: Mentor testimonial — largest, highest authority */}
          <div className="mb-6 p-8 md:p-10 bg-white border border-zinc-200"
            style={{ borderLeftWidth: 4, borderLeftColor: "#eab308" }}>
            <p className="text-4xl font-black text-yellow-400 leading-none mb-3 select-none">"</p>
            <p className="text-base md:text-lg text-zinc-800 leading-relaxed max-w-3xl" style={kf}>
              {c.testimonials[0].text}
            </p>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 border border-zinc-200 flex-shrink-0" />
              <div>
                <p className="font-black text-sm text-zinc-900" style={kf}>{c.testimonials[0].name}</p>
                <p className="text-xs text-zinc-400" style={kf}>{c.testimonials[0].role}</p>
              </div>
            </div>
          </div>

          {/* Remaining: Teacher, Student, Police, Parent — 4-col grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {c.testimonials.slice(1).map((t, i) => {
              const accents = ["#22c55e", "#3b82f6", "#f97316", "#a855f7"];
              return (
                <div key={t.name} className="bg-white border border-zinc-200 p-5 flex flex-col gap-4"
                  style={{ borderTopWidth: 3, borderTopColor: accents[i] }}>
                  <p className="text-sm text-zinc-600 leading-relaxed flex-1" style={kf}>"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0 border border-zinc-200" style={{ backgroundColor: accents[i] }} />
                    <div>
                      <p className="font-black text-xs text-zinc-900" style={kf}>{t.name}</p>
                      <p className="text-[10px] text-zinc-400" style={kf}>{t.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          8. LEGAL — Action
          Psychology: Peak-end rule — the last thing a user sees shapes
          their memory of the whole page. Calm, light, frictionless.
          One primary CTA (Privacy) + one secondary (Terms).
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-t border-zinc-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-black text-zinc-900 text-base mb-1" style={kf}>{c.legalTitle}</p>
            <p className="text-zinc-500 text-sm max-w-lg leading-relaxed" style={kf}>{c.legalText}</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/privacy"
              className="text-xs font-black px-5 py-2.5 bg-yellow-400 text-black border border-zinc-900 hover:bg-yellow-300 transition-colors"
              style={kf}>
              {c.privacyBtn}
            </Link>
            <Link href="/terms"
              className="text-xs font-black px-5 py-2.5 bg-white text-zinc-600 border border-zinc-300 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
              style={kf}>
              {c.termsBtn}
            </Link>
          </div>
        </div>
      </section>

      {lightboxIdx !== null && (
        <Lightbox images={PROTECTED_GALLERY} index={lightboxIdx} onClose={closeLightbox} onPrev={prevImg} onNext={nextImg} />
      )}
    </div>
  );
}
