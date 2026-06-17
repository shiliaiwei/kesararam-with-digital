import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";

const DB_URL = readEnvValue("DATABASE_URL");
if (!DB_URL) {
  throw new Error("DATABASE_URL not found in .env.local");
}

const sql = neon(DB_URL);
const outJson = "docs/qa-rewrite/categories/cat-01-road-sign.json";
const outMd = "docs/qa-rewrite/categories/cat-01-road-sign.md";

const bannedKm = [
  "ត្រូវ ឬ មិនត្រឹមត្រូវ", "ដ៏", "ជានិច្ច", "សេចក្តីថ្លែងការណ៍មួយណា", "ថ្លែងការណ៍",
  "ប៉ប៉ោរ", "នូវ", "នៃ", "ឡើយ", "ពុំ", "ត្រូវបាន", "ទាំងឡាយ", "នានា", "ជាអាទិ៍",
  "ប្រការ", "អនុលោម", "បទប្បញ្ញត្តិ", "នីតិវិធី", "ប្រតិបត្តិ", "ដ៏សែន", "&", "*", "៖",
];

// ── Per-sub-group STANDARD semantics (the "logical standard list") ────────────
const G = {
  "Warning Signs": { typeKm: "សញ្ញាព្រមាន", typeEn: "Warning sign", actionKm: "បន្ថយល្បឿន និងប្រុងប្រយ័ត្ន", actionEn: "slow down and stay alert", whyKm: "ដើម្បីជៀសវាងគ្រោះថ្នាក់ដែលនៅខាងមុខ", whyEn: "It helps you avoid the danger ahead", penaltyKm: "គ្រោះថ្នាក់ ឬ ការបុកគ្នា", penaltyEn: "an accident or a crash" },
  "Prohibitory Signs": { typeKm: "សញ្ញាហាមឃាត់", typeEn: "Prohibitory sign", actionKm: "មិនធ្វើអ្វីដែលសញ្ញានេះហាម", actionEn: "not do what the sign forbids", whyKm: "ដើម្បីសុវត្ថិភាព និងសណ្ដាប់ធ្នាប់លើផ្លូវ", whyEn: "It keeps the road safe and orderly", penaltyKm: "ការខុសច្បាប់ និងការពិន័យ", penaltyEn: "breaking the law and a fine" },
  "Informative Signs": { typeKm: "សញ្ញាព័ត៌មាន", typeEn: "Informative sign", actionKm: "អានព័ត៌មាន ហើយធ្វើតាម", actionEn: "read the information and follow it", whyKm: "ដើម្បីណែនាំ និងជួយឱ្យធ្វើដំណើរស្រួល", whyEn: "It guides drivers and makes travel easier", penaltyKm: "ការវង្វេងផ្លូវ ឬ ការច្រឡំ", penaltyEn: "getting lost or confused" },
  "Supplementary Signs": { typeKm: "សញ្ញាបន្ថែម", typeEn: "Supplementary sign", actionKm: "អានព័ត៌មានបន្ថែម ហើយធ្វើតាមសញ្ញាសំខាន់", actionEn: "read the extra information and follow the main sign", whyKm: "ដើម្បីបញ្ជាក់ន័យសញ្ញាសំខាន់ឱ្យច្បាស់", whyEn: "It makes the main sign clearer", penaltyKm: "ការយល់ច្រឡំន័យសញ្ញា", penaltyEn: "misunderstanding the sign" },
  "Longitudinal Markings": { typeKm: "បន្ទាត់តាមបណ្ដោយផ្លូវ", typeEn: "Longitudinal marking", actionKm: "បើកក្នុងគន្លងរបស់ខ្លួន", actionEn: "stay in your own lane", whyKm: "ដើម្បីបែងចែកគន្លង និងរក្សាសុវត្ថិភាព", whyEn: "It separates lanes and keeps traffic safe", penaltyKm: "ការបុកនឹងរថយន្តក្នុងគន្លងផ្សេង", penaltyEn: "hitting a vehicle in another lane" },
  "Temporary Signs": { typeKm: "សញ្ញាបណ្ដោះអាសន្ន", typeEn: "Temporary sign", actionKm: "ធ្វើតាមសញ្ញាបណ្ដោះអាសន្ននេះជាមុនសិន", actionEn: "follow this temporary sign first", whyKm: "ព្រោះមានការងារ ឬ ការផ្លាស់ប្ដូរលើផ្លូវ", whyEn: "There are roadworks or changes on the road", penaltyKm: "គ្រោះថ្នាក់ក្នុងតំបន់ការងារ", penaltyEn: "an accident in the work zone" },
  "Traffic Lights": { typeKm: "ភ្លើងសញ្ញាចរាចរ", typeEn: "Traffic light", actionKm: "ធ្វើតាមពណ៌ភ្លើង", actionEn: "obey the light colour", whyKm: "ដើម្បីបញ្ជាការចរាចរនៅផ្លូវប្រសព្វ", whyEn: "It controls traffic at the junction", penaltyKm: "ការខុសច្បាប់ និងការបុកគ្នា", penaltyEn: "breaking the law and a crash" },
  "Priority Signs": { typeKm: "សញ្ញាអាទិភាព", typeEn: "Priority sign", actionKm: "ផ្តល់សិទ្ធិ ឬ ឈប់ឱ្យយានដទៃទៅមុន", actionEn: "give way or stop to let other vehicles go first", whyKm: "ដើម្បីកំណត់អ្នកមានសិទ្ធិទៅមុននៅផ្លូវប្រសព្វ", whyEn: "It decides who goes first at the junction", penaltyKm: "ការបុកគ្នានៅផ្លូវប្រសព្វ និងការពិន័យ", penaltyEn: "a crash at the junction and a fine" },
  "Sign Posts": { typeKm: "បង្គោលសញ្ញា", typeEn: "Sign post", actionKm: "អានព័ត៌មានលើបង្គោល", actionEn: "read the information on the post", whyKm: "ដើម្បីណែនាំទិសដៅ ឬ ចម្ងាយ", whyEn: "It shows direction or distance", penaltyKm: "ការទៅខុសផ្លូវ", penaltyEn: "taking the wrong road" },
  "Other Road Markings": { typeKm: "សញ្ញាសម្គាល់លើផ្លូវ", typeEn: "Road marking", actionKm: "ធ្វើតាមសញ្ញាសម្គាល់លើផ្លូវ", actionEn: "follow the road marking", whyKm: "ដើម្បីណែនាំ និងរៀបចំចរាចរ", whyEn: "It guides and organises traffic", penaltyKm: "ការបង្កគ្រោះថ្នាក់", penaltyEn: "causing an accident" },
  "Arrows Markings": { typeKm: "សញ្ញាព្រួញលើផ្លូវ", typeEn: "Arrow marking", actionKm: "ទៅតាមទិសព្រួញ", actionEn: "go in the direction of the arrow", whyKm: "ដើម្បីបង្ហាញទិសដៅគន្លង", whyEn: "It shows the lane direction", penaltyKm: "ការបើកខុសទិស និងការបុកគ្នា", penaltyEn: "wrong-way driving and a crash" },
  "Street Name Signs": { typeKm: "ស្លាកឈ្មោះផ្លូវ", typeEn: "Street name sign", actionKm: "អានឈ្មោះផ្លូវ", actionEn: "read the street name", whyKm: "ដើម្បីដឹងឈ្មោះផ្លូវ និងទីតាំង", whyEn: "It shows the street name and location", penaltyKm: "ការវង្វេងផ្លូវ", penaltyEn: "getting lost" },
  "Traffic Police Signals": { typeKm: "សញ្ញាដៃប៉ូលិសចរាចរ", typeEn: "Traffic police signal", actionKm: "ធ្វើតាមការបញ្ជារបស់ប៉ូលិសចរាចរ", actionEn: "follow the traffic police's command", whyKm: "ព្រោះប៉ូលិសមានសិទ្ធិលើសសញ្ញា និងភ្លើង", whyEn: "Police override signs and lights", penaltyKm: "ការខុសច្បាប់ និងការពិន័យ", penaltyEn: "breaking the law and a fine" },
  "Buildup Area Boundary Signs": { typeKm: "សញ្ញាព្រំដែនតំបន់ប្រជុំជន", typeEn: "Built-up area boundary sign", actionKm: "បន្ថយល្បឿនពេលចូលតំបន់ប្រជុំជន", actionEn: "slow down when entering a built-up area", whyKm: "ព្រោះមានមនុស្ស និងចរាចរច្រើន", whyEn: "There are many people and vehicles", penaltyKm: "ការបុកមនុស្សថ្មើរជើង", penaltyEn: "hitting pedestrians" },
  "Transverse Markings": { typeKm: "បន្ទាត់ទទឹងផ្លូវ", typeEn: "Transverse marking", actionKm: "ឈប់នៅពីមុខបន្ទាត់", actionEn: "stop before the line", whyKm: "ដើម្បីកំណត់កន្លែងឈប់", whyEn: "It marks where to stop", penaltyKm: "ការបុកអ្នកថ្មើរជើង ឬ យានដទៃ", penaltyEn: "hitting pedestrians or other vehicles" },
};
const DEFAULT_G = { typeKm: "សញ្ញាចរាចរ", typeEn: "Traffic sign", actionKm: "ធ្វើតាមអ្វីដែលសញ្ញានេះប្រាប់", actionEn: "do what the sign says", whyKm: "ដើម្បីសុវត្ថិភាពលើផ្លូវ", whyEn: "It keeps the road safe", penaltyKm: "គ្រោះថ្នាក់ ឬ ការពិន័យ", penaltyEn: "an accident or a fine" };
const groupOf = (sg) => G[(sg || "").trim()] || DEFAULT_G;
const ALL_TYPES = [...Object.values(G), DEFAULT_G].map((g) => ({ km: g.typeKm, en: g.typeEn }));

// Standard wrong-answer pools (deliberately incorrect)
const ACTION_BAD = [{ km: "បន្តបើកលឿនដដែល", en: "Keep driving at the same speed" }, { km: "បង្កើនល្បឿន", en: "Speed up" }, { km: "មិនអើពើនឹងសញ្ញា", en: "Ignore the sign" }, { km: "បត់ត្រឡប់ភ្លាម", en: "Make a U-turn at once" }];
const WHY_BAD = [{ km: "ដើម្បីតុបតែងផ្លូវឱ្យស្អាត", en: "It decorates the road" }, { km: "ដើម្បីបង្ហាញឈ្មោះម្ចាស់ផ្លូវ", en: "It shows the road owner's name" }, { km: "គ្មានន័យពិសេសអ្វីទេ", en: "It has no special meaning" }];
const PENALTY_BAD = [{ km: "ការទទួលរង្វាន់", en: "a reward" }, { km: "គ្មានផលអ្វីទាំងអស់", en: "nothing at all" }, { km: "ការបើកលឿនជាងមុន", en: "driving faster than before" }];
// Psychological subjects are used directly in templates instead of proper names.

function readEnvValue(key) {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(new RegExp(`^${key}=([\\s\\S]*)$`));
    if (!match) continue;
    return match[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

function cleanKm(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/៖/g, "")
    .replace(/ដើម្?បិ|ដម្បិ|ដំណ្បិ|ដំ្បី|ដើម្បីិ|ដំម្បី/g, "ដើម្បី")
    .replace(/អោយ/g, "ឱ្យ")
    .replace(/សិទ្ឋិ/g, "សិទ្ធិ")
    .replace(/សំរាប់/g, "សម្រាប់")
    .replace(/សំគាល់/g, "សម្គាល់")
    .replace(/ត្រូវបាន/g, "")
    .replace(/នូវ/g, "")
    .replace(/នៃ/g, "របស់")
    .replace(/ឡើយ/g, "ទេ")
    .replace(/ពុំ/g, "មិន")
    .replace(/ជានិច្ច/g, "គ្រប់ពេល")
    .replace(/\s+([។៕,])/g, "$1")
    .trim();
}

function cleanEn(value) {
  return String(value || "").replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const inlineEn = (s) => cleanEn(s).replace(/\s*\.\s*$/, "");
function idFor(topic, slot) { return `RS-${topic.id}-${String(slot).padStart(2, "0")}`; }

function answer(answerKm, answerEn, isCorrect, answerType = "multiple_choice", imageUrl = undefined) {
  return { answerKm, answerEn, isCorrect, answerType, ...(imageUrl ? { imageUrl } : {}) };
}

function hash(input) {
  let n = 2166136261;
  for (const ch of input) { n ^= ch.charCodeAt(0); n = Math.imul(n, 16777619); }
  return n >>> 0;
}

// Deterministic order, SAME sub-group first (plausible distractors), then the rest.
function groupDistractors(topics, topic, slot, count) {
  const key = (t) => hash(`${topic.id}:${slot}:${t.id}`);
  const same = topics.filter((t) => t.id !== topic.id && t.subGroup === topic.subGroup).sort((a, b) => key(a) - key(b));
  const other = topics.filter((t) => t.id !== topic.id && t.subGroup !== topic.subGroup).sort((a, b) => key(a) - key(b));
  const picked = [...same, ...other].slice(0, count);
  if (picked.length !== count) throw new Error(`Not enough distractors for ${topic.topicCode}`);
  return picked;
}

// 3 type names other than the topic's own group type.
function typeDistractors(topic, slot, count) {
  const own = groupOf(topic.subGroup).typeKm;
  const pool = ALL_TYPES.filter((t) => t.km !== own).sort((a, b) => hash(`${topic.id}:${slot}:${a.km}`) - hash(`${topic.id}:${slot}:${b.km}`));
  return pool.slice(0, count);
}

// 3 wrong answers from a fixed pool, deterministically ordered, never equal to the correct one.
function badChoices(topic, slot, pool, correctKm, count) {
  return pool.filter((p) => p.km !== correctKm).sort((a, b) => hash(`${topic.id}:${slot}:${a.km}`) - hash(`${topic.id}:${slot}:${b.km}`)).slice(0, count);
}

function item(topic, slot, difficulty, questionType, questionKm, questionEn, answers, explanationKm, explanationEn) {
  const correct = answers.find((a) => a.isCorrect);
  return {
    id: idFor(topic, slot), topicId: topic.id, topicCode: topic.topicCode,
    categoryId: topic.categoryId, categorySlug: topic.categorySlug, subGroup: topic.subGroup,
    difficulty, questionType,
    // Sign Challenge (image_selection) shows NO image above the question; the sign images are the options.
    questionImageUrl: questionType === "image_selection" ? null : topic.imageUrl,
    questionKm, questionEn, answers,
    answerKm: correct?.answerKm ?? "", answerEn: correct?.answerEn ?? "",
    explanationKm, explanationEn,
  };
}

function buildTopicItems(topic, topics, idx) {
  const g = groupOf(topic.subGroup);
  const meaning = answer(topic.nameKm, topic.nameEn, true);
  const meaningDistract = groupDistractors(topics, topic, 1, 3).map((d) => answer(d.nameKm, d.nameEn, false));
  const imgDistract = groupDistractors(topics, topic, 3, 3).map((d) => answer(d.nameKm, d.nameEn, false, "image_selection", d.imageUrl));
  const typeDistract = typeDistractors(topic, 4, 3).map((d) => answer(d.km, d.en, false));
  const actAll = [answer(g.actionKm, cap(g.actionEn), true), ...badChoices(topic, 5, ACTION_BAD, g.actionKm, 3).map((d) => answer(d.km, d.en, false))];
  const actAll6 = [answer(g.actionKm, cap(g.actionEn), true), ...badChoices(topic, 6, ACTION_BAD, g.actionKm, 3).map((d) => answer(d.km, d.en, false))];
  const whyAll = [answer(g.whyKm, g.whyEn, true), ...badChoices(topic, 8, WHY_BAD, g.whyKm, 3).map((d) => answer(d.km, d.en, false))];
  const penAll = [answer(g.penaltyKm, cap(g.penaltyEn), true), ...badChoices(topic, 9, PENALTY_BAD, g.penaltyKm, 3).map((d) => answer(d.km, cap(d.en), false))];

  // 6 medium — scenario apply (psychological, using You as subject only)
  const scenarioIndex = idx % 6;
  let q6Km = "";
  let q6En = "";
  let exp6Km = "";
  let exp6En = "";

  if (scenarioIndex === 0) {
    q6Km = "អ្នកកំពុងបើកបរ ហើយឃើញសញ្ញានេះនៅខាងមុខ តើអ្នកគួរសម្រេចចិត្តបែបណាដើម្បីសុវត្ថិភាព?";
    q6En = "You are driving and see this sign ahead. What decision should you make to stay safe?";
    exp6Km = `អ្នកត្រូវធ្វើតាមសញ្ញាដោយ${g.actionKm} ការពារគ្រោះថ្នាក់។`;
    exp6En = `You must follow the sign by choosing to ${g.actionEn} to prevent crashes.`;
  } else if (scenarioIndex === 1) {
    q6Km = "អ្នកកំពុងបើកបរ ហើយឃើញសញ្ញានេះ តើអ្នកគួរគ្រប់គ្រងអារម្មណ៍ និងល្បឿនយ៉ាងដូចម្ដេច?";
    q6En = "You are driving and see this sign. How should you control your speed and mindset?";
    exp6Km = `អ្នកគួរតែសម្រេចចិត្ត${g.actionKm}ភ្លាមៗ មិនត្រូវមានការធ្វេសប្រហែសទេ។`;
    exp6En = `You should choose to ${g.actionEn} immediately and avoid any carelessness.`;
  } else if (scenarioIndex === 2) {
    q6Km = "អ្នកកំពុងបើកបរ ហើយជួបសញ្ញានេះនៅផ្លូវមិនស៊ាំ តើអ្នកត្រូវផ្ដោតអារម្មណ៍បែបណា?";
    q6En = "You are driving and encounter this sign on an unfamiliar road. How should you focus?";
    exp6Km = `អ្នកត្រូវតែ${g.actionKm} ដើម្បីរក្សាសុវត្ថិភាព និងការគ្រប់គ្រងផ្លូវឱ្យបានល្អ។`;
    exp6En = `You must choose to ${g.actionEn} to maintain safety and road control.`;
  } else if (scenarioIndex === 3) {
    q6Km = "អ្នកកំពុងបើកបរ ហើយឃើញសញ្ញានេះនៅខាងមុខ តើអ្នកគួរមានសកម្មភាពបង្ការបែបណា?";
    q6En = "You are driving and see this sign ahead. What defensive action should you take?";
    exp6Km = `អ្នកគួរ${g.actionKm} ដើម្បីត្រៀមខ្លួនបង្ការរាល់គ្រោះថ្នាក់ជាយថាហេតុ។`;
    exp6En = `You should choose to ${g.actionEn} to prepare for any unexpected hazards.`;
  } else if (scenarioIndex === 4) {
    q6Km = "អ្នកកំពុងប្រញាប់ ហើយជួបសញ្ញានេះ តើអ្នកគួរទប់ទល់នឹងអារម្មណ៍ចង់បើកលឿនដោយរបៀបណា?";
    q6En = "You are in a hurry and encounter this sign. How should you manage your impatience?";
    exp6Km = `ទោះបីជាប្រញាប់ក៏ដោយ អ្នកត្រូវតែ${g.actionKm} ព្រោះសុវត្ថិភាពជីវិតជាចម្បង។`;
    exp6En = `Even when in a hurry, you must ${g.actionEn} because life safety comes first.`;
  } else {
    q6Km = "អ្នកកំពុងបើកបរជាមួយមិត្តភក្តិ ហើយឃើញសញ្ញានេះ តើអ្នកគួរសម្រេចចិត្តបែបណាដើម្បីការពារអ្នករួមដំណើរ?";
    q6En = "You are driving with passengers and see this sign. What decision should you make to protect them?";
    exp6Km = `អ្នកត្រូវតែ${g.actionKm} ដើម្បីការពារអ្នករួមដំណើររបស់អ្នក។`;
    exp6En = `You must choose to ${g.actionEn} to protect your passengers.`;
  }

  // 7 medium — True/False misconception (psychological, using You as subject only)
  const tfIndex = (idx + 1) % 6;
  let q7Km = "";
  let q7En = "";
  let exp7Km = "";
  let exp7En = "";

  if (tfIndex === 0) {
    q7Km = "អ្នកយល់ថា ពេលបើកបរលើផ្លូវដែលធ្លាប់ស្គាល់ច្បាស់ អ្នកមិនបាច់គោរពសញ្ញានេះទេ។";
    q7En = "You feel that when driving on a very familiar road, you do not need to follow this sign.";
    exp7Km = "អ្នកបើកបរត្រូវតែគោរពសញ្ញានេះគ្រប់ពេល មិនថាផ្លូវនោះធ្លាប់ស្គាល់ ឬ មិនធ្លាប់ស្គាល់ទេ។";
    exp7En = "You must obey this sign at all times, regardless of road familiarity.";
  } else if (tfIndex === 1) {
    q7Km = "អ្នកជឿថា អ្នកអាចមិនអើពើនឹងសញ្ញានេះបាន ប្រសិនបើអ្នកគ្រាន់តែក្រឡេកមើលទូរសព្ទមួយភ្លែត។";
    q7En = "You believe you can ignore this sign if you are only glancing at your phone for a second.";
    exp7Km = "ការធ្វេសប្រហែសទោះបីតែមួយវិនាទីក៏អាចបង្កគ្រោះថ្នាក់បានដែរ ដូច្នេះត្រូវគោរពសញ្ញានេះគ្រប់ពេល។";
    exp7En = "Any distraction, even for a second, can cause a crash, so you must obey this sign.";
  } else if (tfIndex === 2) {
    q7Km = "អ្នកគិតថា អ្នកត្រូវគោរពសញ្ញានេះតែពេលមានប៉ូលិសចរាចរណ៍ ឬ គេមើលមកប៉ុណ្ណោះ។";
    q7En = "You think that you only need to obey this sign when traffic police or others are watching.";
    exp7Km = "ច្បាប់ចរាចរណ៍ត្រូវតែគោរពគ្រប់ពេលដើម្បីសុវត្ថិភាព មិនមែនគោរពតែពេលមានគេមើលនោះទេ។";
    exp7En = "Traffic laws must be obeyed at all times for safety, not just when being observed.";
  } else if (tfIndex === 3) {
    q7Km = "អ្នកយល់ថា ប្រសិនបើអ្នកបើកបរផ្សេងទៀតមិនគោរពសញ្ញានេះទេ អ្នកក៏មិនបាច់គោរពដែរ។";
    q7En = "You assume that if other drivers are ignoring this sign, you can also ignore it.";
    exp7Km = "សុវត្ថិភាពចរាចរណ៍ចាប់ផ្ដើមពីខ្លួនយើងម្នាក់ៗ មិនត្រូវធ្វើតាមការល្មើសច្បាប់របស់អ្នកដទៃទេ។";
    exp7En = "Road safety starts with each of us; you must not copy the illegal actions of others.";
  } else if (tfIndex === 4) {
    q7Km = "អ្នកគិតថា អ្នកអាចមិនអើពើនឹងសញ្ញានេះបាន ប្រសិនបើអ្នកមើលឃើញផ្លូវស្ងាត់ និងគ្មានគ្រោះថ្នាក់។";
    q7En = "You assume that you can ignore this sign if you see the road is empty and feels there is no danger.";
    exp7Km = "គ្រោះថ្នាក់អាចកើតឡើងដោយស្មានមិនត្រូវ ដូច្នេះត្រូវតែគោរពសញ្ញានេះគ្រប់ពេល។";
    exp7En = "Hazards can appear unexpectedly, so you must obey this sign at all times.";
  } else {
    q7Km = "អ្នកយល់ថា ពេលប្រញាប់ទៅកន្លែងធ្វើការ អ្នកអាចបើកហួសសញ្ញានេះដោយមិនបាច់បន្ថយល្បឿនទេ។";
    q7En = "You believe that when in a rush to work, you can drive past this sign without slowing down.";
    exp7Km = "ការប្រញាប់មិនមែនជាលេសក្នុងការល្មើសច្បាប់ចរាចរណ៍ ឬ បង្កគ្រោះថ្នាក់ដល់អ្នកដទៃទេ។";
    exp7En = "Being in a hurry is not an excuse to break traffic laws or endanger others.";
  }

  return [
    // 1 easy — meaning (sign shown)
    item(topic, 1, "easy", "multiple_choice",
      "ឃើញសញ្ញានេះនៅតាមផ្លូវ តើវាប្រាប់អ្នកបើកបរយ៉ាងណា?",
      "You see this sign on the road. What does it tell the driver?",
      [meaning, ...meaningDistract],
      "មើលរូបសញ្ញា ហើយចាំអត្ថន័យឱ្យច្បាស់ មុនធ្វើដំណើរបន្ត។",
      "Look at the sign and know its meaning before you continue."),
    // 2 easy — True/False scenario (true), sign shown
    item(topic, 2, "easy", "true_false",
      `ពេលឃើញសញ្ញានេះ អ្នកបើកបរគួរ${g.actionKm}។`,
      `When a driver sees this sign, they should ${g.actionEn}.`,
      [answer("ត្រូវ", "True", true), answer("ខុស", "False", false)],
      `សញ្ញានេះប្រាប់ឱ្យអ្នកបើកបរ${g.actionKm}។`,
      `This sign tells the driver to ${g.actionEn}.`),
    // 3 easy — Sign Challenge: text stem, image options, NO stem image
    item(topic, 3, "easy", "image_selection",
      `តើសញ្ញាមួយណាមានន័យថា "${topic.nameKm}"?`,
      `Which sign means "${inlineEn(topic.nameEn)}"?`,
      [answer(topic.nameKm, topic.nameEn, true, "image_selection", topic.imageUrl), ...imgDistract],
      "ជ្រើសរើសរូបសញ្ញាដែលត្រូវនឹងអត្ថន័យក្នុងសំណួរ។",
      "Pick the sign image that matches the meaning in the question."),
    // 4 easy — fact: sign type (sign shown)
    item(topic, 4, "easy", "multiple_choice",
      "សញ្ញានេះជាសញ្ញាប្រភេទណា?", "What type of sign is this?",
      [answer(g.typeKm, g.typeEn, true), ...typeDistract],
      `សញ្ញានេះជា${g.typeKm}។`, `This is a ${g.typeEn.toLowerCase()}.`),
    // 5 medium — correct action (sign shown)
    item(topic, 5, "medium", "multiple_choice",
      "ឃើញសញ្ញានេះ តើអ្នកបើកបរគួរធ្វើអ្វី?", "Seeing this sign, what should the driver do?",
      actAll, `ពេលឃើញសញ្ញានេះ គួរ${g.actionKm}។`, `When you see this sign, you should ${g.actionEn}.`),
    // 6 medium — scenario apply
    item(topic, 6, "medium", "scenario",
      q6Km, q6En, actAll6, exp6Km, exp6En),
    // 7 medium — True/False misconception (false), sign shown
    item(topic, 7, "medium", "true_false",
      q7Km, q7En,
      [answer("ត្រូវ", "True", false), answer("ខុស", "False", true)],
      exp7Km, exp7En),
    // 8 hard — why / safety (sign shown)
    item(topic, 8, "hard", "multiple_choice",
      "ហេតុអ្វីសញ្ញានេះមានសារៈសំខាន់សម្រាប់សុវត្ថិភាព?", "Why is this sign important for safety?",
      whyAll, g.whyKm + "។", g.whyEn + "."),
    // 9 hard — penalty (fill-in-the-blank, no ៖), sign shown
    item(topic, 9, "hard", "multiple_choice",
      "មិនធ្វើតាមសញ្ញានេះ អាចនាំឱ្យកើតមាន ___ ។", "Not following this sign can lead to ___.",
      penAll, `មិនធ្វើតាមសញ្ញានេះ អាចនាំឱ្យកើត${g.penaltyKm}។`, `Not following this sign can lead to ${g.penaltyEn}.`),
  ];
}

function validate(data) {
  const items = data.items;
  const byTopic = new Map();
  const problems = [];

  for (const q of items) {
    if (q.questionType === "image_selection") {
      if (q.questionImageUrl) problems.push(`${q.id}: image_selection must NOT show a stem image`);
    } else if (!q.questionImageUrl) {
      problems.push(`${q.id}: missing question image`);
    }
    if ((q.answers || []).length > 4) problems.push(`${q.id}: more than 4 answers`);
    if (q.questionType === "true_false" && q.answers.length !== 2) problems.push(`${q.id}: true_false must have 2 answers`);
    if (q.questionType !== "true_false" && q.answers.length !== 4) problems.push(`${q.id}: non true_false must have 4 answers`);
    if ((q.answers || []).filter((a) => a.isCorrect).length !== 1) problems.push(`${q.id}: must have exactly one correct answer`);
    if (q.questionType === "image_selection" && q.answers.some((a) => !a.imageUrl)) problems.push(`${q.id}: image answer missing image`);
    if (/\bthe\s+the\b/i.test(JSON.stringify(q))) problems.push(`${q.id}: repeated English article`);

    const kmText = [q.questionKm, q.answerKm, q.explanationKm, ...(q.answers || []).map((a) => a.answerKm)].join(" ");
    for (const banned of bannedKm) {
      if (kmText.includes(banned)) problems.push(`${q.id}: banned Khmer text "${banned}"`);
    }

    if (!byTopic.has(q.topicId)) byTopic.set(q.topicId, []);
    byTopic.get(q.topicId).push(q);
  }

  for (const [topicId, topicItems] of byTopic.entries()) {
    const counts = topicItems.reduce((acc, q) => { acc[q.difficulty] = (acc[q.difficulty] || 0) + 1; return acc; }, {});
    if (topicItems.length !== 9) problems.push(`topic ${topicId}: expected 9 questions`);
    if (counts.easy !== 4 || counts.medium !== 3 || counts.hard !== 2) {
      problems.push(`topic ${topicId}: bad difficulty mix ${JSON.stringify(counts)}`);
    }
  }

  if (byTopic.size !== 247) problems.push(`expected 247 topics, got ${byTopic.size}`);
  if (items.length !== 2223) problems.push(`expected 2223 questions, got ${items.length}`);
  if (problems.length) throw new Error(`Validation failed:\n${problems.slice(0, 80).join("\n")}`);
}

function toMarkdown(data) {
  const lines = [];
  lines.push("# KWD Question and Answer Rewrite - Road Sign Category");
  lines.push("");
  lines.push(`Generated from live DB road-sign topics. ${data.items.length} questions.`);
  lines.push("");
  lines.push(`Status: ${data.meta.status}`);
  lines.push("");

  let lastTopic = "";
  for (const q of data.items) {
    if (q.topicCode !== lastTopic) {
      lastTopic = q.topicCode;
      lines.push("");
      lines.push(`## ${q.topicCode} - topic_id ${q.topicId}${q.subGroup ? ` - ${q.subGroup}` : ""}`);
      lines.push("");
    }
    lines.push(`### ${q.id} - ${q.difficulty} - ${q.questionType}${q.questionImageUrl ? " (sign shown)" : ""}`);
    lines.push(`KM: ${q.questionKm}`);
    lines.push(`EN: ${q.questionEn}`);
    q.answers.forEach((a, index) => {
      const mark = a.isCorrect ? "[correct]" : "[ ]";
      const img = a.imageUrl ? ` - img` : "";
      lines.push(`${index + 1}. ${mark} ${a.answerKm} / ${a.answerEn}${img}`);
    });
    lines.push(`Explain KM: ${q.explanationKm}`);
    lines.push(`Explain EN: ${q.explanationEn}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

const rows = await sql.query(`
  SELECT t.id, t.topic_code, t.name_en, t.name_km, t.sub_group, t.primary_image_url,
         c.id AS category_id, c.slug AS category_slug
  FROM topics t JOIN categories c ON c.id = t.category_id
  WHERE c.slug = 'road-sign'
  ORDER BY t.id
`);

const topics = rows.map((row) => ({
  id: row.id,
  topicCode: row.topic_code,
  nameEn: cleanEn(row.name_en),
  nameKm: cleanKm(row.name_km || row.name_en),
  subGroup: cleanEn(row.sub_group || ""),
  imageUrl: row.primary_image_url,
  categoryId: row.category_id,
  categorySlug: row.category_slug,
}));

const data = {
  meta: {
    category: "road-sign", categoryId: 1, version: "full-v2-standard",
    status: "for-review - not inserted",
    topicsTotal: topics.length, topicsAuthored: topics.length,
    questionsPerTopic: 9, difficultyMix: { easy: 4, medium: 3, hard: 2 }, images: true,
    answerLimit: "maximum 4 answers per question; true_false uses 2",
    source: "live DB topics ordered by topic id",
    note: "Approved styles: scenario True/False (no prefix, no ៖), driver's-eye meaning, Sign Challenge = text stem + image options (no stem image). Slots 4/5/6/8/9 use per-sub-group standard answers. No gameplay-calculation values embedded.",
  },
  items: topics.flatMap((topic, idx) => buildTopicItems(topic, topics, idx)),
};

validate(data);

mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, `${JSON.stringify(data, null, 2)}\n`);
writeFileSync(outMd, `${toMarkdown(data)}\n`);

console.log(`Wrote ${outJson}`);
console.log(`Wrote ${outMd}`);
console.log(`Topics: ${topics.length}`);
console.log(`Questions: ${data.items.length}`);
