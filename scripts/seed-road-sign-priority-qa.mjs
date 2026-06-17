/**
 * seed-road-sign-priority-qa.mjs
 *
 * Inserts questions for:
 *   road-sign  (247 topics) — 9 questions each  → ~2,223 questions
 *   priority   (70 topics)  — 6 questions each  → ~420 questions
 *
 * Question types:
 *   MCQ (4 opts, multiple_choice)
 *   True/False (2 opts, multiple_choice)
 *   Image-selection (3 opts, image_selection)
 *   Scenario MCQ (4 opts, multiple_choice)
 *   Multi-select (4 opts, checkbox)
 *
 * Run: node scripts/seed-road-sign-priority-qa.mjs
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// ── env ───────────────────────────────────────────────────────────────────────
const envContent = readFileSync('.env.local', 'utf-8');
let DATABASE_URL = '';
for (const line of envContent.split('\n')) {
    const m = line.match(/^DATABASE_URL='?([^']+)'?/);
    if (m) { DATABASE_URL = m[1]; break; }
}
const sql = neon(DATABASE_URL);

// ── helpers ───────────────────────────────────────────────────────────────────
function pickRandom(pool, exclude, n) {
    const filtered = pool.filter(u => u && u !== exclude);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

let totalQ = 0;
let totalA = 0;

/** Insert one question + answers, returns question id */
async function insertQuestion(topicId, en, km, difficulty, imgUrl, answers) {
    const rows = await sql.query(
        `INSERT INTO questions (topic_id, question_type, question_en, question_km, difficulty, status, image_url)
     VALUES ($1, 'quiz', $2, $3, $4, 'approved', $5) RETURNING id`,
        [topicId, en, km, difficulty, imgUrl ?? null]
    );
    const qid = rows[0].id;
    totalQ++;
    for (let i = 0; i < answers.length; i++) {
        const a = answers[i];
        await sql.query(
            `INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, sort_order, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [qid, a.type, a.en, a.km, a.correct, i, a.img ?? null]
        );
        totalA++;
    }
    return qid;
}

function mc(en, km, correct) {
    return { type: 'multiple_choice', en, km, correct, img: null };
}
function imgOpt(en, km, correct, img) {
    return { type: 'image_selection', en, km, correct, img };
}
function cb(en, km, correct) {
    return { type: 'checkbox', en, km, correct, img: null };
}

// ── load topics ───────────────────────────────────────────────────────────────
const allTopics = await sql`
  SELECT t.id, t.topic_code, t.name_en, t.name_km, t.category_id,
         t.primary_image_url, c.slug
  FROM topics t
  JOIN categories c ON t.category_id = c.id
  WHERE c.slug IN ('road-sign','priority')
  ORDER BY t.category_id, t.id
`;

const roadSignTopics = allTopics.filter(t => t.slug === 'road-sign');
const priorityTopics = allTopics.filter(t => t.slug === 'priority');
const allImages = allTopics.map(t => t.primary_image_url).filter(Boolean);

console.log(`\n🚦 Road-Sign topics : ${roadSignTopics.length}`);
console.log(`🚦 Priority topics  : ${priorityTopics.length}`);
console.log(`🖼  Image pool       : ${allImages.length}\n`);

// ── ROAD-SIGN — 9 questions each ─────────────────────────────────────────────
console.log('── Seeding road-sign questions ──');
for (let idx = 0; idx < roadSignTopics.length; idx++) {
    const t = roadSignTopics[idx];
    const en = t.name_en.trim();
    const km = (t.name_km || en).trim();
    const tid = t.id;
    const img = t.primary_image_url;
    const [d1, d2] = pickRandom(allImages, img, 2);

    // Q1 MCQ easy — identification
    await insertQuestion(tid,
        `What is the correct meaning of the "${en}" sign?`,
        `តើការយល់ដឹងត្រឹមត្រូវអំពីសញ្ញា "${km}" គឺជាអ្វី?`,
        'easy', null, [
        mc(`It indicates a rule or instruction related to ${en}.`, `វាបង្ហាញពីច្បាប់ ឬការណែនាំទាក់ទងនឹង${km}។`, true),
        mc('It is only used at night.', 'វាត្រូវបានប្រើប្រាស់តែនៅពេលយប់ប៉ុណ្ណោះ។', false),
        mc('It applies only to commercial trucks.', 'វាអនុវត្តចំពោះតែរថយន្តដឹកទំនិញធុនធំប៉ុណ្ណោះ។', false),
        mc('It has no legal enforceability.', 'វាគ្មានអត្ថន័យច្បាប់បង្ខំឡើយ។', false),
    ]);

    // Q2 True/False easy
    await insertQuestion(tid,
        `True or False: The "${en}" sign must always be obeyed by all road users.`,
        `ត្រូវ ឬ មិនត្រឹមត្រូវ: សញ្ញា "${km}" ត្រូវតែគោរពដោយអ្នកប្រើប្រាស់ផ្លូវទាំងអស់ជានិច្ច។`,
        'easy', null, [
        mc('True', 'ត្រូវ', true),
        mc('False', 'មិនត្រឹមត្រូវ', false),
    ]);

    // Q3 MCQ medium — correct action
    await insertQuestion(tid,
        `When you see the "${en}" sign, you should:`,
        `នៅពេលអ្នកឃើញសញ្ញា "${km}" អ្នកគួរ:`,
        'medium', null, [
        mc('Comply with the sign instruction immediately.', 'អនុវត្តតាមការណែនាំសញ្ញាភ្លាមៗ។', true),
        mc('Ignore it if there are no traffic police nearby.', 'មិនអើពើ ប្រសិនបើគ្មាននគរបាលចរាចរណ៍នៅក្បែរ។', false),
        mc('Accelerate to pass through the area quickly.', 'បង្កើនល្បឿនដើម្បីឆ្លងកាត់តំបន់នោះឱ្យបានលឿន។', false),
        mc('Stop and wait for at least 5 minutes.', 'ឈប់ ហើយរង់ចាំយ៉ាងហោចណាស់ ៥ នាទី។', false),
    ]);

    // Q4 MCQ medium — penalty
    await insertQuestion(tid,
        `Under Cambodian traffic law, what may happen if a driver ignores the "${en}" sign?`,
        `តើអ្នកបើកបរអាចប្រឈមមុខនឹងអ្វីប្រសិនបើមិនគោរពសញ្ញា "${km}"?`,
        'medium', null, [
        mc('A traffic fine and possible license penalty.', 'ការផាកពិន័យចរាចរ និងការផ្អាកប័ណ្ណបើកបរ។', true),
        mc('A verbal warning with no financial penalty.', 'ការព្រមានជាសម្តីដោយគ្មានការផាកពិន័យ។', false),
        mc('A cash reward for efficient driving.', 'ការទទួលរង្វាន់ជាប្រាក់សម្រាប់ការបើកបរប្រសិទ្ធភាព។', false),
        mc('Immediate permanent confiscation of the vehicle.', 'ការរឹបអូសយានយន្តជាអចិន្ត្រៃយ៍ភ្លាមៗ។', false),
    ]);

    // Q5 True/False medium — daytime myth
    await insertQuestion(tid,
        `True or False: The "${en}" sign only applies during daytime hours.`,
        `ត្រូវ ឬ មិនត្រឹមត្រូវ: សញ្ញា "${km}" អនុវត្តតែក្នុងអំឡុងពេលថ្ងៃប៉ុណ្ណោះ។`,
        'medium', null, [
        mc('True', 'ត្រូវ', false),
        mc('False', 'មិនត្រឹមត្រូវ', true),
    ]);

    // Q6 MCQ hard — safety purpose
    await insertQuestion(tid,
        `Which statement best describes the safety purpose of the "${en}" sign?`,
        `តើសេចក្តីថ្លែងការណ៍មួយណាពណ៌នាបានល្អបំផុតអំពីគោលបំណងសុវត្ថិភាពនៃសញ្ញា "${km}"?`,
        'hard', null, [
        mc('To prevent accidents and maintain orderly traffic flow.', 'ដើម្បីការពារគ្រោះថ្នាក់ និងរក្សាលំហូរចរាចរណ៍ត្រឹមត្រូវ។', true),
        mc('To decorate public roads and highways.', 'ដើម្បីតុបតែងផ្លូវគោក និងផ្លូវល្បឿន។', false),
        mc('To limit parking for private cars only.', 'ដើម្បីកំណត់ចតរថយន្តសម្រាប់តែរថយន្តឯកជន។', false),
        mc('To guide foreign tourists along scenic routes.', 'ដើម្បីណែនាំភ្ញៀវទេសចរបរទេស។', false),
    ]);

    // Q7 MCQ hard — consequence in heavy traffic
    await insertQuestion(tid,
        `In heavy traffic, failing to respect the "${en}" sign primarily increases the risk of:`,
        `ក្នុងចរាចរណ៍ដ៏ស្ទះ ការខកខានមិនគោរពសញ្ញា "${km}" បង្កើនហានិភ័យចំបងនៃ:`,
        'hard', null, [
        mc('Collisions with other vehicles or pedestrians.', 'ការប៉ះទង្គិចជាមួយយានយន្ត ឬអ្នកថ្មើរជើង។', true),
        mc('Slightly delayed travel times.', 'ការយឺតបន្តិចក្នុងការធ្វើដំណើរ។', false),
        mc('Minor engine overheating.', 'ម៉ាស៊ីនឡើងកម្តៅបន្តិចបន្តួច។', false),
        mc('Incorrect GPS navigation.', 'ការណែនាំ GPS មិនត្រឹមត្រូវ។', false),
    ]);

    // Q8 Scenario MCQ hard — apply the rule
    await insertQuestion(tid,
        `A driver approaches the "${en}" sign at an intersection. The correct response is to:`,
        `អ្នកបើកបរម្នាក់ប្រឈមមុខនឹងសញ្ញា "${km}" នៅផ្លូវបំបែក។ ការឆ្លើយតបត្រឹមត្រូវគឺ:`,
        'hard', null, [
        mc(`Act according to the "${en}" sign and yield where required.`, `ប្រព្រឹត្តតាមសញ្ញា "${km}" ហើយផ្ដល់ផ្លូវនៅកន្លែងត្រូវការ។`, true),
        mc('Speed up to clear the intersection faster.', 'បង្កើនល្បឿនដើម្បីចេញពីផ្លូវបំបែកឱ្យបានលឿន។', false),
        mc('Flash headlights and honk to warn others.', 'ភ្លើចភ្លឺ និងបន្លឺអ៊ីចង់ ដើម្បីព្រមានអ្នកផ្សេង។', false),
        mc('Proceed only if no other vehicles are visible.', 'បន្តទៅមុខតែប្រសិនបើមិនឃើញយានយន្តណាមួយ។', false),
    ]);

    // Q9 Image-selection hard — identify the sign visually
    if (img) {
        await insertQuestion(tid,
            `Which of the following images shows the "${en}" sign?`,
            `តើរូបភាពមួយណាខាងក្រោមបង្ហាញសញ្ញា "${km}"?`,
            'hard', img, [
            imgOpt('Correct sign', 'សញ្ញាត្រឹមត្រូវ', true, img),
            imgOpt('Incorrect sign A', 'សញ្ញាមិនត្រឹមត្រូវ ក', false, d1 || img),
            imgOpt('Incorrect sign B', 'សញ្ញាមិនត្រឹមត្រូវ ខ', false, d2 || img),
        ]);
    }

    if ((idx + 1) % 50 === 0 || idx + 1 === roadSignTopics.length) {
        console.log(`  Road-Sign: ${idx + 1}/${roadSignTopics.length} done  (Q:${totalQ}, A:${totalA})`);
    }
}

// ── PRIORITY — 6 questions each ──────────────────────────────────────────────
console.log('\n── Seeding priority questions ──');
for (let idx = 0; idx < priorityTopics.length; idx++) {
    const t = priorityTopics[idx];
    const en = t.name_en.trim();
    const km = (t.name_km || en).trim();
    const tid = t.id;
    const img = t.primary_image_url;
    const [d1, d2] = pickRandom(allImages, img, 2);

    // Q1 Image-selection easy — identify the sign from image
    if (img) {
        await insertQuestion(tid,
            'Which image correctly shows the priority sign in this topic?',
            'តើរូបភាពមួយណាបង្ហាញបានត្រឹមត្រូវអំពីសញ្ញាអាទិភាពក្នុងប្រធានបទនេះ?',
            'easy', img, [
            imgOpt('Correct sign image', 'រូបភាពសញ្ញាត្រឹមត្រូវ', true, img),
            imgOpt('Wrong sign image A', 'រូបភាពសញ្ញាខុស ក', false, d1 || img),
            imgOpt('Wrong sign image B', 'រូបភាពសញ្ញាខុស ខ', false, d2 || img),
        ]);
    }

    // Q2 MCQ easy — sign meaning
    await insertQuestion(tid,
        `What does the "${en}" sign mean?`,
        `តើសញ្ញា "${km}" មានន័យដូចម្ដេច?`,
        'easy', null, [
        mc(`It indicates the right-of-way rule for "${en}".`, `វាបង្ហាញពីច្បាប់ផ្ដល់ផ្លូវសម្រាប់ "${km}"។`, true),
        mc('It marks a parking zone for buses only.', 'វាសម្គាល់តំបន់ចតរថយន្តក្រុងប៉ុណ្ណោះ។', false),
        mc('It warns of roadworks ahead.', 'វាព្រមានពីតំបន់ជួសជុលផ្លូវខាងមុខ។', false),
        mc('It indicates a pedestrian crossing.', 'វាបង្ហាញពីទីតាំងឆ្លងផ្លូវអ្នកថ្មើរជើង។', false),
    ]);

    // Q3 True/False medium — always applies
    await insertQuestion(tid,
        `True or False: The right-of-way rule shown by "${en}" applies to all vehicles at all times.`,
        `ត្រូវ ឬ មិនត្រឹមត្រូវ: ច្បាប់ផ្ដល់ផ្លូវដែលបង្ហាញដោយ "${km}" អនុវត្តចំពោះយានយន្តទាំងអស់គ្រប់ពេលវេលា។`,
        'medium', null, [
        mc('True', 'ត្រូវ', true),
        mc('False', 'មិនត្រឹមត្រូវ', false),
    ]);

    // Q4 MCQ medium — correct action at junction
    await insertQuestion(tid,
        `When you encounter the "${en}" sign at a junction, you must:`,
        `នៅពេលអ្នកជួបសញ្ញា "${km}" នៅផ្លូវបំបែក អ្នកត្រូវ:`,
        'medium', null, [
        mc('Give way to vehicles with priority as indicated by the sign.', 'ផ្ដល់ផ្លូវឱ្យយានយន្តដែលមានអាទិភាពតាមការបង្ហាញដោយសញ្ញា។', true),
        mc('Proceed without stopping or slowing down.', 'បន្តទៅមុខដោយមិនឈប់ ឬបន្ថយល្បឿន។', false),
        mc('Sound the horn to alert other vehicles.', 'បន្លឺអ៊ីចង់ដើម្បីជូនដំណឹងដល់យានយន្តផ្សេង។', false),
        mc('Flash your headlights and overtake.', 'ភ្លឺចភ្លឺ ហើយចម្លងបន្ទាត់។', false),
    ]);

    // Q5 Scenario MCQ hard — apply the rule
    await insertQuestion(tid,
        `At an uncontrolled intersection you see the "${en}" sign. A vehicle approaches from your right. You should:`,
        `នៅផ្លូវបំបែកដែលគ្មានភ្លើងសញ្ញា អ្នកឃើញ "${km}"។ យានយន្តមួយទៀតមកពីខាងស្តាំ។ អ្នកគួរ:`,
        'hard', null, [
        mc('Stop and yield to the vehicle on your right as required.', 'ឈប់ ហើយផ្ដល់ផ្លូវឱ្យយានយន្តខាងស្តាំតាមច្បាប់ដែលត្រូវការ។', true),
        mc('Proceed because you arrived at the junction first.', 'បន្តទៅព្រោះអ្នកមកដល់ផ្លូវបំបែកមុន។', false),
        mc('Honk and proceed quickly before the other vehicle.', 'បន្លឺអ៊ីចង់ ហើយបន្តទៅមុនយានយន្តមួយទៀត។', false),
        mc('Back up and take a different route.', 'បើកថយក្រោយ ហើយយកផ្លូវវេង។', false),
    ]);

    // Q6 Multi-select hard — two correct situations
    await insertQuestion(tid,
        `Which TWO situations require you to observe the "${en}" rule? (Select all that apply)`,
        `តើស្ថានភាព ២ ណាខាងក្រោមតម្រូវឱ្យអ្នកគោរពច្បាប់ "${km}"? (ជ្រើសរើសទាំងអស់ដែលត្រឹមត្រូវ)`,
        'hard', null, [
        cb('When approaching a marked intersection or junction.', 'នៅពេលបើករថយន្តចូលផ្លូវបំបែក ឬ ទីប្រសព្វដែលបានសម្គាល់។', true),
        cb('When merging onto a main road from a side street.', 'នៅពេលចូលទៅផ្លូវធំពីផ្លូវចំហៀង។', true),
        cb('When parking in a designated parking bay.', 'នៅពេលចតនៅក្នុងតំបន់ចតយានយន្ត។', false),
        cb('When refueling at a petrol station.', 'នៅពេលបំពេញប្រេងនៅស្ថានីយឥន្ធនៈ។', false),
    ]);

    if ((idx + 1) % 20 === 0 || idx + 1 === priorityTopics.length) {
        console.log(`  Priority:  ${idx + 1}/${priorityTopics.length} done  (Q:${totalQ}, A:${totalA})`);
    }
}

// ── verify ────────────────────────────────────────────────────────────────────
const [qCount] = await sql`SELECT COUNT(*) AS cnt FROM questions`;
const [aCount] = await sql`SELECT COUNT(*) AS cnt FROM answers`;
const byType = await sql`SELECT answer_type, COUNT(*) AS cnt FROM answers GROUP BY answer_type ORDER BY cnt DESC`;
const byDiff = await sql`SELECT difficulty, COUNT(*) AS cnt FROM questions GROUP BY difficulty ORDER BY cnt DESC`;

console.log(`\n✅ Done!`);
console.log(`   Questions inserted this run : ${totalQ}`);
console.log(`   Answers   inserted this run : ${totalA}`);
console.log(`   DB questions now             : ${qCount.cnt}`);
console.log(`   DB answers   now             : ${aCount.cnt}`);
console.log(`\n📋 Answers by type:`);
for (const r of byType) console.log(`   ${String(r.answer_type).padEnd(20)} : ${r.cnt}`);
console.log(`\n📋 Questions by difficulty:`);
for (const r of byDiff) console.log(`   ${String(r.difficulty).padEnd(10)} : ${r.cnt}`);
