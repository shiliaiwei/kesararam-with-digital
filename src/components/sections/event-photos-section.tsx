"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Camera,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Grid,
} from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape } from "@/components/brand/brand-kit";

export interface EventPhoto {
  id: string;
  url: string;
  titleEn: string;
  titleKh: string;
  category: "technovation" | "pitch" | "outreach" | "workshop";
  tagEn: string;
  tagKh: string;
  date: string;
}

export const EVENT_HIGHLIGHT_PHOTOS: EventPhoto[] = [
  // Highlights
  {
    id: "ep-01",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649329/01_h8y0wn.jpg",
    titleEn: "Technovation Girls Cambodia 2026 — National Champion Winner Moment",
    titleKh: "ពិធីប្រគល់ពានរង្វាន់ជើងឯកថ្នាក់ជាតិ Technovation Girls 2026",
    category: "technovation",
    tagEn: "National Award",
    tagKh: "ពានរង្វាន់ថ្នាក់ជាតិ",
    date: "2026",
  },
  {
    id: "ep-02",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1783437729/DSC_1031_pxbzfi.jpg",
    titleEn: "Technovation Regional Pitch Day Presentation & Judges Demo",
    titleKh: "ការបង្ហាញ Pitch ថ្នាក់តំបន់ និងការធ្វើ Demo ជូនគណៈកម្មការ",
    category: "pitch",
    tagEn: "Regional Pitch",
    tagKh: "Pitch ថ្នាក់តំបន់",
    date: "2026",
  },
  {
    id: "ep-03",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760771/00057File_d4gnzg.jpg",
    titleEn: "KWD School Outreach & Student Road Safety Training",
    titleKh: "ការចុះបង្រៀនសុវត្ថិភាពចរាចរណ៍នៅតាមសាលារៀន",
    category: "outreach",
    tagEn: "School Outreach",
    tagKh: "ចុះសាលារៀន",
    date: "2026",
  },
  {
    id: "ep-04",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760782/00078File_mqcrbt.jpg",
    titleEn: "Interactive Road Safety Quiz & Student Sign Practice Session",
    titleKh: "សកម្មភាពធ្វើតេស្តអន្តរកម្ម និងការស្គាល់សញ្ញាចរាចរណ៍",
    category: "workshop",
    tagEn: "Interactive Workshop",
    tagKh: "សកម្មភាពសិស្ស",
    date: "2026",
  },
  {
    id: "ep-05",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760777/00074File_a4s9d1.jpg",
    titleEn: "Team #50777 Mentorship & App Presentation Review",
    titleKh: "ការរៀបចំ និងត្រួតពិនិត្យការបង្ហាញកម្មវិធីជាមួយ Mentors",
    category: "pitch",
    tagEn: "Mentorship",
    tagKh: "ការណែនាំ Pitch",
    date: "2026",
  },
  {
    id: "ep-06",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760788/00081File_vs67kw.jpg",
    titleEn: "Community Road Safety Awareness Event — Siem Reap",
    titleKh: "ព្រឹត្តិការណ៍ផ្សព្វផ្សាយសុវត្ថិភាពចរាចរណ៍ ខេត្តសៀមរាប",
    category: "outreach",
    tagEn: "Siem Reap Event",
    tagKh: "ព្រឹត្តិការណ៍សៀមរាប",
    date: "2026",
  },
  {
    id: "ep-07",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760665/00058File_kxtz1c.jpg",
    titleEn: "Student Team Collaboration & Digital Learning Workshop",
    titleKh: "ការធ្វើការងារជាក្រុម និងការរៀនតាមបច្ចេកវិទ្យា",
    category: "workshop",
    tagEn: "Workshop",
    tagKh: "សិក្ខាសាលា",
    date: "2026",
  },
  {
    id: "ep-08",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760668/00088File_pgummw.jpg",
    titleEn: "National Championship Judging & Q&A Session",
    titleKh: "វគ្គឆ្លើយសំណួរជាមួយគណៈកម្មការថ្នាក់ជាតិ",
    category: "technovation",
    tagEn: "National Finals",
    tagKh: "វគ្គផ្តាច់ព្រ័ត្រ",
    date: "2026",
  },

  // 44 New Photos
  {
    id: "ep-09",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649751/photo_2026-07-26_11-17-40_2_lwimxo.jpg",
    titleEn: "Technovation Team Interactive Coding & Design Session",
    titleKh: "សកម្មភាពសរសេរកូដ និងរចនាកម្មវិធីជាក្រុម",
    category: "technovation",
    tagEn: "Tech Workshop",
    tagKh: "សិក្ខាសាលាកូដ",
    date: "2026",
  },
  {
    id: "ep-10",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649741/photo_2026-07-26_21-11-24_3_w79xtk.jpg",
    titleEn: "Regional Pitch Day — Team Presentation Stage Spotlight",
    titleKh: "ការបង្ហាញខ្លួនលើឆាក Pitch ថ្នាក់តំបន់",
    category: "pitch",
    tagEn: "Stage Spotlight",
    tagKh: "ការបង្ហាញលើឆាក",
    date: "2026",
  },
  {
    id: "ep-11",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649739/photo_2026-07-26_21-11-12_y3vs5q.jpg",
    titleEn: "KWD Interactive Road Signs Game Demonstration",
    titleKh: "ការលេងហ្គេមអន្តរកម្មស្គាល់សញ្ញាចរាចរណ៍ KWD",
    category: "workshop",
    tagEn: "Game Demo",
    tagKh: "ការលេងហ្គេម",
    date: "2026",
  },
  {
    id: "ep-12",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649739/photo_2026-07-26_21-11-13_zce6iy.jpg",
    titleEn: "School Outreach — Siem Reap Primary Student Training",
    titleKh: "ការបណ្តុះបណ្តាលសិស្សបឋមសិក្សា ខេត្តសៀមរាប",
    category: "outreach",
    tagEn: "Primary School",
    tagKh: "បឋមសិក្សា",
    date: "2026",
  },
  {
    id: "ep-13",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_11-17-40_hvdith.jpg",
    titleEn: "Mentors Guidance & App Prototype Feedback Session",
    titleKh: "ការទទួលបានការណែនាំពី Mentors លើគំរូកម្មវិធី",
    category: "technovation",
    tagEn: "Mentorship",
    tagKh: "ការណែនាំ",
    date: "2026",
  },
  {
    id: "ep-14",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_19-47-43_ifpdxo.jpg",
    titleEn: "Community Road Safety Awareness Rally — Siem Reap",
    titleKh: "យុទ្ធនាការផ្សព្វផ្សាយសុវត្ថិភាពចរាចរណ៍ក្នុងសហគមន៍",
    category: "outreach",
    tagEn: "Community Rally",
    tagKh: "យុទ្ធនាការសហគមន៍",
    date: "2026",
  },
  {
    id: "ep-15",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_21-11-39_hol6po.jpg",
    titleEn: "Technovation Regional Competition Judges Review",
    titleKh: "ការពិនិត្យវាយតម្លៃពីគណៈកម្មការថ្នាក់តំបន់",
    category: "pitch",
    tagEn: "Judges Review",
    tagKh: "ការវាយតម្លៃ",
    date: "2026",
  },
  {
    id: "ep-16",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_21-12-40_azxz7p.jpg",
    titleEn: "Team #50777 Celebration & Trophy Handover Ceremony",
    titleKh: "ការប្រគល់ពានរង្វាន់ និងការអបអរសាទរក្រុម ៥០៧៧៧",
    tagEn: "Trophy Handover",
    tagKh: "ពិធីប្រគល់ពាន",
    date: "2026",
  },
  {
    id: "ep-17",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649726/photo_2026-07-26_21-11-38_siqvii.jpg",
    titleEn: "Student Road Signs Recognition Activity in Classroom",
    titleKh: "សកម្មភាពស្គាល់ផ្លាកសញ្ញាចរាចរណ៍ក្នុងថ្នាក់រៀន",
    category: "workshop",
    tagEn: "Classroom Quiz",
    tagKh: "តេស្តក្នុងថ្នាក់",
    date: "2026",
  },
  {
    id: "ep-18",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649726/photo_2026-07-26_21-11-15_hgsy5q.jpg",
    titleEn: "Live Pitching Presentation & Audience QA",
    titleKh: "ការធ្វើ Pitching និងការឆ្លើយសំណួរទស្សនិកជន",
    category: "pitch",
    tagEn: "Live Pitch",
    tagKh: "ការបង្ហាញ Pitch",
    date: "2026",
  },
  {
    id: "ep-19",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-08-14_02-17-16_np6yql.jpg",
    titleEn: "Technovation Girls Cambodia 2026 Group Photo",
    titleKh: "រូបថតរួមក្រុម Technovation Girls Cambodia 2026",
    category: "technovation",
    tagEn: "Group Photo",
    tagKh: "រូបថតរួមក្រុម",
    date: "2026",
  },
  {
    id: "ep-20",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-08-14_02-17-02_kcmabl.jpg",
    titleEn: "Digital Road Safety Learning Booth in Siem Reap",
    titleKh: "ស្តង់រៀនសុវត្ថិភាពចរាចរណ៍ឌីជីថល នៅសៀមរាប",
    category: "outreach",
    tagEn: "Learning Booth",
    tagKh: "ស្តង់រៀនសូត្រ",
    date: "2026",
  },
  {
    id: "ep-21",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-07-26_19-46-39_lglsp7.jpg",
    titleEn: "Interactive Quiz Practice & Student Engagement",
    titleKh: "សកម្មភាពឆ្លើយសំណួរតេស្ត និងការចូលរួមរបស់សិស្ស",
    category: "workshop",
    tagEn: "Student Quiz",
    tagKh: "តេស្តអន្តរកម្ម",
    date: "2026",
  },
  {
    id: "ep-22",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-07-26_21-11-24_2_qlxdia.jpg",
    titleEn: "Technovation Girls Mentorship & Pitch Practice",
    titleKh: "ការហាត់សម Pitch ជាមួយ Mentors",
    category: "pitch",
    tagEn: "Pitch Rehearsal",
    tagKh: "ការហាត់សម Pitch",
    date: "2026",
  },
  {
    id: "ep-23",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649724/photo_2026-07-26_21-12-08_pbxhcb.jpg",
    titleEn: "Future Digital Talents Stage Recognition Photo",
    titleKh: "រូបថតកិត្តិយសលើឆាក Future Digital Talents",
    category: "technovation",
    tagEn: "Digital Award",
    tagKh: "ពានរង្វាន់ឌីជីថល",
    date: "2026",
  },
  {
    id: "ep-24",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649711/photo_2026-07-26_11-17-37_uwif2j.jpg",
    titleEn: "KWD Road Safety App User Experience Testing",
    titleKh: "ការសាកល្បងប្រព័ន្ធសុវត្ថិភាពចរាចរណ៍ KWD",
    category: "workshop",
    tagEn: "App Testing",
    tagKh: "ការសាកល្បងកម្មវិធី",
    date: "2026",
  },
  {
    id: "ep-25",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649711/photo_2026-08-14_02-18-21_mdbhen.jpg",
    titleEn: "Siem Reap School Outreach Certificate Handover",
    titleKh: "ការប្រគល់វិញ្ញាបនបត្រជូនសិស្សនៅសៀមរាប",
    category: "outreach",
    tagEn: "Outreach Certificate",
    tagKh: "វិញ្ញាបនបត្រ",
    date: "2026",
  },
  {
    id: "ep-26",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-26_21-11-18_2_riviqs.jpg",
    titleEn: "National Finals Stage Q&A with Competition Judges",
    titleKh: "វគ្គឆ្លើយសំណួរជាមួយគណៈកម្មការក្នុងវគ្គផ្តាច់ព្រ័ត្រ",
    category: "pitch",
    tagEn: "Finals Q&A",
    tagKh: "វគ្គផ្តាច់ព្រ័ត្រ",
    date: "2026",
  },
  {
    id: "ep-27",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-26_21-11-08_2_hkhduq.jpg",
    titleEn: "Technovation Girls Junior Division Team Pose",
    titleKh: "រូបថតក្រុម Junior Division Technovation",
    category: "technovation",
    tagEn: "Team Pose",
    tagKh: "រូបថតក្រុម",
    date: "2026",
  },
  {
    id: "ep-28",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-25_20-20-00_swj1du.jpg",
    titleEn: "Kesararam High School Road Safety Workshop",
    titleKh: "សិក្ខាសាលាសុវត្ថិភាពចរាចរណ៍ សាលាកេសារារាម",
    category: "outreach",
    tagEn: "Kesararam School",
    tagKh: "សាលាកេសារារាម",
    date: "2026",
  },
  {
    id: "ep-29",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-26_21-04-42_aiib4a.jpg",
    titleEn: "Student Team Collaboration & Ideation Workshop",
    titleKh: "សិក្ខាសាលាបង្កើតគំនិត និងធ្វើការងារជាក្រុម",
    category: "workshop",
    tagEn: "Ideation",
    tagKh: "ការបង្កើតគំនិត",
    date: "2026",
  },
  {
    id: "ep-30",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649709/photo_2026-07-25_20-19-51_b3corf.jpg",
    titleEn: "Interactive Quiz Banner & Student Certificates",
    titleKh: "បដាសំណួរតេស្ត និងវិញ្ញាបនបត្រសិស្ស",
    category: "outreach",
    tagEn: "Certificates",
    tagKh: "វិញ្ញាបនបត្រ",
    date: "2026",
  },
  {
    id: "ep-31",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649709/photo_2026-07-26_19-46-59_ggcdyc.jpg",
    titleEn: "Regional Pitch Demo Booth Exhibition",
    titleKh: "ស្តង់ពិព័រណ៍បង្ហាញ Demo ថ្នាក់តំបន់",
    category: "pitch",
    tagEn: "Demo Booth",
    tagKh: "ស្តង់ Demo",
    date: "2026",
  },
  {
    id: "ep-32",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649698/photo_2026-07-26_21-11-27_2_mufaix.jpg",
    titleEn: "National Championship Winner Stage Photo",
    titleKh: "រូបថតជ័យលាភីលើឆាកជើងឯកថ្នាក់ជាតិ",
    category: "technovation",
    tagEn: "National Winner",
    tagKh: "ជ័យលាភីថ្នាក់ជាតិ",
    date: "2026",
  },
  {
    id: "ep-33",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-07-25_20-20-01_jnru1f.jpg",
    titleEn: "Road Signs Safety Practice Session for Kids",
    titleKh: "ការអនុវត្តស្គាល់សញ្ញាចរាចរណ៍សម្រាប់កុមារ",
    category: "workshop",
    tagEn: "Kids Practice",
    tagKh: "ការអនុវត្តសិស្ស",
    date: "2026",
  },
  {
    id: "ep-34",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-08-14_02-18-24_izgggq.jpg",
    titleEn: "Siem Reap Student Community Road Safety Training",
    titleKh: "ការបណ្តុះបណ្តាលសុវត្ថិភាពចរាចរណ៍សហគមន៍សៀមរាប",
    category: "outreach",
    tagEn: "Siem Reap",
    tagKh: "សៀមរាប",
    date: "2026",
  },
  {
    id: "ep-35",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-07-26_21-11-48_ic2wkn.jpg",
    titleEn: "Live Pitching Presentation Audience Cheers",
    titleKh: "ការទះដៃអបអរសាទរក្នុងវគ្គ Pitching",
    category: "pitch",
    tagEn: "Audience Cheers",
    tagKh: "ការអបអរសាទរ",
    date: "2026",
  },
  {
    id: "ep-36",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-07-25_20-19-47_sxofaf.jpg",
    titleEn: "KWD Road Safety Mobile Quiz Demonstration",
    titleKh: "ការបង្ហាញតេស្តសុវត្ថិភាពចរាចរណ៍លើទូរស័ព្ទ",
    category: "workshop",
    tagEn: "Mobile Quiz",
    tagKh: "តេស្តលើទូរស័ព្ទ",
    date: "2026",
  },
  {
    id: "ep-37",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649696/photo_2026-07-25_20-19-46_snjunb.jpg",
    titleEn: "School Outreach Student Group Practice",
    titleKh: "ការអនុវត្តជាក្រុមរបស់សិស្សក្នុងសាលារៀន",
    category: "outreach",
    tagEn: "Group Practice",
    tagKh: "ការអនុវត្តជាក្រុម",
    date: "2026",
  },
  {
    id: "ep-38",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649696/photo_2026-07-25_20-19-52_zq0pcw.jpg",
    titleEn: "Student Road Safety Knowledge Sharing",
    titleKh: "ការចែករំលែកចំណេះដឹងសុវត្ថិភាពចរាចរណ៍",
    category: "workshop",
    tagEn: "Knowledge Sharing",
    tagKh: "ការចែករំលែក",
    date: "2026",
  },
  {
    id: "ep-39",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649686/photo_2026-07-26_21-11-49_trj1ff.jpg",
    titleEn: "Regional Pitch Event Judges Commendation",
    titleKh: "ការសរសើរពីគណៈកម្មការក្នុង Regional Pitch",
    category: "pitch",
    tagEn: "Judges Award",
    tagKh: "ការសរសើរ",
    date: "2026",
  },
  {
    id: "ep-40",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/Firefly_azmkqr.jpg",
    titleEn: "Technovation Girls Cambodia 2026 Promotional Banner",
    titleKh: "បដាផ្សព្វផ្សាយ Technovation Girls Cambodia 2026",
    category: "technovation",
    tagEn: "Promo Banner",
    tagKh: "បដាផ្សព្វផ្សាយ",
    date: "2026",
  },
  {
    id: "ep-41",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/photo_2026-08-14_02-18-33_kd26em.jpg",
    titleEn: "Siem Reap Outreach Workshop Group Photo",
    titleKh: "រូបថតរួមក្រុមសិក្ខាសាលា នៅសៀមរាប",
    category: "outreach",
    tagEn: "Siem Reap Group",
    tagKh: "រូបថតសៀមរាប",
    date: "2026",
  },
  {
    id: "ep-42",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/photo_2026-08-14_02-18-16_wuq1en.jpg",
    titleEn: "Students Receiving Traffic Safety Badges & Awards",
    titleKh: "សិស្សទទួលបានផ្លាកសញ្ញា និងពានរង្វាន់",
    category: "outreach",
    tagEn: "Safety Badges",
    tagKh: "ផ្លាកសញ្ញាសុវត្ថិភាព",
    date: "2026",
  },
  {
    id: "ep-43",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/photo_2026-07-26_12-49-39_2_h67uzo.jpg",
    titleEn: "Technovation Coding & App UI Prototyping Workshop",
    titleKh: "សិក្ខាសាលាសរសេរកូដ និងរចនា UI កម្មវិធី",
    category: "technovation",
    tagEn: "UI Prototyping",
    tagKh: "ការរចនា UI",
    date: "2026",
  },
  {
    id: "ep-44",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649684/photo_2026-07-26_21-12-28_cu2wdl.jpg",
    titleEn: "Regional Pitch Judges Q&A Feedback Session",
    titleKh: "វគ្គផ្តល់មតិត្រឡប់ពីគណៈកម្មការ Pitch",
    category: "pitch",
    tagEn: "Feedback Session",
    tagKh: "មតិត្រឡប់",
    date: "2026",
  },
  {
    id: "ep-45",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649645/photo_2026-07-26_19-46-43_yhtldh.jpg",
    titleEn: "Community Road Safety Interactive Booth Activity",
    titleKh: "សកម្មភាពស្តង់អន្តរកម្មសុវត្ថិភាពចរាចរណ៍",
    category: "outreach",
    tagEn: "Interactive Booth",
    tagKh: "ស្តង់អន្តរកម្ម",
    date: "2026",
  },
  {
    id: "ep-46",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649645/photo_2026-07-25_20-20-01_2_fpupkn.jpg",
    titleEn: "Student Hands-On Quiz & Road Safety Game",
    titleKh: "ការលេងហ្គេមសុវត្ថិភាពចរាចរណ៍ផ្ទាល់របស់សិស្ស",
    category: "workshop",
    tagEn: "Hands-On Game",
    tagKh: "ហ្គេមផ្ទាល់",
    date: "2026",
  },
  {
    id: "ep-47",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649645/photo_2026-07-26_21-12-17_mdehud.jpg",
    titleEn: "Stage Trophy Handover & Team Celebration",
    titleKh: "ការប្រគល់ពានរង្វាន់លើឆាក និងការអបអរសាទរ",
    category: "technovation",
    tagEn: "Stage Victory",
    tagKh: "ជ័យជម្នះលើឆាក",
    date: "2026",
  },
  {
    id: "ep-48",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649644/photo_2026-07-26_21-11-33_2_mswhwg.jpg",
    titleEn: "Pitch Day Stage Audience Presentation",
    titleKh: "ការបង្ហាញគម្រោងលើឆាក Pitch Day",
    category: "pitch",
    tagEn: "Stage Pitch",
    tagKh: "ការបង្ហាញលើឆាក",
    date: "2026",
  },
  {
    id: "ep-49",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649644/photo_2026-07-26_21-11-46_inuzmi.jpg",
    titleEn: "Technovation Girls Junior Division Certificate Presentation",
    titleKh: "ពិធីប្រគល់វិញ្ញាបនបត្រ Technovation Junior Division",
    category: "technovation",
    tagEn: "Certificates",
    tagKh: "វិញ្ញាបនបត្រ",
    date: "2026",
  },
  {
    id: "ep-50",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649644/photo_2026-07-26_21-11-42_uujqay.jpg",
    titleEn: "Team #50777 Group Photo on Championship Stage",
    titleKh: "រូបថតក្រុម ៥០៧៧៧ លើឆាកជើងឯក",
    category: "technovation",
    tagEn: "Championship Stage",
    tagKh: "ឆាកជើងឯក",
    date: "2026",
  },
  {
    id: "ep-51",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649633/photo_2026-07-26_12-49-39_dlosb1.jpg",
    titleEn: "Student Digital Safety Workshop & Teamwork",
    titleKh: "សិក្ខាសាលាសុវត្ថិភាពឌីជីថល និងការធ្វើការងារជាក្រុម",
    category: "workshop",
    tagEn: "Digital Safety",
    tagKh: "សុវត្ថិភាពឌីជីថល",
    date: "2026",
  },
  {
    id: "ep-52",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649630/photo_2026-07-25_20-19-58_x4a9yc.jpg",
    titleEn: "Siem Reap Outreach Workshop Group Smile",
    titleKh: "ស្នាមញញឹមរួមគ្នាក្នុងសិក្ខាសាលានៅសៀមរាប",
    category: "outreach",
    tagEn: "Siem Reap Outreach",
    tagKh: "ចុះសៀមរាប",
    date: "2026",
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function EventPhotosSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  // Active Filter Category Tab
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Photos Master List (Shuffleable)
  const [photosList, setPhotosList] = useState<EventPhoto[]>(EVENT_HIGHLIGHT_PHOTOS);

  // Visible Limit
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Shuffle animation indicator
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Filter photos based on category
  const filteredPhotos = useMemo(() => {
    if (activeFilter === "all") return photosList;
    return photosList.filter((p) => p.category === activeFilter);
  }, [activeFilter, photosList]);

  const visiblePhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleCount);
  }, [filteredPhotos, visibleCount]);

  // Handler for Randomizing / Shuffling Photos
  const handleShufflePhotos = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      setPhotosList(shuffleArray(EVENT_HIGHLIGHT_PHOTOS));
      setIsShuffling(false);
    }, 200);
  }, []);

  // Keyboard navigation for Lightbox (Pure state, NO screen hijacking!)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
      } else if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  return (
    <section className="bg-zinc-50 border-b-2 border-black py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <CautionTape variant="line" height={10} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ── SECTION HEADER & CATEGORIES FIRST ── */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-4"
            style={khFont}
          >
            <Camera size={15} className="text-amber-400" />
            <span>{kh ? "រូបភាពសកម្មភាព និងព្រឹត្តិការណ៍" : "EVENT PHOTOS & GALLERY"}</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight"
            style={khFont}
          >
            {kh ? (
              <>
                កម្រងរូបភាព <span className="bg-amber-400 px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">ព្រឹត្តិការណ៍</span> KWD
              </>
            ) : (
              <>
                OUR EVENT <span className="bg-amber-400 px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">HIGHLIGHTS</span>
              </>
            )}
          </h2>

          <p
            className="mt-3 text-base sm:text-lg font-bold text-zinc-700 max-w-3xl text-balance"
            style={khFont}
          >
            {kh
              ? "សកម្មភាពពីការប្រកួត Technovation Girls 2026 ការបង្ហាញ Pitch ថ្នាក់តំបន់ និងការចុះផ្សព្វផ្សាយនៅតាមសាលារៀន"
              : "Moments from Technovation Girls 2026, Regional Pitch competition, school visits, and community workshops."}
          </p>

          {/* ── CATEGORIES FIRST TOOLBAR ── */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
            {[
              { id: "all", labelEn: `All Photos (${photosList.length})`, labelKh: `រូបភាពទាំងអស់ (${photosList.length})` },
              { id: "technovation", labelEn: "Technovation 2026", labelKh: "Technovation ២០២៦" },
              { id: "pitch", labelEn: "Regional Pitch", labelKh: "Pitch ថ្នាក់តំបន់" },
              { id: "outreach", labelEn: "School Outreach", labelKh: "ចុះសាលារៀន" },
              { id: "workshop", labelEn: "Workshops", labelKh: "សិក្ខាសាលា" },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setVisibleCount(12);
                  }}
                  className={`text-xs font-black uppercase px-4 py-2 border-2 border-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-black shadow-[3px_3px_0_#000] -translate-y-0.5"
                      : "bg-white text-zinc-800 hover:bg-amber-100 shadow-[2px_2px_0_#000]"
                  }`}
                  style={khFont}
                >
                  {kh ? tab.labelKh : tab.labelEn}
                </button>
              );
            })}

            <button
              onClick={handleShufflePhotos}
              className={`flex items-center gap-1.5 bg-black text-amber-400 text-xs font-mono font-black uppercase px-3.5 py-2 border-2 border-black shadow-[3px_3px_0_#000] hover:bg-zinc-900 transition-all cursor-pointer active:scale-95 ${
                isShuffling ? "opacity-50" : ""
              }`}
              title="Randomize photo order"
            >
              <Shuffle size={14} className={isShuffling ? "animate-spin" : ""} />
              <span>{kh ? "ចែករំលែក" : "SHUFFLE"}</span>
            </button>
          </div>
        </div>

        {/* ── PHOTO GRID (UNCROPPED, FULL IMAGE DISPLAY) ── */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 transition-opacity duration-300 ${
            isShuffling ? "opacity-30" : "opacity-100"
          }`}
        >
          {visiblePhotos.map((photo, idx) => {
            const tiltAngles = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-0"];
            const tiltClass = tiltAngles[idx % tiltAngles.length];

            return (
              <div
                key={`${photo.id}-${idx}`}
                onClick={() => setLightboxIndex(idx)}
                className={`group bg-white border-2 border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[7px_7px_0_#000] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 cursor-pointer flex flex-col justify-between ${tiltClass}`}
              >
                {/* Full Uncropped Image Container */}
                <div className="relative aspect-[4/3] bg-zinc-950 border-2 border-black flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.titleEn}
                    className="max-h-full max-w-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute top-2 left-2 bg-black text-amber-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black shadow-[2px_2px_0_#000]">
                    {kh ? photo.tagKh : photo.tagEn}
                  </div>

                  <div className="absolute top-2 right-2 bg-amber-400 text-black text-[10px] font-mono font-black px-1.5 py-0.5 border border-black shadow-[2px_2px_0_#000]">
                    #{idx + 1}
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#000] text-black">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 px-0.5">
                  <h4 className="text-xs font-bold text-black line-clamp-2 leading-snug" style={khFont}>
                    {kh ? photo.titleKh : photo.titleEn}
                  </h4>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500">
                    <span>{photo.date}</span>
                    <span className="uppercase text-amber-600">★ KWD PHOTO</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Pagination */}
        {filteredPhotos.length > visibleCount && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredPhotos.length))}
              className="bg-amber-400 text-black hover:bg-amber-300 text-sm font-black uppercase tracking-wider px-8 py-3.5 border-2 border-black shadow-[4px_4px_0_#000] inline-flex items-center gap-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
              style={khFont}
            >
              <Grid size={16} />
              <span>{kh ? `បង្ហាញរូបភាពបន្ថែមទៀត (${filteredPhotos.length - visibleCount} ទៀត)` : `LOAD MORE PHOTOS (${filteredPhotos.length - visibleCount} REMAINING)`}</span>
            </button>
            <div className="text-xs font-mono font-bold text-zinc-600">
              Showing {visibleCount} of {filteredPhotos.length} photos
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative max-w-5xl w-full bg-white border-[3px] border-black shadow-[12px_12px_0_#000] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-black text-white px-4 py-3 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Camera size={16} />
                <span>
                  EVENT PHOTO {lightboxIndex + 1} OF {filteredPhotos.length}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 bg-amber-400 text-black border-2 border-black flex items-center justify-center font-black hover:bg-amber-300 cursor-pointer shadow-[2px_2px_0_#000]"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative bg-zinc-950 flex items-center justify-center p-2 min-h-[350px] sm:min-h-[480px] flex-1 overflow-hidden">
              <img
                key={filteredPhotos[lightboxIndex].id}
                src={filteredPhotos[lightboxIndex].url}
                alt={filteredPhotos[lightboxIndex].titleEn}
                className="max-h-[68vh] w-auto max-w-full object-contain mx-auto border border-zinc-800 animate-fade-in"
              />

              <button
                onClick={() => setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 cursor-pointer transition-all active:scale-95"
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>

              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 cursor-pointer transition-all active:scale-95"
                title="Next photo (Right Arrow)"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="p-4 bg-white border-t-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="inline-block bg-black text-amber-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 mb-1 border border-black">
                  {kh ? filteredPhotos[lightboxIndex].tagKh : filteredPhotos[lightboxIndex].tagEn}
                </span>
                <h3 className="text-sm sm:text-base font-black text-black" style={khFont}>
                  {kh ? filteredPhotos[lightboxIndex].titleKh : filteredPhotos[lightboxIndex].titleEn}
                </h3>
              </div>

              <div className="text-xs font-mono font-bold text-zinc-500">
                Use ← → keys to navigate
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
