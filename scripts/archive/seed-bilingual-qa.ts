import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function main() {
  try {
    console.log("🚀 Starting database Q&A regeneration...");

    // 1. Fetch all topics from all 8 categories
    const allTopics = await sql`
      SELECT t.id, t.topic_code, t.name_en, t.name_km, t.category_id, t.primary_image_url, c.title_en as cat_name
      FROM topics t
      INNER JOIN categories c ON t.category_id = c.id
      ORDER BY t.category_id, t.id
    `;

    console.log(`Found ${allTopics.length} topics across all categories.`);

    // Collect all unique topic images to use as distractors for visual questions
    const topicImages = allTopics
      .map((t: any) => t.primary_image_url)
      .filter((url: string | null) => !!url);

    console.log(`Collected ${topicImages.length} topic images for visual distractors.`);

    // Helper to get random distractors
    const getRandomImages = (excludeUrl: string, count: number): string[] => {
      const filtered = topicImages.filter((url: string) => url !== excludeUrl);
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // 2. Perform the database wipe under transaction conditions (we will delete first)
    console.log("🧹 Wiping existing answers and questions...");
    await sql`TRUNCATE TABLE answers, questions CASCADE`;
    console.log("✅ Answers and Questions wiped successfully.");

    let questionInsertCount = 0;
    let answerInsertCount = 0;

    // 3. Generate questions for each topic
    for (let index = 0; index < allTopics.length; index++) {
      const topic = allTopics[index];
      const nameEn = topic.name_en.trim();
      const nameKm = topic.name_km ? topic.name_km.trim() : nameEn;

      // Define the 9 question suite
      const questionsSuite = [
        // Q1: MCQ (Easy) - Identification (4 options)
        {
          en: `What is the correct meaning of "${nameEn}"?`,
          km: `តើការយល់ដឹងត្រឹមត្រូវអំពី "${nameKm}" គឺជាអ្វី?`,
          difficulty: "easy",
          answers: [
            { en: `It regulates rules regarding ${nameEn}.`, km: `វាបង្ហាញពីច្បាប់ចរាចរណ៍ទាក់ទងនឹង ${nameKm}។`, correct: true },
            { en: "It is only applicable at night.", km: "វាត្រូវបានប្រើប្រាស់តែនៅពេលយប់ប៉ុណ្ណោះ។", correct: false },
            { en: "It applies only to commercial trucks.", km: "វាអនុវត្តចំពោះតែរថយន្តដឹកទំនិញធុនធំតែប៉ុណ្ណោះ។", correct: false },
            { en: "It has no legal enforceability.", km: "វាគ្មានអត្ថន័យច្បាប់បង្ខំឡើយ។", correct: false },
          ]
        },
        // Q2: True/False (Easy) - Basic Rule (2 options)
        {
          en: `True or False: Road users must always follow the rules of "${nameEn}".`,
          km: `ត្រូវ ឬ មិនត្រឹមត្រូវ៖ អ្នកប្រើប្រាស់ផ្លូវទាំងអស់ត្រូវតែគោរពតាមច្បាប់ចរាចរណ៍នៃ "${nameKm}" ជានិច្ច។`,
          difficulty: "easy",
          answers: [
            { en: "True", km: "ត្រូវ", correct: true },
            { en: "False", km: "មិនត្រឹមត្រូវ", correct: false },
          ]
        },
        // Q3: MCQ (Medium) - Action (4 options)
        {
          en: `When encountering the rule for "${nameEn}", you should:`,
          km: `នៅពេលអ្នកជួបសញ្ញា ឬច្បាប់នៃ "${nameKm}" អ្នកគួរតែ៖`,
          difficulty: "medium",
          answers: [
            { en: "Adjust your driving behavior to comply immediately.", km: "កែតម្រូវឥរិយាបថបើកបររបស់អ្នកដើម្បីអនុវត្តតាមភ្លាមៗ។", correct: true },
            { en: "Ignore it if there are no traffic police nearby.", km: "មិនអើពើចំពោះវា ប្រសិនបើគ្មាននគរបាលចរាចរណ៍នៅក្បែរ។", correct: false },
            { en: "Accelerate to pass through the zone quickly.", km: "បង្កើនល្បឿនដើម្បីឆ្លងកាត់តំបន់នោះឱ្យបានលឿន។", correct: false },
            { en: "Stop the vehicle and wait for 5 minutes.", km: "ឈប់យានយន្ត ហើយរង់ចាំរយៈពេល ៥ នាទី។", correct: false },
          ]
        },
        // Q4: MCQ (Medium) - Penalty (4 options)
        {
          en: `What consequence may a driver face under Cambodian law for ignoring "${nameEn}"?`,
          km: `តើអ្នកបើកបរនឹងប្រឈមមុខនឹងអ្វីតាមច្បាប់ចរាចរណ៍កម្ពុជា ប្រសិនបើមិនគោរពតាម "${nameKm}"?`,
          difficulty: "medium",
          answers: [
            { en: "A standard traffic fine and driver's license point deduction.", km: "ការផាកពិន័យអន្តរកាលចរាចរណ៍ និងការកាត់ពិន្ទុប័ណ្ណបើកបរ។", correct: true },
            { en: "A verbal warning only without any financial penalty.", km: "ការព្រមានជាសម្តីតែប៉ុណ្ណោះ ដោយគ្មានការផាកពិន័យជាប្រាក់ឡើយ។", correct: false },
            { en: "A cash reward for efficient driving.", km: "ការទទួលបានរង្វាន់ជាប្រាក់សម្រាប់ការបើកបរលឿនរហ័ស។", correct: false },
            { en: "Immediate permanent confiscation of the vehicle.", km: "ការរឹបអូសយកយានយន្តជាអចិន្ត្រៃយ៍ភ្លាមៗ។", correct: false },
          ]
        },
        // Q5: True/False (Medium) - Exception (2 options)
        {
          en: `True or False: The safety regulation for "${nameEn}" is only active during daylight hours.`,
          km: `ត្រូវ ឬ មិនត្រឹមត្រូវ៖ បទប្បញ្ញត្តិសុវត្ថិភាពសម្រាប់ "${nameKm}" មានប្រសិទ្ធភាពតែនៅពេលថ្ងៃប៉ុណ្ណោះ។`,
          difficulty: "medium",
          answers: [
            { en: "True", km: "ត្រូវ", correct: false },
            { en: "False", km: "មិនត្រឹមត្រូវ", correct: true },
          ]
        },
        // Q6: MCQ (Hard) - Purpose (4 options)
        {
          en: `Which of the following best describes the safety purpose of "${nameEn}"?`,
          km: `តើមួយណាខាងក្រោមពណ៌នាបានល្អបំផុតអំពីគោលបំណងសុវត្ថិភាពនៃ "${nameKm}"?`,
          difficulty: "hard",
          answers: [
            { en: "To prevent traffic accidents and organize vehicle movements safely.", km: "ដើម្បីបង្ការគ្រោះថ្នាក់ចរាចរណ៍ និងរៀបចំលំហូរចរាចរណ៍ប្រកបដោយសុវត្ថិភាព។", correct: true },
            { en: "To decorate public roads and highways.", km: "ដើម្បីលម្អសោភ័ណភាពផ្លូវថ្នល់ និងផ្លូវល្បឿនលឿនសាធារណៈ។", correct: false },
            { en: "To limit parking options for passenger cars only.", km: "ដើម្បីកំណត់ជម្រើសចតរថយន្តសម្រាប់តែរថយន្តផ្ទាល់ខ្លួនប៉ុណ្ណោះ។", correct: false },
            { en: "To guide foreign tourists along scenic routes.", km: "ដើម្បីណែនាំភ្ញៀវទេសចរបរទេសតាមដងផ្លូវកម្សាន្តនានា។", correct: false },
          ]
        },
        // Q7: MCQ (Hard) - Safe Rationale (4 options)
        {
          en: `Why is the standard rule of "${nameEn}" critical for public road safety?`,
          km: `ហេតុអ្វីបានជាច្បាប់ស្តង់ដារនៃ "${nameKm}" មានសារៈសំខាន់ខ្លាំងចំពោះសុវត្ថិភាពផ្លូវគោកសាធារណៈ?`,
          difficulty: "hard",
          answers: [
            { en: "It reduces risk and establishes clear order among diverse road users.", km: "វាជួយកាត់បន្ថយហានិភ័យ និងបង្កើតសណ្តាប់ធ្នាប់ច្បាស់លាស់រវាងអ្នកប្រើប្រាស់ផ្លូវ។", correct: true },
            { en: "It helps reduce vehicle fuel consumption.", km: "វាជួយកាត់បន្ថយការប្រើប្រាស់ប្រេងឥន្ធនៈរបស់យានយន្ត។", correct: false },
            { en: "It speeds up travel times in residential areas.", km: "វាជួយបង្កើនល្បឿនធ្វើដំណើរក្នុងតំបន់លំនៅឋាន។", correct: false },
            { en: "It minimizes wear and tear on tires and brakes.", km: "វាជួយកាត់បន្ថយការសឹកសំបកកង់ និងហ្វ្រាំងយានយន្ត។", correct: false },
          ]
        },
        // Q8: MCQ (Hard) - Scenario (4 options)
        {
          en: `In a crowded driving scenario, failure to respect "${nameEn}" primarily increases the risk of:`,
          km: `នៅក្នុងស្ថានភាពចរាចរណ៍ចង្អៀតណែន ការខកខានមិនគោរពច្បាប់នៃ "${nameKm}" អាចបង្កើនហានិភ័យនៃ៖`,
          difficulty: "hard",
          answers: [
            { en: "Collisions with other vehicles or vulnerable road users.", km: "ការប៉ះទង្គិចគ្នាជាមួយយានយន្តដទៃ ឬអ្នកប្រើប្រាស់ផ្លូវដែលងាយរងគ្រោះ។", correct: true },
            { en: "Slightly delayed travel times.", km: "ការយឺតយ៉ាវបន្តិចបន្តួចក្នុងពេលវេលាធ្វើដំណើរ។", correct: false },
            { en: "Minor engine overheating.", km: "ការឡើងកម្តៅខ្លាំងបន្តិចបន្តួចនៃម៉ាស៊ីន។", correct: false },
            { en: "Incorrect GPS navigation routes.", km: "ការបង្ហាញផ្លូវមិនត្រឹមត្រូវរបស់ប្រព័ន្ធ GPS។", correct: false },
          ]
        },
        // Q9: MCQ/Image Pick (Hard) - Visual Choice (3 options for visual, 4 options if fallback MCQ)
        topic.primary_image_url
          ? {
              en: `Which of the following signs represents "${nameEn}"?`,
              km: `តើផ្លាកសញ្ញាមួយណាខាងក្រោមតំណាងឱ្យ "${nameKm}"?`,
              difficulty: "hard",
              isVisual: true,
              answers: [
                { en: "Correct Sign Symbol", km: "រូបសញ្ញាត្រឹមត្រូវ", correct: true, imageUrl: topic.primary_image_url },
                { en: "Incorrect Sign Symbol A", km: "រូបសញ្ញាមិនត្រឹមត្រូវ ក", correct: false, imageUrl: getRandomImages(topic.primary_image_url, 2)[0] || topic.primary_image_url },
                { en: "Incorrect Sign Symbol B", km: "រូបសញ្ញាមិនត្រឹមត្រូវ ខ", correct: false, imageUrl: getRandomImages(topic.primary_image_url, 2)[1] || topic.primary_image_url },
              ]
            }
          : {
              en: `Under standard driving conditions, how is the rule of "${nameEn}" enforced?`,
              km: `នៅក្រោមលក្ខខណ្ឌបើកបរទូទៅ តើច្បាប់ចរាចរណ៍នៃ "${nameKm}" ត្រូវអនុវត្តបែបណា?`,
              difficulty: "hard",
              answers: [
                { en: "It applies to all vehicles at all times unless directed by police.", km: "វាអនុវត្តចំពោះយានយន្តទាំងអស់គ្រប់ពេលវេលា លើកលែងតែមានការបញ្ជាពីប៉ូលីស។", correct: true },
                { en: "It is only a recommendation and not legally binding.", km: "វាគ្រាន់តែជាការណែនាំប៉ុណ្ណោះ និងមិនមានកាតព្វកិច្ចផ្លូវច្បាប់ឡើយ។", correct: false },
                { en: "It only applies to drivers who possess a professional license.", km: "វាអនុវត្តតែចំពោះអ្នកបើកបរដែលមានប័ណ្ណបើកបរអាជីពប៉ុណ្ណោះ។", correct: false },
                { en: "It applies solely during public holidays.", km: "វាអនុវត្តតែក្នុងអំឡុងពេលថ្ងៃបុណ្យជាតិប៉ុណ្ណោះ។", correct: false },
              ]
            }
      ];

      // Insert questions and answers
      for (const q of questionsSuite) {
        const [insertedQ] = await sql`
          INSERT INTO questions (topic_id, question_en, question_km, difficulty, status)
          VALUES (${topic.id}, ${q.en}, ${q.km}, ${q.difficulty}, 'approved')
          RETURNING id
        `;
        questionInsertCount++;

        const isVisual = (q as any).isVisual;

        for (let i = 0; i < q.answers.length; i++) {
          const a = q.answers[i];
          const answerType = isVisual ? "image_selection" : "multiple_choice";
          
          await sql`
            INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, sort_order, image_url)
            VALUES (${insertedQ.id}, ${answerType}, ${a.en}, ${a.km}, ${a.correct}, ${i}, ${(a as any).imageUrl ?? null})
          `;
          answerInsertCount++;
        }
      }

      if ((index + 1) % 50 === 0 || index + 1 === allTopics.length) {
        console.log(`  Processed ${index + 1}/${allTopics.length} topics...`);
      }
    }

    console.log(`\n🎉 Database Q&A regeneration complete!`);
    console.log(`- Total Questions Inserted: ${questionInsertCount}`);
    console.log(`- Total Answers Inserted: ${answerInsertCount}`);

  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
