import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/generate-text-only-qa.mjs <category-slug>");
  process.exit(1);
}

const DB_URL = readEnvValue("DATABASE_URL");
if (!DB_URL) {
  throw new Error("DATABASE_URL not found in .env.local");
}

const sql = neon(DB_URL);

// Map category slug to id
const categoryMap = {
  "road-traffic": { id: 2, prefix: "RT" },
  "driving": { id: 4, prefix: "DR" },
  "technical": { id: 5, prefix: "TC" },
  "loading-people-goods": { id: 6, prefix: "LD" },
  "general-knowledge": { id: 7, prefix: "GK" },
  "emergency": { id: 8, prefix: "EM" }
};

const catConfig = categoryMap[slug];
if (!catConfig) {
  console.error(`Invalid slug. Must be one of: ${Object.keys(categoryMap).join(", ")}`);
  process.exit(1);
}

const outJson = `docs/qa-rewrite/categories/cat-0${catConfig.id}-${slug}.json`;
const outMd = `docs/qa-rewrite/categories/cat-0${catConfig.id}-${slug}.md`;

const bannedKm = [
  "ត្រូវ ឬ មិនត្រឹមត្រូវ", "ដ៏", "ជានិច្ច", "សេចក្តីថ្លែងការណ៍មួយណា", "ថ្លែងការណ៍",
  "ប៉ប៉ោរ", "នូវ", "នៃ", "ឡើយ", "ពុំ", "ត្រូវបាន", "ទាំងឡាយ", "នានា", "ជាអាទិ៍",
  "ប្រការ", "អនុលោម", "បទប្បញ្ញត្តិ", "នីតិវិធី", "ប្រតិបត្តិ", "ដ៏សែន", "&", "*", "៖",
];

// NAMES array removed as proper names are no longer used in scenarios.

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
  let cleaned = String(value || "")
    .replace(/\s+/g, " ")
    .replace(/៖/g, "")
    .replace(/^\s*ចម្លើយគឺ\s*:?\s*/g, "")
    .replace(/ចម្លើយគឺ/g, "")
    .replace(/ត្រូវ ឬ មិនត្រឹមត្រូវ/g, "ត្រូវ ឬ ខុស")
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
  // Strip any leading/trailing colons, spaces, or Khmer signs
  cleaned = cleaned.replace(/^[:\s\u17d6]+/, "").trim();
  cleaned = cleaned.replace(/[:\u17d6]+$/, "").trim();
  return cleaned;
}

function cleanEn(value) {
  let cleaned = String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/^\s*The answer is\s*:?\s*/i, "")
    .trim();
  // Strip any leading/trailing colons or spaces
  cleaned = cleaned.replace(/^[:\s]+/, "").trim();
  cleaned = cleaned.replace(/[:]+$/, "").trim();
  return cleaned;
}

function cleanQuestionEn(value) {
  return cleanEn(value);
}

function cleanQuestionKm(value) {
  return cleanKm(value);
}

function hash(input) {
  let n = 2166136261;
  for (const ch of input) { n ^= ch.charCodeAt(0); n = Math.imul(n, 16777619); }
  return n >>> 0;
}

// Deterministic distractors selection
function getDistractors(topics, topic, slot, count) {
  const key = (t) => hash(`${topic.id}:${slot}:${t.id}`);
  const sorted = topics
    .filter((t) => t.id !== topic.id)
    .sort((a, b) => key(a) - key(b));
  return sorted.slice(0, count);
}

function answer(answerKm, answerEn, isCorrect, answerType = "multiple_choice") {
  return { answerKm, answerEn, isCorrect, answerType };
}

function shuffle(array, seed) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  let s = seed;
  while (0 !== currentIndex) {
    s = Math.imul(s, 16777619) ^ currentIndex;
    randomIndex = Math.abs(s) % currentIndex;
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

async function main() {
  console.log(`Fetching topics for category slug: ${slug}...`);
  const topics = await sql`
    SELECT t.id, t.topic_code, t.name_en, t.name_km, t.sub_group,
           t.description_en, t.description_km
    FROM topics t JOIN categories c ON c.id=t.category_id
    WHERE c.slug = ${slug} ORDER BY t.sort_order, t.id
  `;

  console.log(`Loaded ${topics.length} topics.`);
  if (topics.length === 0) {
    console.error("No topics found in the DB for this category.");
    process.exit(1);
  }

  const items = [];

  for (let idx = 0; idx < topics.length; idx++) {
    const t = topics[idx];
    const cleanTopicNameEn = cleanQuestionEn(t.name_en);
    const cleanTopicNameKm = cleanQuestionKm(t.name_km);
    const correctAnsEn = cleanEn(t.description_en);
    const correctAnsKm = cleanKm(t.description_km);
    const prefix = catConfig.prefix;

    // Helper to get distractors for current slot
    const getSlotDistractors = (slotNum) => {
      const dists = getDistractors(topics, t, slotNum, 3);
      return dists.map(d => ({
        en: cleanEn(d.description_en),
        km: cleanKm(d.description_km)
      }));
    };

    // Slot 1: easy MCQ — identify / meaning
    const s1Dists = getSlotDistractors(1);
    const s1Answers = [
      answer(correctAnsKm, correctAnsEn, true),
      ...s1Dists.map(d => answer(d.km, d.en, false))
    ];
    items.push({
      id: `${prefix}-${t.id}-01`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "easy", questionType: "multiple_choice", questionImageUrl: null,
      questionKm: `តើអ្នកយល់ដឹងយ៉ាងណាដែរចំពោះ "${cleanTopicNameKm}"?`,
      questionEn: `How do you correctly understand "${cleanTopicNameEn}"?`,
      answers: shuffle(s1Answers, hash(`${t.id}:1`)),
      answerKm: correctAnsKm, answerEn: correctAnsEn,
      explanationKm: `ការយល់ដឹងត្រឹមត្រូវគឺ "${correctAnsKm}"។`,
      explanationEn: `The correct understanding is: ${correctAnsEn}.`
    });

    // Slot 2: easy True / False — basic rule
    const s2Answers = [
      answer("ត្រូវ", "True", true),
      answer("ខុស", "False", false)
    ];
    items.push({
      id: `${prefix}-${t.id}-02`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "easy", questionType: "true_false", questionImageUrl: null,
      questionKm: `នៅពេលអ្នកជួបសំណួរ "${cleanTopicNameKm}" អ្នកដឹងថាចម្លើយត្រឹមត្រូវគឺ "${correctAnsKm}"។`,
      questionEn: `When you face the question "${cleanTopicNameEn}", you know the correct answer is "${correctAnsEn}".`,
      answers: s2Answers, // T/F always has True first, False second
      answerKm: "ត្រូវ", answerEn: "True",
      explanationKm: `ពិតប្រាកដណាស់ ចម្លើយគឺ "${correctAnsKm}"។`,
      explanationEn: `Indeed, the correct answer is: ${correctAnsEn}.`
    });

    // Slot 3: easy MCQ
    const s3Dists = getSlotDistractors(3);
    const s3Answers = [
      answer(correctAnsKm, correctAnsEn, true),
      ...s3Dists.map(d => answer(d.km, d.en, false))
    ];
    items.push({
      id: `${prefix}-${t.id}-03`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "easy", questionType: "multiple_choice", questionImageUrl: null,
      questionKm: `តើអ្នកជ្រើសរើសចម្លើយមួយណាឱ្យបានត្រឹមត្រូវសម្រាប់ "${cleanTopicNameKm}"?`,
      questionEn: `Which answer do you choose correctly for "${cleanTopicNameEn}"?`,
      answers: shuffle(s3Answers, hash(`${t.id}:3`)),
      answerKm: correctAnsKm, answerEn: correctAnsEn,
      explanationKm: `ចម្លើយត្រឹមត្រូវគឺ "${correctAnsKm}"។`,
      explanationEn: `The correct answer is: ${correctAnsEn}.`
    });

    // Slot 4: easy MCQ — basic fact
    const s4Dists = getSlotDistractors(4);
    const s4Answers = [
      answer(correctAnsKm, correctAnsEn, true),
      ...s4Dists.map(d => answer(d.km, d.en, false))
    ];
    items.push({
      id: `${prefix}-${t.id}-04`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "easy", questionType: "multiple_choice", questionImageUrl: null,
      questionKm: `យោងតាមច្បាប់ចរាចរណ៍ តើអ្នកកំណត់ចម្លើយត្រឹមត្រូវសម្រាប់ "${cleanTopicNameKm}" ដូចម្ដេច?`,
      questionEn: `According to road rules, how do you correctly define "${cleanTopicNameEn}"?`,
      answers: shuffle(s4Answers, hash(`${t.id}:4`)),
      answerKm: correctAnsKm, answerEn: correctAnsEn,
      explanationKm: `ចម្លើយត្រឹមត្រូវគឺ "${correctAnsKm}"។`,
      explanationEn: `The correct definition is: ${correctAnsEn}.`
    });

    // Slot 5: medium MCQ — correct action
    const s5Dists = getSlotDistractors(5);
    const s5Answers = [
      answer(correctAnsKm, correctAnsEn, true),
      ...s5Dists.map(d => answer(d.km, d.en, false))
    ];
    items.push({
      id: `${prefix}-${t.id}-05`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "medium", questionType: "multiple_choice", questionImageUrl: null,
      questionKm: `តើអ្នកត្រូវធ្វើសកម្មភាពដូចម្ដេចឱ្យបានត្រឹមត្រូវចំពោះ "${cleanTopicNameKm}"?`,
      questionEn: `What correct action must you take regarding "${cleanTopicNameEn}"?`,
      answers: shuffle(s5Answers, hash(`${t.id}:5`)),
      answerKm: correctAnsKm, answerEn: correctAnsEn,
      explanationKm: `សកម្មភាពត្រឹមត្រូវគឺ "${correctAnsKm}"។`,
      explanationEn: `The correct action is: ${correctAnsEn}.`
    });

    // Slot 6: medium Scenario MCQ — apply it
    const s6Dists = getSlotDistractors(6);
    const s6Answers = [
      answer(correctAnsKm, correctAnsEn, true),
      ...s6Dists.map(d => answer(d.km, d.en, false))
    ];
    items.push({
      id: `${prefix}-${t.id}-06`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "medium", questionType: "scenario", questionImageUrl: null,
      questionKm: `នៅក្នុងស្ថានភាពជាក់ស្ដែង ប្រសិនបើអ្នកជួបនឹង "${cleanTopicNameKm}" តើអ្នកសម្រេចចិត្តជ្រើសរើសចម្លើយមួយណា?`,
      questionEn: `In a real scenario, if you encounter "${cleanTopicNameEn}", which answer do you choose?`,
      answers: shuffle(s6Answers, hash(`${t.id}:6`)),
      answerKm: correctAnsKm, answerEn: correctAnsEn,
      explanationKm: `អ្នកត្រូវដឹងថាចម្លើយត្រឹមត្រូវគឺ "${correctAnsKm}"។`,
      explanationEn: `You need to know that the correct answer is: ${correctAnsEn}.`
    });

    // Slot 7: medium True / False — common misconception
    // We statement a false belief using a distractor
    const s7Dist = s6Dists[0];
    const s7Answers = [
      answer("ត្រូវ", "True", false),
      answer("ខុស", "False", true)
    ];
    items.push({
      id: `${prefix}-${t.id}-07`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "medium", questionType: "true_false", questionImageUrl: null,
      questionKm: `តើវាជាការត្រឹមត្រូវទេ ប្រសិនបើអ្នកគិតថា "${s7Dist.km}" គឺជាចម្លើយសម្រាប់ "${cleanTopicNameKm}"?`,
      questionEn: `Is it correct if you believe that "${s7Dist.en}" is the answer for "${cleanTopicNameEn}"?`,
      answers: s7Answers,
      answerKm: "ខុស", answerEn: "False",
      explanationKm: `ការយល់ឃើញនេះគឺមិនត្រឹមត្រូវទេ។ ចម្លើយពិតប្រាកដគឺ "${correctAnsKm}"។`,
      explanationEn: `This belief is incorrect. The correct fact is: ${correctAnsEn}.`
    });

    // Slot 8: hard MCQ — why / safety purpose
    const s8Answers = [
      answer("ដើម្បីធានាសុវត្ថិភាព បង្ការគ្រោះថ្នាក់ និងរក្សាសណ្តាប់ធ្នាប់លើដងផ្លូវ", "To ensure safety, prevent accidents, and maintain road order", true),
      answer("គ្រាន់តែដើម្បីប្រឡងយកប័ណ្ណបើកបរឱ្យជាប់ងាយស្រួលប៉ុណ្ណោះ", "Only to pass the driver licensing test easily", false),
      answer("ដើម្បីចៀសវាងការបង់ពន្ធបន្តិចបន្តួចជូនរដ្ឋ", "To avoid paying minor taxes to the government", false),
      answer("វាមិនមានសារៈសំខាន់អ្វីទេសម្រាប់អ្នកប្រើប្រាស់ផ្លូវធម្មតា", "It has no importance for ordinary road users", false)
    ];
    items.push({
      id: `${prefix}-${t.id}-08`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "hard", questionType: "multiple_choice", questionImageUrl: null,
      questionKm: `ហេតុអ្វីបានជាអ្នកត្រូវតែយល់ដឹង និងគោរពច្បាប់ចំពោះ "${cleanTopicNameKm}"?`,
      questionEn: `Why must you understand and respect the rule for "${cleanTopicNameEn}"?`,
      answers: shuffle(s8Answers, hash(`${t.id}:8`)),
      answerKm: "ដើម្បីធានាសុវត្ថិភាព បង្ការគ្រោះថ្នាក់ និងរក្សាសណ្តាប់ធ្នាប់លើដងផ្លូវ",
      answerEn: "To ensure safety, prevent accidents, and maintain road order",
      explanationKm: "ការអនុវត្តតាមច្បាប់ចរាចរណ៍ ជួយសង្គ្រោះជីវិតមនុស្ស និងរក្សាសណ្តាប់ធ្នាប់សាធារណៈ។",
      explanationEn: "Following traffic guidelines saves human lives and maintains public order."
    });

    // Slot 9: hard MCQ — law, penalty, or edge case
    const s9Answers = [
      answer("វាអាចនាំឱ្យមានការផាកពិន័យ ត្រូវទទួលខុសត្រូវតាមច្បាប់ ឬបង្កគ្រោះថ្នាក់ធ្ងន់ធ្ងរ", "It can lead to traffic fines, legal liability, or severe accidents", true),
      answer("ការទទួលបានប្រាក់រង្វាន់លើកទឹកចិត្តពីសាលាក្រុង", "A cash incentive reward from the municipality", false),
      answer("ការឡើងថ្នាក់បើកបរភ្លាមៗដោយមិនបាច់ពិនិត្យ", "Immediate promotion in your driving class with no verification", false),
      answer("គ្មានផលវិបាកតាមច្បាប់ ឬការផ្លាស់ប្តូរហានិភ័យសុវត្ថិភាពទេ", "No legal consequence or changes in safety risk", false)
    ];
    items.push({
      id: `${prefix}-${t.id}-09`, topicId: t.id, topicCode: t.topic_code,
      categoryId: catConfig.id, categorySlug: slug, subGroup: t.sub_group,
      difficulty: "hard", questionType: "multiple_choice", questionImageUrl: null,
      questionKm: `តើអាចមានផលវិបាកអ្វីខ្លះតាមច្បាប់ចរាចរណ៍ ប្រសិនបើអ្នកមិនអើពើនឹង "${cleanTopicNameKm}"?`,
      questionEn: `What legal consequences may you face if you ignore "${cleanTopicNameEn}"?`,
      answers: shuffle(s9Answers, hash(`${t.id}:9`)),
      answerKm: "វាអាចនាំឱ្យមានការផាកពិន័យ ត្រូវទទួលខុសត្រូវតាមច្បាប់ ឬបង្កគ្រោះថ្នាក់ធ្ងន់ធ្ងរ",
      answerEn: "It can lead to traffic fines, legal liability, or severe accidents",
      explanationKm: "ការមិនគោរពច្បាប់ នឹងត្រូវរងការផាកពិន័យ និងប្រឈមនឹងគ្រោះថ្នាក់ខ្ពស់។",
      explanationEn: "Failing to follow rules results in legal penalties and high accident risks."
    });
  }

  // Final Validation
  const problems = [];
  for (const q of items) {
    if (q.answers.length > 4) problems.push(`${q.id}: more than 4 answers`);
    if (q.questionType === "true_false" && q.answers.length !== 2) {
      problems.push(`${q.id}: true_false must have exactly 2 options`);
    }
    if (q.questionType !== "true_false" && q.answers.length !== 4) {
      problems.push(`${q.id}: MCQ must have exactly 4 options`);
    }
    if (q.answers.filter(a => a.isCorrect).length !== 1) {
      problems.push(`${q.id}: must have exactly 1 correct answer`);
    }
    // Banned words checks
    for (const banned of bannedKm) {
      if (q.questionKm.includes(banned)) {
        problems.push(`${q.id}: question contains banned word "${banned}"`);
      }
      if (q.explanationKm.includes(banned)) {
        problems.push(`${q.id}: explanation contains banned word "${banned}"`);
      }
      for (const a of q.answers) {
        if (a.answerKm.includes(banned)) {
          problems.push(`${q.id}: answer contains banned word "${banned}"`);
        }
      }
    }
  }

  if (problems.length > 0) {
    console.error("Validation failed:");
    console.error(problems.slice(0, 50).join("\n"));
    process.exit(1);
  }

  console.log("✅ Validation passed: zero issues found.");

  const outputData = {
    meta: {
      category: slug,
      categoryId: catConfig.id,
      version: "full-v2-standard",
      status: "for-review - not inserted",
      topicsTotal: topics.length,
      topicsAuthored: topics.length,
      questionsPerTopic: 9,
      difficultyMix: { easy: 4, medium: 3, hard: 2 },
      images: false,
      answerLimit: "maximum 4 answers per question; true_false uses 2",
      source: `live DB ${slug} topics`
    },
    items
  };

  function toMarkdown() {
    const lines = [`# Category: ${slug} (${topics.length} topics, ${items.length} questions)`, "", `Status: ${outputData.meta.status}`, ""];
    for (const q of items) {
      lines.push(`### ${q.id} - ${q.difficulty} - ${q.questionType}`);
      lines.push(`KM: ${q.questionKm}`);
      lines.push(`EN: ${q.questionEn}`);
      q.answers.forEach((a, i) => {
        lines.push(`${i + 1}. ${a.isCorrect ? "[correct]" : "[ ]"} ${a.answerKm} / ${a.answerEn}`);
      });
      lines.push(`Explain KM: ${q.explanationKm}`);
      lines.push(`Explain EN: ${q.explanationEn}`);
      lines.push("");
    }
    return lines.join("\n").trimEnd();
  }

  mkdirSync(dirname(outJson), { recursive: true });
  writeFileSync(outJson, `${JSON.stringify(outputData, null, 2)}\n`);
  writeFileSync(outMd, `${toMarkdown()}\n`);
  console.log(`Wrote ${outJson}`);
  console.log(`Wrote ${outMd}`);
  console.log(`Topics: ${topics.length}  Questions: ${items.length}  Answers: ${items.length * 4}`);
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
