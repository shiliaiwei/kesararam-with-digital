/**
 * Fill topics that have fewer than 5 questions up to 5.
 */
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const topics = await sql`
  SELECT t.id, t.name_en, c.title_en as cat,
    (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as q_count
  FROM topics t JOIN categories c ON t.category_id = c.id
  WHERE (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) < 5
  ORDER BY t.category_id, t.id
`;

console.log(`${topics.length} topics need filling\n`);

for (const topic of topics) {
  const existing = topic.q_count;
  const needed = 5 - existing;
  const name = topic.name_en;

  const pool = [
    { en: `What is the correct understanding of "${name}"?`, km: `តើការយល់ដឹងត្រឹមត្រូវអំពី "${name}" គឺជាអ្វី?`, difficulty: "easy", answers: [{ en: "It indicates a traffic rule", km: "វាបង្ហាញពីច្បាប់ចរាចរ", correct: true }, { en: "It is decorative only", km: "វាគ្រាន់តែតុបតែង", correct: false }, { en: "Only applies at night", km: "អនុវត្តតែពេលយប់", correct: false }, { en: "No legal meaning", km: "គ្មានអត្ថន័យច្បាប់", correct: false }] },
    { en: `When you see "${name}", you should:`, km: `នៅពេលឃើញ "${name}" អ្នកគួរ:`, difficulty: "medium", answers: [{ en: "Follow the instruction", km: "អនុវត្តតាមការណែនាំ", correct: true }, { en: "Ignore it", km: "មិនអើពើ", correct: false }, { en: "Speed up", km: "បង្កើនល្បឿន", correct: false }, { en: "Stop for 5 minutes", km: "ឈប់ ៥ នាទី", correct: false }] },
    { en: `True or False: "${name}" applies to all road users.`, km: `ពិត ឬ មិនពិត: "${name}" អនុវត្តចំពោះអ្នកប្រើប្រាស់ផ្លូវទាំងអស់។`, difficulty: "easy", answers: [{ en: "True", km: "ពិត", correct: true }, { en: "False", km: "មិនពិត", correct: false }] },
    { en: `Which best describes "${name}"?`, km: `តើមួយណាពិពណ៌នាបានល្អបំផុតអំពី "${name}"?`, difficulty: "hard", answers: [{ en: "Regulates driver behavior for safety", km: "គ្រប់គ្រងអាកប្បកិរិយាអ្នកបើកបរ", correct: true }, { en: "Marks parking zones", km: "សម្គាល់តំបន់ចតរថយន្ត", correct: false }, { en: "Guides tourists", km: "ណែនាំភ្ញៀវទេសចរ", correct: false }, { en: "Decorates the road", km: "តុបតែងផ្លូវ", correct: false }] },
    { en: `Ignoring "${name}" may result in:`, km: `ការមិនអើពើ "${name}" អាចបណ្តាលឱ្យ:`, difficulty: "medium", answers: [{ en: "A fine or license suspension", km: "ការផាកពិន័យ ឬ ផ្អាកប័ណ្ណ", correct: true }, { en: "A reward", km: "រង្វាន់", correct: false }, { en: "Nothing", km: "គ្មានអ្វី", correct: false }, { en: "Free parking", km: "ចតរថយន្តឥតគិតថ្លៃ", correct: false }] },
  ];

  const toAdd = pool.slice(existing, existing + needed);

  for (const q of toAdd) {
    const [ins] = await sql`
      INSERT INTO questions (topic_id, question_en, question_km, difficulty, status)
      VALUES (${topic.id}, ${q.en}, ${q.km}, ${q.difficulty}, 'draft')
      RETURNING id
    `;
    for (let i = 0; i < q.answers.length; i++) {
      const a = q.answers[i];
      await sql`
        INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, sort_order)
        VALUES (${ins.id}, 'multiple_choice', ${a.en}, ${a.km}, ${a.correct}, ${i})
      `;
    }
  }
  console.log(`  FILLED [${topic.cat}] ${topic.name_en.substring(0,40)} → added ${needed} Q (was ${existing})`);
}

console.log("\nDone.");
