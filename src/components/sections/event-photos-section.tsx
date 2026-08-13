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
  {
    "id": "ev-01",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649751/photo_2026-07-26_11-17-40_2_lwimxo.jpg",
    "titleEn": "Technovation Event Moment #1",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #1",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-02",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649741/photo_2026-07-26_21-11-24_3_w79xtk.jpg",
    "titleEn": "Technovation Event Moment #2",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #2",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-03",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649739/photo_2026-07-26_21-11-12_y3vs5q.jpg",
    "titleEn": "Technovation Event Moment #3",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #3",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-04",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649739/photo_2026-07-26_21-11-13_zce6iy.jpg",
    "titleEn": "Technovation Event Moment #4",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #4",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-05",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_11-17-40_hvdith.jpg",
    "titleEn": "Technovation Event Moment #5",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #5",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-06",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_19-47-43_ifpdxo.jpg",
    "titleEn": "Technovation Event Moment #6",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #6",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-07",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_21-11-39_hol6po.jpg",
    "titleEn": "Technovation Event Moment #7",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #7",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-08",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649738/photo_2026-07-26_21-12-40_azxz7p.jpg",
    "titleEn": "Technovation Event Moment #8",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #8",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-09",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649726/photo_2026-07-26_21-11-38_siqvii.jpg",
    "titleEn": "Technovation Event Moment #9",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #9",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-10",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649726/photo_2026-07-26_21-11-15_hgsy5q.jpg",
    "titleEn": "Technovation Event Moment #10",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #10",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-11",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-08-14_02-17-16_np6yql.jpg",
    "titleEn": "Technovation Event Moment #11",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #11",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-12",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-08-14_02-17-02_kcmabl.jpg",
    "titleEn": "Technovation Event Moment #12",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #12",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-13",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-07-26_19-46-39_lglsp7.jpg",
    "titleEn": "Technovation Event Moment #13",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #13",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-14",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649725/photo_2026-07-26_21-11-24_2_qlxdia.jpg",
    "titleEn": "Technovation Event Moment #14",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #14",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-15",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649724/photo_2026-07-26_21-12-08_pbxhcb.jpg",
    "titleEn": "Technovation Event Moment #15",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #15",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-16",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649711/photo_2026-07-26_11-17-37_uwif2j.jpg",
    "titleEn": "Technovation Event Moment #16",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #16",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-17",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649711/photo_2026-08-14_02-18-21_mdbhen.jpg",
    "titleEn": "Technovation Event Moment #17",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #17",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-18",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-26_21-11-18_2_riviqs.jpg",
    "titleEn": "Technovation Event Moment #18",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #18",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-19",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-26_21-11-08_2_hkhduq.jpg",
    "titleEn": "Technovation Event Moment #19",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #19",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-20",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-25_20-20-00_swj1du.jpg",
    "titleEn": "Technovation Event Moment #20",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #20",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-21",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649710/photo_2026-07-26_21-04-42_aiib4a.jpg",
    "titleEn": "Technovation Event Moment #21",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #21",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-22",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649709/photo_2026-07-25_20-19-51_b3corf.jpg",
    "titleEn": "Technovation Event Moment #22",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #22",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-23",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649709/photo_2026-07-26_19-46-59_ggcdyc.jpg",
    "titleEn": "Technovation Event Moment #23",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #23",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-24",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649698/photo_2026-07-26_21-11-27_2_mufaix.jpg",
    "titleEn": "Technovation Event Moment #24",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #24",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-25",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-07-25_20-20-01_jnru1f.jpg",
    "titleEn": "Technovation Event Moment #25",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #25",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-26",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-08-14_02-18-24_izgggq.jpg",
    "titleEn": "Technovation Event Moment #26",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #26",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-27",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-07-26_21-11-48_ic2wkn.jpg",
    "titleEn": "Technovation Event Moment #27",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #27",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-28",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649697/photo_2026-07-25_20-19-47_sxofaf.jpg",
    "titleEn": "Technovation Event Moment #28",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #28",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-29",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649696/photo_2026-07-25_20-19-46_snjunb.jpg",
    "titleEn": "Technovation Event Moment #29",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #29",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-30",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649696/photo_2026-07-25_20-19-52_zq0pcw.jpg",
    "titleEn": "Technovation Event Moment #30",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #30",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-31",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649686/photo_2026-07-26_21-11-49_trj1ff.jpg",
    "titleEn": "Technovation Event Moment #31",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #31",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-32",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/Firefly_azmkqr.jpg",
    "titleEn": "Technovation Event Moment #32",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #32",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-33",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/photo_2026-08-14_02-18-33_kd26em.jpg",
    "titleEn": "Technovation Event Moment #33",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #33",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-34",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/photo_2026-08-14_02-18-16_wuq1en.jpg",
    "titleEn": "Technovation Event Moment #34",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #34",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-35",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649685/photo_2026-07-26_12-49-39_2_h67uzo.jpg",
    "titleEn": "Technovation Event Moment #35",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #35",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-36",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649684/photo_2026-07-26_21-12-28_cu2wdl.jpg",
    "titleEn": "Technovation Event Moment #36",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #36",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-37",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649645/photo_2026-07-26_19-46-43_yhtldh.jpg",
    "titleEn": "Technovation Event Moment #37",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #37",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-38",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649645/photo_2026-07-25_20-20-01_2_fpupkn.jpg",
    "titleEn": "Technovation Event Moment #38",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #38",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-39",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649645/photo_2026-07-26_21-12-17_mdehud.jpg",
    "titleEn": "Technovation Event Moment #39",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #39",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-40",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649644/photo_2026-07-26_21-11-33_2_mswhwg.jpg",
    "titleEn": "Technovation Event Moment #40",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #40",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-41",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649644/photo_2026-07-26_21-11-46_inuzmi.jpg",
    "titleEn": "Technovation Event Moment #41",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #41",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-42",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649644/photo_2026-07-26_21-11-42_uujqay.jpg",
    "titleEn": "Technovation Event Moment #42",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #42",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-43",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649633/photo_2026-07-26_12-49-39_dlosb1.jpg",
    "titleEn": "Technovation Event Moment #43",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #43",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-44",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649630/photo_2026-07-25_20-19-58_x4a9yc.jpg",
    "titleEn": "Technovation Event Moment #44",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #44",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-45",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649630/photo_2026-07-25_20-19-59_kb46lq.jpg",
    "titleEn": "Technovation Event Moment #45",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #45",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-46",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649628/photo_2026-08-14_02-18-39_lffk4h.jpg",
    "titleEn": "Technovation Event Moment #46",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #46",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-47",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649627/photo_2026-07-26_21-11-48_2_skbdbm.jpg",
    "titleEn": "Technovation Event Moment #47",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #47",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-48",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649622/photo_2026-07-26_21-11-41_ppzjph.jpg",
    "titleEn": "Technovation Event Moment #48",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #48",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-49",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649622/photo_2026-07-26_21-12-10_lvflbk.jpg",
    "titleEn": "Technovation Event Moment #49",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #49",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-50",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649622/photo_2026-07-26_21-12-38_fenbj8.jpg",
    "titleEn": "Technovation Event Moment #50",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #50",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-51",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649621/photo_2026-08-14_02-17-30_brql22.jpg",
    "titleEn": "Technovation Event Moment #51",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #51",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-52",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649621/photo_2026-07-26_21-11-27_hw1tl8.jpg",
    "titleEn": "Technovation Event Moment #52",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #52",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-53",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649621/photo_2026-07-26_21-11-33_wsgnh6.jpg",
    "titleEn": "Technovation Event Moment #53",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #53",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-54",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649620/photo_2026-07-26_21-11-30_re1guv.jpg",
    "titleEn": "Technovation Event Moment #54",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #54",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-55",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649560/photo_2026-07-26_21-11-18_bim7f1.jpg",
    "titleEn": "Technovation Event Moment #55",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #55",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-56",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649560/photo_2026-07-26_21-11-24_erwmdu.jpg",
    "titleEn": "Technovation Event Moment #56",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #56",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-57",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649560/photo_2026-07-26_19-46-36_lzz6h0.jpg",
    "titleEn": "Technovation Event Moment #57",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #57",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-58",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649559/photo_2026-07-26_21-11-31_iscttr.jpg",
    "titleEn": "Technovation Event Moment #58",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #58",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-59",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649559/photo_2026-07-26_21-11-39_2_aj9h5e.jpg",
    "titleEn": "Technovation Event Moment #59",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #59",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-60",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649559/photo_2026-07-26_21-11-09_bss1bi.jpg",
    "titleEn": "Technovation Event Moment #60",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #60",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-61",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649558/photo_2026-07-26_19-46-26_l7nybs.jpg",
    "titleEn": "Technovation Event Moment #61",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #61",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-62",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649504/photo_2026-07-26_19-46-32_isjwlr.jpg",
    "titleEn": "Technovation Event Moment #62",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #62",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-63",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649504/photo_2026-07-26_21-11-34_j4rcb3.jpg",
    "titleEn": "Technovation Event Moment #63",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #63",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-64",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649504/photo_2026-07-26_21-11-08_jub1me.jpg",
    "titleEn": "Technovation Event Moment #64",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #64",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  },
  {
    "id": "ev-65",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649503/photo_2026-07-26_21-11-36_e6umuw.jpg",
    "titleEn": "Technovation Event Moment #65",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #65",
    "category": "technovation",
    "tagEn": "Technovation",
    "tagKh": "ថ្នាក់ជាតិ",
    "date": "2026"
  },
  {
    "id": "ev-66",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649503/photo_2026-07-26_21-11-30_2_idhnvg.jpg",
    "titleEn": "Technovation Event Moment #66",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #66",
    "category": "pitch",
    "tagEn": "Pitch Day",
    "tagKh": "Pitch",
    "date": "2026"
  },
  {
    "id": "ev-67",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649503/photo_2026-07-26_21-11-37_ihdulr.jpg",
    "titleEn": "Technovation Event Moment #67",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #67",
    "category": "outreach",
    "tagEn": "Outreach",
    "tagKh": "ចុះសាលារៀន",
    "date": "2026"
  },
  {
    "id": "ev-68",
    "url": "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649503/photo_2026-07-26_21-11-23_snmija.jpg",
    "titleEn": "Technovation Event Moment #68",
    "titleKh": "រូបភាពព្រឹត្តិការណ៍ Technovation ២០២៦ #68",
    "category": "workshop",
    "tagEn": "Workshop",
    "tagKh": "សិក្ខាសាលា",
    "date": "2026"
  }
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
                <div className="relative aspect-[4/3] bg-zinc-100 border-2 border-black flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.titleEn}
                    onError={(e) => {
                      // Hide card if image fails to load from Cloudinary
                      const card = (e.target as HTMLElement).closest('.group');
                      if (card) {
                        (card as HTMLElement).style.display = 'none';
                      }
                    }}
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

            <div className="relative bg-zinc-900 flex items-center justify-center p-2 min-h-[350px] sm:min-h-[480px] flex-1 overflow-hidden">
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
