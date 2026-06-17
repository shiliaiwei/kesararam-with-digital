import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";

const DB_URL = readEnvValue("DATABASE_URL");
if (!DB_URL) {
  throw new Error("DATABASE_URL not found in .env.local");
}

const sql = neon(DB_URL);
const outJson = "docs/qa-rewrite/categories/cat-03-priority.json";
const outMd = "docs/qa-rewrite/categories/cat-03-priority.md";

const bannedKm = [
  "ត្រូវ ឬ មិនត្រឹមត្រូវ", "ដ៏", "ជានិច្ច", "សេចក្តីថ្លែងការណ៍មួយណា", "ថ្លែងការណ៍",
  "ប៉ប៉ោរ", "នូវ", "នៃ", "ឡើយ", "ពុំ", "ត្រូវបាន", "ទាំងឡាយ", "នានា", "ជាអាទិ៍",
  "ប្រការ", "អនុលោម", "បទប្បញ្ញត្តិ", "នីតិវិធី", "ប្រតិបត្តិ", "ដ៏សែន", "&", "*", "៖",
];

const NAMES = ["ប៊ុន", "សុខ", "ដារ៉ា", "សុភា", "រតនា", "វិសាល", "កុសល", "លីដា", "ធីតា", "ណារី"];

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
    .replace(/ចម្លើយគឺ/g, "")
    .replace(/សញ្ញានេះ/g, "ច្បាប់អាទិភាពនេះ") // context swap for priority
    .replace(/សញ្ញា/g, "ច្បាប់អាទិភាព")
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
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/this sign/gi, "this priority rule")
    .trim();
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
function idFor(topic, slot) { return `PR-${topic.id}-${String(slot).padStart(2, "0")}`; }

function answer(answerKm, answerEn, isCorrect, answerType = "multiple_choice", imageUrl = undefined) {
  return { answerKm, answerEn, isCorrect, answerType, ...(imageUrl ? { imageUrl } : {}) };
}

function hash(input) {
  let n = 2166136261;
  for (const ch of input) { n ^= ch.charCodeAt(0); n = Math.imul(n, 16777619); }
  return n >>> 0;
}

// Deterministic order, SAME sub-group first, then the rest.
function groupDistractors(topics, topic, slot, count) {
  const key = (t) => hash(`${topic.id}:${slot}:${t.id}`);
  const same = topics.filter((t) => t.id !== topic.id && t.subGroup === topic.subGroup).sort((a, b) => key(a) - key(b));
  const other = topics.filter((t) => t.id !== topic.id && t.subGroup !== topic.subGroup).sort((a, b) => key(a) - key(b));
  const picked = [...same, ...other].slice(0, count);
  if (picked.length !== count) throw new Error(`Not enough distractors for ${topic.topicCode}`);
  return picked;
}

function parseFirstVehicle(descEn, descKm) {
  const enClean = descEn.replace(/\s+/g, " ").trim().toLowerCase();
  const kmClean = descKm.replace(/\s+/g, " ").trim();

  let firstEn = "";
  let firstKm = "";

  const toEnDigit = (ch) => {
    const map = { "០": "0", "១": "1", "២": "2", "៣": "3", "៤": "4", "៥": "5", "៦": "6", "៧": "7", "៨": "8", "៩": "9" };
    return map[ch] || ch;
  };
  const toKhDigit = (numStr) => {
    const map = { "0": "០", "1": "១", "2": "២", "3": "៣", "4": "៤", "5": "៥", "6": "៦", "7": "៧", "8": "៨", "9": "៩" };
    return String(numStr).split("").map(c => map[c] || c).join("");
  };

  // 1. Dual matches in EN
  const dualEn1 = enClean.match(/^(?:the\s+answer\s+is:?\s+)?(?:first\s+)?(?:vehicles?|motorcycles?|numbers?|number)?\s*(\d)\s*(?:and|&)\s*(?:vehicles?|motorcycles?|numbers?|number)?\s*(\d)/i);
  if (dualEn1) {
    firstEn = `Vehicle ${dualEn1[1]} and Vehicle ${dualEn1[2]}`;
  } else {
    // Look for single
    const singleEnMatch = enClean.match(/(?:first|number|vehicle|motorcycle|departs|goes)\s*(\d+)/i);
    const singleEnMatch2 = enClean.match(/(\d+)\s*(?:departs|goes|leaves|first)/i);
    if (singleEnMatch) {
      firstEn = `Vehicle ${singleEnMatch[1]}`;
    } else if (singleEnMatch2) {
      firstEn = `Vehicle ${singleEnMatch2[1]}`;
    } else {
      firstEn = `Vehicle 1`;
    }
  }

  // 2. Dual matches in KM
  const dualKmMatch = kmClean.match(/^(?:ចម្លើយគឺ\s+)?(?:លេខ)?\s*([១-៩\d])\s*និង\s*(?:លេខ)?\s*([១-៩\d])/);
  if (dualKmMatch) {
    const d1 = toEnDigit(dualKmMatch[1]);
    const d2 = toEnDigit(dualKmMatch[2]);
    firstKm = `លេខ ${toKhDigit(d1)} និង លេខ ${toKhDigit(d2)}`;
  } else {
    const singleKmMatch = kmClean.match(/លេខ\s*([១-៩\d]+)/);
    if (singleKmMatch) {
      const d = toEnDigit(singleKmMatch[1]);
      firstKm = `លេខ ${toKhDigit(d)}`;
    } else {
      firstKm = `លេខ ១`;
    }
  }

  return { firstEn, firstKm };
}

function item(topic, slot, difficulty, questionType, questionKm, questionEn, answers, explanationKm, explanationEn) {
  const correct = answers.find((a) => a.isCorrect);
  return {
    id: idFor(topic, slot), topicId: topic.id, topicCode: topic.topicCode,
    categoryId: topic.categoryId, categorySlug: topic.categorySlug, subGroup: topic.subGroup,
    difficulty, questionType,
    // Image Selection shows NO image above the question stem; the options carry the images.
    questionImageUrl: questionType === "image_selection" ? null : topic.imageUrl,
    questionKm, questionEn, answers,
    answerKm: correct?.answerKm ?? "", answerEn: correct?.answerEn ?? "",
    explanationKm, explanationEn,
  };
}

function buildTopicItems(topic, topics, idx) {
  const nm = NAMES[idx % NAMES.length];
  const nm2 = NAMES[(idx + 2) % NAMES.length];

  const parsed = parseFirstVehicle(topic.descriptionEn, topic.descriptionKm);
  const firstKm = parsed.firstKm;
  const firstEn = parsed.firstEn;

  // Clean raw passing orders to be the exact correct answers for order questions
  const cleanOrderKm = cleanKm(topic.descriptionKm);
  const cleanOrderEn = cleanEn(topic.descriptionEn).replace(/^The answer is:?\s*/i, "");

  // Build Distractors for MCQ order questions
  // We can vary the vehicle numbers randomly
  const parseNumList = (str) => {
    const matches = str.match(/\d/g) || [];
    return matches.map(Number);
  };
  const nums = parseNumList(cleanOrderEn);
  const getScrambledOrder = (nums, seedOffset) => {
    const reversed = [...nums].reverse();
    const shifted = [...nums].slice(1).concat(nums[0]);
    const choices = [
      reversed,
      shifted,
      [...nums].sort((a, b) => hash(`${topic.id}:${seedOffset}:${a}`) - hash(`${topic.id}:${seedOffset}:${b}`))
    ];
    const picked = choices[seedOffset % choices.length];
    
    // format back
    const formatEn = picked.map((n, i) => i === 0 ? `Vehicle ${n} first` : `then ${n}`).join(", ");
    const formatKm = picked.map((n, i) => i === 0 ? `លេខ ${toKhDigit(n)} ទៅមុន` : `បន្ទាប់មក លេខ ${toKhDigit(n)}`).join(" ");
    return { km: formatKm, en: formatEn };
  };

  const toKhDigit = (num) => {
    const map = { 1: "១", 2: "២", 3: "៣", 4: "៤" };
    return map[num] || String(num);
  };

  // MCQ Distractor list for order
  const orderDist1 = getScrambledOrder(nums, 1);
  const orderDist2 = getScrambledOrder(nums, 2);
  const orderDist3 = getScrambledOrder(nums, 3);

  const orderAnswers = [
    answer(cleanOrderKm, cleanOrderEn, true),
    answer(orderDist1.km, orderDist1.en, false),
    answer(orderDist2.km, orderDist2.en, false),
    answer(orderDist3.km, orderDist3.en, false)
  ];

  // Distractors for Slot 1: "Which vehicle goes first?"
  const firstKmClean = firstKm.replace("លេខ", "").trim();
  const firstEnClean = firstEn.replace("Vehicle", "").trim();
  
  const getFirstDistractors = (firstKm, firstEn) => {
    // Basic vehicle numbers
    const list = [
      { km: "លេខ ១", en: "Vehicle 1" },
      { km: "លេខ ២", en: "Vehicle 2" },
      { km: "លេខ ៣", en: "Vehicle 3" },
      { km: "លេខ ៤", en: "Vehicle 4" },
      { km: "លេខ ១ និង លេខ ២", en: "Vehicle 1 and Vehicle 2" },
      { km: "លេខ ២ និង លេខ ៤", en: "Vehicle 2 and Vehicle 4" },
      { km: "លេខ ១ និង លេខ ៣", en: "Vehicle 1 and Vehicle 3" },
      { km: "លេខ ៣ និង លេខ ១", en: "Vehicle 3 and Vehicle 1" }
    ];
    return list
      .filter((item) => item.km !== firstKm && item.en !== firstEn)
      .sort((a, b) => hash(`${topic.id}:firstdist:${a.en}`) - hash(`${topic.id}:firstdist:${b.en}`))
      .slice(0, 3);
  };
  const firstDist = getFirstDistractors(firstKm, firstEn);
  const firstAnswers = [
    answer(firstKm, firstEn, true),
    ...firstDist.map(d => answer(d.km, d.en, false))
  ];

  // Image Selection Distractors (Slot 3)
  const imgDistract = groupDistractors(topics, topic, 3, 3).map((d) => 
    answer(`រូបភាពច្បាប់អាទិភាព ${d.topicCode}`, `Priority scenario ${d.topicCode}`, false, "image_selection", d.imageUrl)
  );

  // Intersection subgroup naming mapping
  const getSubgroupMapping = (sub) => {
    if (sub.includes("Left Turn")) {
      return {
        km: "ផ្លូវប្រសព្វមានការបត់ឆ្វេង",
        en: "Intersection with a left turn",
        descKm: "ផ្លូវប្រសព្វដែលតម្រូវឱ្យយានយន្តបត់ឆ្វេងប្រុងប្រយ័ត្នសិទ្ធិដំណើរ",
        descEn: "Intersection that requires left-turning vehicles to yield priority"
      };
    }
    if (sub.includes("Sequential")) {
      return {
        km: "ផ្លូវប្រសព្វឆ្លងកាត់ម្តងមួយៗ",
        en: "Sequential crossing intersection",
        descKm: "ផ្លូវប្រសព្វដែលយានយន្តត្រូវឆ្លងកាត់តាមលំដាប់លំដោយម្តងមួយៗ",
        descEn: "Intersection where vehicles must cross in order one by one"
      };
    }
    return {
      km: "ផ្លូវប្រសព្វឆ្លងកាត់ព្រមគ្នា",
      en: "Simultaneous crossing intersection",
      descKm: "ផ្លូវប្រសព្វដែលយានយន្តមិនទាស់ទិសគ្នាអាចឆ្លងកាត់ព្រមគ្នាបាន",
      descEn: "Intersection where non-conflicting vehicles can cross together"
    };
  };
  const subInfo = getSubgroupMapping(topic.subGroup);
  
  const typeDistract = [
    { km: "ផ្លូវប្រសព្វមានការបត់ឆ្វេង", en: "Intersection with a left turn" },
    { km: "ផ្លូវប្រសព្វឆ្លងកាត់ម្តងមួយៗ", en: "Sequential crossing intersection" },
    { km: "ផ្លូវប្រសព្វឆ្លងកាត់ព្រមគ្នា", en: "Simultaneous crossing intersection" },
    { km: "ផ្លូវរង្វង់មូល", en: "Roundabout intersection" }
  ].filter(t => t.km !== subInfo.km);

  const typeAnswers = [
    answer(subInfo.km, subInfo.en, true),
    ...typeDistract.slice(0, 3).map(d => answer(d.km, d.en, false))
  ];

  // Explanation templates
  const expKm = `យោងតាមច្បាប់អាទិភាពនៅផ្លូវប្រសព្វនេះ ${cleanOrderKm}។`;
  const expEn = `According to the priority rules for this intersection, ${cleanOrderEn}.`;

  return [
    // 1 easy — who has right of way / identify
    item(topic, 1, "easy", "multiple_choice",
      `នៅផ្លូវប្រសព្វនេះ តើយានយន្តណាខ្លះមានសិទ្ធិទៅមុនគេ?`,
      `At this intersection, which vehicle has the right to go first?`,
      firstAnswers,
      expKm, expEn),

    // 2 easy — True/False basic rule
    item(topic, 2, "easy", "true_false",
      `យានយន្ត${firstKm} មានសិទ្ធិឆ្លងកាត់ទៅមុនគេនៅផ្លូវប្រសព្វនេះ។`,
      `${firstEn} has priority to cross first at this intersection.`,
      [answer("ត្រូវ", "True", true), answer("ខុស", "False", false)],
      expKm, expEn),

    // 3 easy — Image-selection scenario
    item(topic, 3, "easy", "image_selection",
      `តើរូបភាពមួយណាបង្ហាញពីស្ថានភាពដែល ${firstKm} មានសិទ្ធិទៅមុនគេ?`,
      `Which image shows the scenario where ${firstEn} has priority to go first?`,
      [answer(`រូបភាពច្បាប់អាទិភាព ${topic.topicCode}`, `Priority scenario ${topic.topicCode}`, true, "image_selection", topic.imageUrl), ...imgDistract],
      "ជ្រើសរើសរូបភាពផ្លូវប្រសព្វដែលបង្ហាញពីស្ថានភាពចរាចរណ៍ត្រឹមត្រូវ។",
      "Select the intersection image representing the correct traffic scenario."),

    // 4 easy — MCQ (4) basic fact
    item(topic, 4, "easy", "multiple_choice",
      `តើស្ថានភាពក្នុងរូបភាពនេះ ជាផ្លូវប្រសព្វប្រភេទណា?`,
      `What type of intersection scenario is shown in this picture?`,
      typeAnswers,
      `ស្ថានភាពនេះជាប្រភេទ${subInfo.descKm}។`,
      `This scenario is a ${subInfo.descEn.toLowerCase()}.`),

    // 5 medium — MCQ (4) correct action
    item(topic, 5, "medium", "multiple_choice",
      `ពេលមកដល់ផ្លូវប្រសព្វនេះ តើអ្នកបើកបរត្រូវធ្វើដូចម្តេចដើម្បីសុវត្ថិភាព?`,
      `When approaching this intersection, what should the driver do to stay safe?`,
      [
        answer("គោរពលំដាប់សិទ្ធិដំណើរ និងប្រុងប្រយ័ត្នយានយន្តផ្សេង", "Follow the priority order and watch other vehicles carefully", true),
        answer("បង្កើនល្បឿនដើម្បីបើកទៅមុនគេឱ្យបានលឿន", "Speed up to cross ahead of everyone else quickly", false),
        answer("មិនអើពើនឹងយានយន្តផ្សេង ព្រោះមានសិទ្ធិទៅមុន", "Ignore other vehicles because you have the right to go first", false),
        answer("បន្លឺស៊ីផ្លេខ្លាំងៗ ដើម្បីឱ្យយានយន្តផ្សេងចៀសផ្លូវឱ្យ", "Honk loudly to force other vehicles to yield the way", false)
      ],
      `ត្រូវគោរពលំដាប់សិទ្ធិដំណើរ និងប្រុងប្រយ័ត្នគ្រប់ពេល ដើម្បីកុំឱ្យមានគ្រោះថ្នាក់។`,
      `You must follow the priority order and stay alert to prevent any accidents.`),

    // 6 medium — Scenario MCQ
    item(topic, 6, "medium", "scenario",
      `${nm}កំពុងបើកបរ${firstKm} មកដល់ផ្លូវប្រសព្វនេះ។ តើ${nm}គួរធ្វើដូចម្តេច?`,
      `${nm} is driving ${firstEn} and reaches this intersection. What should ${nm} do?`,
      [
        answer("បើកឆ្លងកាត់ទៅមុនគេដោយប្រុងប្រយ័ត្ន", "Cross the intersection first with caution", true),
        answer("ឈប់រង់ចាំឱ្យយានយន្តទាំងអស់ឆ្លងកាត់អស់សិន", "Stop and wait for all other vehicles to cross first", false),
        answer("បន្លឺស៊ីផ្លេឱ្យយានយន្តដទៃឈប់រង់ចាំខ្លួន", "Honk to make other vehicles stop and wait for you", false),
        answer("បើកថយក្រោយវិញ ដើម្បីស្វែងរកផ្លូវផ្សេង", "Reverse back and look for another route", false)
      ],
      `${nm} បើកបរ${firstKm} ដែលមានអាទិភាពទៅមុន ដូច្នេះត្រូវឆ្លងកាត់ដោយប្រុងប្រយ័ត្ន។`,
      `Since ${nm} is driving ${firstEn} which has priority, they should proceed first with caution.`),

    // 7 medium — True/False common misconception
    item(topic, 7, "medium", "true_false",
      `${nm2}គិតថា យានយន្តដែលមានទំហំធំជាង តែងតែមានសិទ្ធិទៅមុនគេនៅផ្លូវប្រសព្វនេះ។`,
      `${nm2} thinks that the larger vehicle always has priority to go first at this intersection.`,
      [answer("ត្រូវ", "True", false), answer("ខុស", "False", true)],
      `សិទ្ធិដំណើរ កំណត់ដោយច្បាប់ចរាចរណ៍ មិនមែនកំណត់ដោយទំហំយានយន្តទេ។`,
      `Priority is determined by traffic laws, not by the physical size of the vehicles.`),

    // 8 hard — MCQ (4) why / safety purpose
    item(topic, 8, "hard", "multiple_choice",
      `ហេតុអ្វីបានជាការកំណត់លំដាប់សិទ្ធិដំណើរនៅផ្លូវប្រសព្វនេះ មានសារៈសំខាន់ខ្លាំង?`,
      `Why is establishing a priority order at this intersection highly important?`,
      [
        answer("ដើម្បីបង្ការការខ្វែងផ្លូវគ្នា និងកាត់បន្ថយគ្រោះថ្នាក់", "To prevent traffic conflicts and reduce intersection crashes", true),
        answer("ដើម្បីជួយឱ្យយានយន្តធុនធំអាចបើកបរលឿនជាងមុន", "To help heavy vehicles drive faster than before", false),
        answer("ដើម្បីជួយឱ្យប៉ូលិសចរាចរណ៍ងាយស្រួលផាកពិន័យ", "To make it easier for traffic police to issue fines", false),
        answer("ដើម្បីតុបតែងផ្លូវឱ្យមានសណ្តាប់ធ្នាប់ល្អ", "To decorate the road layout nicely", false)
      ],
      `ការដឹងលំដាប់សិទ្ធិ ចៀសវាងការប៉ះទង្គិចគ្នាចំចំណុចខ្វែងផ្លូវ។`,
      `Understanding priority prevents collisions at critical conflict points.`),

    // 9 hard — MCQ (4) / scenario law, penalty
    item(topic, 9, "hard", "multiple_choice",
      `បើមិនគោរពលំដាប់សិទ្ធិដំណើរនៅផ្លូវប្រសព្វនេះ ហើយបង្កឱ្យមានការបុកគ្នា តើអ្នកបើកបរនឹងប្រឈមមុខនឹងអ្វី?`,
      `If you ignore the priority order here and cause a crash, what will you face under the law?`,
      [
        answer("ការផាកពិន័យតាមច្បាប់ចរាចរណ៍ និងការទទួលខុសត្រូវសងការខូចខាត", "A traffic fine and liability for all property damage", true),
        answer("ការព្រមានដោយពាក្យសម្តី និងគ្មានការទទួលខុសត្រូវអ្វីទាំងអស់", "A verbal warning with zero financial or legal liability", false),
        answer("ការដកហូតប័ណ្ណបើកបរជាអចិន្ត្រៃយ៍ភ្លាមៗនៅនឹងកន្លែង", "Immediate and permanent loss of your driving license on the spot", false),
        answer("ការទទួលបានរង្វាន់លើកទឹកចិត្តសម្រាប់ការបើកបរលឿន", "An encouraging reward for crossing the intersection quickly", false)
      ],
      `ការខកខានមិនគោរពសិទ្ធិអាទិភាព ជាការល្មើសច្បាប់ និងត្រូវទទួលខុសត្រូវលើការខូចខាត។`,
      `Failing to yield priority violates traffic laws and makes the driver liable for any damages.`)
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

    // Score / points fields validation: make sure they are NOT present in questions/answers
    if ("scorePoints" in q || "points" in q || q.answers.some(a => "points" in a || "score" in a)) {
      problems.push(`${q.id}: contains baked-in score/point field`);
    }

    const kmText = [q.questionKm, q.answerKm, q.explanationKm, ...(q.answers || []).map((a) => a.answerKm)].join(" ");
    for (const banned of bannedKm) {
      if (kmText.includes(banned)) problems.push(`${q.id}: banned Khmer text "${banned}"`);
    }

    if (!byTopic.has(q.topicId)) byTopic.set(q.topicId, []);
    byTopic.get(q.topicId).push(q);
  }

  for (const [topicId, topicItems] of byTopic.entries()) {
    const counts = topicItems.reduce((acc, q) => { acc[q.difficulty] = (acc[q.difficulty] || 0) + 1; return acc; }, {});
    if (topicItems.length !== 9) problems.push(`topic ${topicId}: expected 9 questions, got ${topicItems.length}`);
    if (counts.easy !== 4 || counts.medium !== 3 || counts.hard !== 2) {
      problems.push(`topic ${topicId}: bad difficulty mix ${JSON.stringify(counts)}`);
    }
  }

  if (byTopic.size !== 70) problems.push(`expected 70 topics, got ${byTopic.size}`);
  if (items.length !== 630) problems.push(`expected 630 questions, got ${items.length}`);
  if (problems.length) throw new Error(`Validation failed:\n${problems.slice(0, 80).join("\n")}`);
}

function toMarkdown(data) {
  const lines = [];
  lines.push("# KWD Question and Answer Rewrite - Priority Category");
  lines.push("");
  lines.push(`Generated from live DB priority topics. ${data.items.length} questions.`);
  lines.push("");
  lines.push(`Status: ${data.meta.status}`);
  lines.push("");
  lines.push("### Gameplay Rules (computed dynamically, not baked into the Q&A)");
  lines.push("- **Base points:** easy +2 · medium +4 · hard +6");
  lines.push("- **Speed bonus:** up to half base → easy +1 · medium +2 · hard +3");
  lines.push("- **Streak bonus:** +1 per consecutive correct after the 1st, cap +5");
  lines.push("- **Accuracy:** correct ÷ total × 100");
  lines.push("");

  let lastTopic = "";
  for (const q of data.items) {
    if (q.topicCode !== lastTopic) {
      lastTopic = q.topicCode;
      lines.push("");
      lines.push(`## ${q.topicCode} - topic_id ${q.topicId}${q.subGroup ? ` - ${q.subGroup}` : ""}`);
      lines.push("");
    }
    lines.push(`### ${q.id} - ${q.difficulty} - ${q.questionType}${q.questionImageUrl ? " (image shown)" : ""}`);
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
         t.description_en, t.description_km,
         c.id AS category_id, c.slug AS category_slug
  FROM topics t JOIN categories c ON c.id = t.category_id
  WHERE c.slug = 'priority'
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
  descriptionEn: row.description_en || "",
  descriptionKm: row.description_km || "",
}));

const data = {
  meta: {
    category: "priority", categoryId: 3, version: "full-v2-standard",
    status: "for-review - not inserted",
    topicsTotal: topics.length, topicsAuthored: topics.length,
    questionsPerTopic: 9, difficultyMix: { easy: 4, medium: 3, hard: 2 }, images: true,
    answerLimit: "maximum 4 answers per question; true_false uses 2",
    source: "live DB priority topics ordered by topic id",
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
