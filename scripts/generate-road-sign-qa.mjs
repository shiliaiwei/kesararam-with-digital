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
  "ត្រូវ ឬ មិនត្រឹមត្រូវ",
  "ដ៏",
  "ជានិច្ច",
  "សេចក្តីថ្លែងការណ៍មួយណា",
  "ថ្លែងការណ៍",
  "ប៉ប៉ោរ",
  "នូវ",
  "នៃ",
  "ឡើយ",
  "ពុំ",
  "ត្រូវបាន",
  "ទាំងឡាយ",
  "នានា",
  "ជាអាទិ៍",
  "ប្រការ",
  "អនុលោម",
  "បទប្បញ្ញត្តិ",
  "នីតិវិធី",
  "ប្រតិបត្តិ",
  "ដ៏សែន",
  "&",
  "*",
];

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
    .trim();
}

function idFor(topic, slot) {
  return `RS-${topic.id}-${String(slot).padStart(2, "0")}`;
}

function answer(answerKm, answerEn, isCorrect, answerType = "multiple_choice", imageUrl = undefined) {
  return {
    answerKm,
    answerEn,
    isCorrect,
    answerType,
    ...(imageUrl ? { imageUrl } : {}),
  };
}

function hash(input) {
  let n = 2166136261;
  for (const ch of input) {
    n ^= ch.charCodeAt(0);
    n = Math.imul(n, 16777619);
  }
  return n >>> 0;
}

function distractorTopics(topics, topic, slot, count) {
  const seen = new Set([topic.id]);
  const start = hash(`${topic.id}:${topic.topicCode}:${slot}`) % topics.length;
  const picked = [];
  for (let offset = 1; picked.length < count && offset <= topics.length * 2; offset++) {
    const candidate = topics[(start + offset * 17) % topics.length];
    if (!candidate || seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    picked.push(candidate);
  }
  if (picked.length !== count) {
    throw new Error(`Not enough distractors for topic ${topic.topicCode}`);
  }
  return picked;
}

function textChoiceAnswers(topic, distractors) {
  return [
    answer(topic.nameKm, topic.nameEn, true),
    ...distractors.map((d) => answer(d.nameKm, d.nameEn, false)),
  ];
}

function item(topic, slot, difficulty, questionType, questionKm, questionEn, answers, explanationKm, explanationEn) {
  const correct = answers.find((a) => a.isCorrect);
  return {
    id: idFor(topic, slot),
    topicId: topic.id,
    topicCode: topic.topicCode,
    categoryId: topic.categoryId,
    categorySlug: topic.categorySlug,
    subGroup: topic.subGroup,
    difficulty,
    questionType,
    questionImageUrl: topic.imageUrl,
    questionKm,
    questionEn,
    answers,
    answerKm: correct?.answerKm ?? "",
    answerEn: correct?.answerEn ?? "",
    explanationKm,
    explanationEn,
  };
}

function buildTopicItems(topic, topics) {
  const d1 = distractorTopics(topics, topic, 1, 3);
  const d3 = distractorTopics(topics, topic, 3, 3);
  const d4 = distractorTopics(topics, topic, 4, 3);

  return [
    item(
      topic,
      1,
      "easy",
      "multiple_choice",
      "សញ្ញានេះមានន័យអ្វី?",
      "What does this sign mean?",
      textChoiceAnswers(topic, d1),
      "មើលរូបសញ្ញា ហើយចាំអត្ថន័យឱ្យច្បាស់ មុនធ្វើដំណើរបន្ត។",
      "Look at the sign and know its meaning before you continue."
    ),
    item(
      topic,
      2,
      "easy",
      "true_false",
      "ត្រូវ ឬ ខុស៖ ឃើញសញ្ញានេះ អ្នកបើកបរគួរធ្វើតាម។",
      "True or False: A driver should follow this sign.",
      [answer("ត្រូវ", "True", true), answer("ខុស", "False", false)],
      "សញ្ញាចរាចរប្រាប់ឱ្យអ្នកបើកបរដឹងពីរបៀបបើកឱ្យមានសុវត្ថិភាព។",
      "Traffic signs tell drivers how to move safely."
    ),
    item(
      topic,
      3,
      "easy",
      "image_selection",
      "តើរូបណាជាសញ្ញានេះ?",
      "Which image matches this sign?",
      [
        answer(topic.nameKm, topic.nameEn, true, "image_selection", topic.imageUrl),
        ...d3.map((d) => answer(d.nameKm, d.nameEn, false, "image_selection", d.imageUrl)),
      ],
      "រូបត្រឹមត្រូវត្រូវដូចសញ្ញាក្នុងប្រធានបទនេះ។",
      "The correct image must match the sign in this topic."
    ),
    item(
      topic,
      4,
      "easy",
      "multiple_choice",
      "សញ្ញានេះស្ថិតក្នុងប្រធានបទអ្វី?",
      "Which topic does this sign belong to?",
      textChoiceAnswers(topic, d4),
      "ឈ្មោះប្រធានបទជួយឱ្យចាំសញ្ញា និងអត្ថន័យបានងាយ។",
      "The topic name helps you remember the sign and its meaning."
    ),
    item(
      topic,
      5,
      "medium",
      "multiple_choice",
      "ឃើញសញ្ញានេះ តើគួរធ្វើអ្វី?",
      "What should you do when you see this sign?",
      [
        answer("បន្ថយល្បឿន មើលផ្លូវ ហើយធ្វើតាមសញ្ញា", "Slow down, check the road, and follow the sign", true),
        answer("បង្កើនល្បឿនឆ្លងឱ្យលឿន", "Speed up to pass quickly", false),
        answer("មើលទូរស័ព្ទ មុនបើកបន្ត", "Check your phone before moving on", false),
        answer("មិនអើពើ ព្រោះផ្លូវទំនេរ", "Ignore it because the road is clear", false),
      ],
      "សញ្ញានេះជួយឱ្យអ្នកសម្រេចចិត្តបានត្រឹមត្រូវនៅលើផ្លូវ។",
      "This sign helps you make the right decision on the road."
    ),
    item(
      topic,
      6,
      "medium",
      "scenario",
      "អ្នកជិតដល់កន្លែងមានសញ្ញានេះ ហើយមានរថយន្តជុំវិញ។ តើគួរធ្វើអ្វី?",
      "You are near this sign and vehicles are around you. What should you do?",
      [
        answer("រក្សាល្បឿនសុវត្ថិភាព ហើយធ្វើតាមសញ្ញា", "Keep a safe speed and follow the sign", true),
        answer("បើកជ្រៀតមុនគេ", "Push ahead before others", false),
        answer("ឈប់កណ្ដាលផ្លូវភ្លាម", "Stop suddenly in the middle of the road", false),
        answer("មិនមើលកញ្ចក់ក្រោយ", "Do not check mirrors", false),
      ],
      "នៅកន្លែងមានរថយន្តច្រើន ការធ្វើតាមសញ្ញាជួយកាត់បន្ថយការប៉ះទង្គិច។",
      "Around other vehicles, following the sign lowers crash risk."
    ),
    item(
      topic,
      7,
      "medium",
      "true_false",
      "ត្រូវ ឬ ខុស៖ បើគ្មានប៉ូលិស អ្នកបើកបរអាចមិនធ្វើតាមសញ្ញានេះ។",
      "True or False: If no police are present, a driver may ignore this sign.",
      [answer("ត្រូវ", "True", false), answer("ខុស", "False", true)],
      "អ្នកបើកបរត្រូវធ្វើតាមសញ្ញា ទោះមានប៉ូលិស ឬគ្មានក៏ដោយ។",
      "Drivers must follow signs whether police are present or not."
    ),
    item(
      topic,
      8,
      "hard",
      "multiple_choice",
      "ហេតុអ្វីការធ្វើតាមសញ្ញានេះសំខាន់?",
      "Why is following this sign important?",
      [
        answer("ជួយកុំឱ្យបុកគ្នា និងរក្សាសណ្តាប់ធ្នាប់លើផ្លូវ", "It helps prevent crashes and keeps road order", true),
        answer("ជួយឱ្យបើកលឿនជាងគេ", "It helps you drive faster than everyone", false),
        answer("ជួយឱ្យចតកន្លែងណាក៏បាន", "It lets you park anywhere", false),
        answer("គ្រាន់តែធ្វើឱ្យផ្លូវស្អាត", "It only makes the road look nice", false),
      ],
      "សញ្ញាចរាចរជួយឱ្យអ្នកប្រើផ្លូវយល់គ្នា និងធ្វើដំណើរបានសុវត្ថិភាព។",
      "Traffic signs help road users understand each other and travel safely."
    ),
    item(
      topic,
      9,
      "hard",
      "multiple_choice",
      "បំពេញចន្លោះ៖ មិនគោរពសញ្ញានេះ អាចនាំឱ្យ ___។",
      "Fill in the blank: Ignoring this sign may lead to ___.",
      [
        answer("ផាកពិន័យ ឬគ្រោះថ្នាក់", "A fine or a crash", true),
        answer("ទទួលរង្វាន់", "A reward", false),
        answer("បើកបានលឿនជាងមុន", "Driving faster than before", false),
        answer("គ្មានហានិភ័យទេ", "No risk", false),
      ],
      "ការមិនគោរពសញ្ញា អាចបង្កគ្រោះថ្នាក់ដល់ខ្លួនឯង និងអ្នកផ្សេង។",
      "Ignoring signs can endanger you and other people."
    ),
  ];
}

function validate(data) {
  const items = data.items;
  const byTopic = new Map();
  const problems = [];

  for (const q of items) {
    if (!q.questionImageUrl) problems.push(`${q.id}: missing question image`);
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
    const counts = topicItems.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
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
      lines.push(`Image: ${q.questionImageUrl}`);
      lines.push("");
    }
    lines.push(`### ${q.id} - ${q.difficulty} - ${q.questionType}`);
    lines.push(`KM: ${q.questionKm}`);
    lines.push(`EN: ${q.questionEn}`);
    q.answers.forEach((a, index) => {
      const mark = a.isCorrect ? "[correct]" : "[ ]";
      const img = a.imageUrl ? ` - img: ${a.imageUrl}` : "";
      lines.push(`${index + 1}. ${mark} ${a.answerKm} / ${a.answerEn}${img}`);
    });
    lines.push(`Explain KM: ${q.explanationKm}`);
    lines.push(`Explain EN: ${q.explanationEn}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

const rows = await sql.query(`
  SELECT
    t.id,
    t.topic_code,
    t.name_en,
    t.name_km,
    t.sub_group,
    t.primary_image_url,
    c.id AS category_id,
    c.slug AS category_slug
  FROM topics t
  JOIN categories c ON c.id = t.category_id
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
    category: "road-sign",
    categoryId: 1,
    version: "full-v1",
    status: "for-review - not inserted",
    topicsTotal: topics.length,
    topicsAuthored: topics.length,
    questionsPerTopic: 9,
    difficultyMix: { easy: 4, medium: 3, hard: 2 },
    images: true,
    answerLimit: "maximum 4 answers per question; true_false uses 2 answers for game detection",
    source: "live DB topics ordered by topic id",
    note: "Every question links the topic primary_image_url. Image-selection uses the current topic image plus three deterministic distractor images from road-sign only. No gameplay-calculation values are embedded in answers.",
  },
  items: topics.flatMap((topic) => buildTopicItems(topic, topics)),
};

validate(data);

mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, `${JSON.stringify(data, null, 2)}\n`);
writeFileSync(outMd, `${toMarkdown(data)}\n`);

console.log(`Wrote ${outJson}`);
console.log(`Wrote ${outMd}`);
console.log(`Topics: ${topics.length}`);
console.log(`Questions: ${data.items.length}`);
