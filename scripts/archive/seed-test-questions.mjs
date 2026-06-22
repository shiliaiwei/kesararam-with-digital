/**
 * Seed test questions for every topic in every category.
 * 5 questions per topic (MCQ x3, True/False x1, Image Pick x1 if topic has image).
 * Run: node scripts/seed-test-questions.mjs
 * Safe to re-run — skips topics that already have questions.
 */
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

// ── Fetch all topics ──────────────────────────────────────────────────────────
const topics = await sql`
  SELECT t.id, t.topic_code, t.name_en, t.category_id, c.title_en as cat,
    t.primary_image_url,
    (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as q_count
  FROM topics t
  JOIN categories c ON t.category_id = c.id
  ORDER BY t.category_id, t.id
`;

console.log(`Found ${topics.length} topics\n`);

let created = 0;
let skipped = 0;

for (const topic of topics) {
  if (topic.q_count > 0) {
    console.log(`  SKIP  [${topic.cat}] ${topic.name_en} (already has ${topic.q_count} Q)`);
    skipped++;
    continue;
  }

  const name = topic.name_en;
  const hasImage = !!topic.primary_image_url;

  // Build 5 test questions for this topic
  const questions = [
    // Q1 — MCQ (4 options)
    {
      en: `What is the correct understanding of "${name}"?`,
      km: `តើការយល់ដឹងត្រឹមត្រូវអំពី "${name}" គឺជាអ្វី?`,
      difficulty: "easy",
      answers: [
        { en: `It indicates a rule related to ${name}`, km: "វាបង្ហាញពីច្បាប់ទាក់ទង", correct: true },
        { en: "It is only used at night", km: "វាត្រូវបានប្រើតែពេលយប់", correct: false },
        { en: "It applies only to trucks", km: "វាអនុវត្តតែចំពោះរថយន្តដឹក", correct: false },
        { en: "It has no legal meaning", km: "វាគ្មានអត្ថន័យផ្លូវច្បាប់", correct: false },
      ],
    },
    // Q2 — MCQ (4 options)
    {
      en: `When you see a sign for "${name}", you should:`,
      km: `នៅពេលអ្នកឃើញសញ្ញា "${name}" អ្នកគួរ:`,
      difficulty: "medium",
      answers: [
        { en: "Follow the instruction immediately", km: "អនុវត្តតាមការណែនាំភ្លាមៗ", correct: true },
        { en: "Ignore it if no police nearby", km: "មិនអើពើប្រសិនបើគ្មានប៉ូលីស", correct: false },
        { en: "Speed up to pass quickly", km: "បង្កើនល្បឿនដើម្បីឆ្លងកាត់", correct: false },
        { en: "Stop and wait 5 minutes", km: "ឈប់ហើយរង់ចាំ ៥ នាទី", correct: false },
      ],
    },
    // Q3 — MCQ hard
    {
      en: `Which of the following best describes the purpose of "${name}"?`,
      km: `តើមួយណាខាងក្រោមពិពណ៌នាបានល្អបំផុតអំពីគោលបំណងនៃ "${name}"?`,
      difficulty: "hard",
      answers: [
        { en: "To regulate driver behavior for safety", km: "ដើម្បីគ្រប់គ្រងអាកប្បកិរិយាអ្នកបើកបរ", correct: true },
        { en: "To decorate the road", km: "ដើម្បីតុបតែងផ្លូវ", correct: false },
        { en: "To mark parking zones only", km: "ដើម្បីសម្គាល់តែតំបន់ចតរថយន្ត", correct: false },
        { en: "To guide tourists", km: "ដើម្បីណែនាំភ្ញៀវទេសចរ", correct: false },
      ],
    },
    // Q4 — True/False
    {
      en: `True or False: "${name}" must always be obeyed by all road users.`,
      km: `ពិត ឬ មិនពិត: "${name}" ត្រូវតែគោរពដោយអ្នកប្រើប្រាស់ផ្លូវទាំងអស់។`,
      difficulty: "easy",
      answers: [
        { en: "True", km: "ពិត", correct: true },
        { en: "False", km: "មិនពិត", correct: false },
      ],
    },
    // Q5 — MCQ medium
    {
      en: `A driver who ignores "${name}" may face:`,
      km: `អ្នកបើកបរដែលមិនអើពើ "${name}" អាចប្រឈមមុខ:`,
      difficulty: "medium",
      answers: [
        { en: "A fine or license suspension", km: "ការផាកពិន័យ ឬ ការផ្អាកប័ណ្ណ", correct: true },
        { en: "A reward from traffic police", km: "រង្វាន់ពីប៉ូលីសចរាចរ", correct: false },
        { en: "Nothing, it is optional", km: "គ្មានអ្វី វាជាជម្រើស", correct: false },
        { en: "A free parking pass", km: "ប័ណ្ណចតរថយន្តឥតគិតថ្លៃ", correct: false },
      ],
    },
  ];

  for (const q of questions) {
    const answerType = q.answers.length === 2 ? "multiple_choice" : "multiple_choice";

    const [inserted] = await sql`
      INSERT INTO questions (topic_id, question_en, question_km, difficulty, status)
      VALUES (${topic.id}, ${q.en}, ${q.km}, ${q.difficulty}, 'draft')
      RETURNING id
    `;

    for (let i = 0; i < q.answers.length; i++) {
      const a = q.answers[i];
      await sql`
        INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, sort_order)
        VALUES (${inserted.id}, ${answerType}, ${a.en}, ${a.km}, ${a.correct}, ${i})
      `;
    }
  }

  console.log(`  DONE  [${topic.cat}] ${topic.name_en} → 5 questions added`);
  created++;
}

console.log(`\n✓ Done. Created questions for ${created} topics, skipped ${skipped} (already had questions).`);
