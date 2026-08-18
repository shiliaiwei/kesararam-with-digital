/**
 * Complete & Structured Database Backup for Neon PostgreSQL
 *
 * Exports:
 * 1. Raw JSON dumps of ALL tables in public schema
 * 2. All 8 main categories & sub-groups
 * 3. 600+ topics/signs with Khmer & English titles, descriptions, audio URLs, image URLs
 * 4. 5,900+ questions & answers linked to topics/signs
 * 5. Game modes & priority scenes
 * 6. Media catalog (audio & images)
 * 7. Unified master dataset & category/subgroup folder structure
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "../src/lib/db";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

function stamp() {
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function sanitizeFolderName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function run() {
  console.log("🚀 Starting Full Neon DB Backup...");

  const folderArg = process.argv[2] || "KWD_Media_Library";
  const timestampStr = stamp();
  const baseDir = join(process.cwd(), folderArg);
  
  // Create folders
  const rawDir = join(baseDir, "raw_tables");
  const metaDir = join(baseDir, "metadata");
  const catDir = join(baseDir, "categories");
  const gameDir = join(baseDir, "game_data");
  const unifiedDir = join(baseDir, "unified");

  mkdirSync(rawDir, { recursive: true });
  mkdirSync(metaDir, { recursive: true });
  mkdirSync(catDir, { recursive: true });
  mkdirSync(gameDir, { recursive: true });
  mkdirSync(unifiedDir, { recursive: true });

  // 1. Fetch all base tables in public schema
  console.log("\n📦 1/5 Dumping raw tables...");
  const tablesRes = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`;
  const tables: string[] = tablesRes.map((r: any) => r.table_name);

  const tableSummary: Record<string, number> = {};
  let totalRows = 0;

  for (const t of tables) {
    const rows = await (sql as any).query(`SELECT * FROM "${t}"`);
    const arr = Array.isArray(rows) ? rows : (rows.rows ?? []);
    writeFileSync(join(rawDir, `${t}.json`), JSON.stringify(arr, null, 2), "utf-8");
    tableSummary[t] = arr.length;
    totalRows += arr.length;
    console.log(`   └─ ${t.padEnd(30)} : ${arr.length} rows`);
  }

  // 2. Fetch domain data (categories, topics, questions, answers, game modes, priority scenes)
  console.log("\n📑 2/5 Structuring categories and sub-groups...");
  const categories = await sql`SELECT * FROM categories ORDER BY sort_order, id`;
  const topics = await sql`SELECT * FROM topics ORDER BY category_id, sort_order, id`;
  const questions = await sql`SELECT * FROM questions ORDER BY topic_id, sort_order, id`;
  const answers = await sql`SELECT * FROM answers ORDER BY question_id, sort_order, id`;
  const gameModes = await sql`SELECT * FROM game_modes ORDER BY id`;
  const priorityScenes = await sql`SELECT * FROM priority_scenes ORDER BY id`;

  // Map answers by question_id
  const answersMap = new Map<number, any[]>();
  for (const ans of answers) {
    const qid = ans.question_id;
    if (!answersMap.has(qid)) {
      answersMap.set(qid, []);
    }
    answersMap.get(qid)!.push(ans);
  }

  // Build full questions with answers
  const fullQuestions = questions.map((q: any) => ({
    ...q,
    answers: answersMap.get(q.id) ?? [],
  }));

  // Map questions by topic_id
  const questionsByTopicMap = new Map<number, any[]>();
  for (const q of fullQuestions) {
    const tid = q.topic_id;
    if (tid) {
      if (!questionsByTopicMap.has(tid)) {
        questionsByTopicMap.set(tid, []);
      }
      questionsByTopicMap.get(tid)!.push(q);
    }
  }

  // Write metadata
  writeFileSync(join(metaDir, "categories.json"), JSON.stringify(categories, null, 2), "utf-8");

  // Subgroups breakdown
  const subgroupsPerCategory: Record<number, Record<string, number>> = {};
  for (const top of topics) {
    const cid = top.category_id;
    const sub = top.sub_group || "Uncategorized";
    if (!subgroupsPerCategory[cid]) subgroupsPerCategory[cid] = {};
    subgroupsPerCategory[cid][sub] = (subgroupsPerCategory[cid][sub] || 0) + 1;
  }
  writeFileSync(join(metaDir, "subcategories.json"), JSON.stringify(subgroupsPerCategory, null, 2), "utf-8");

  // 3. Category folders & sub-group structure
  console.log("\n🗂️ 3/5 Generating category & subgroup folders...");
  const categorySummary: any[] = [];

  for (const cat of categories) {
    const catSlug = cat.slug || `cat_${cat.id}`;
    const folderName = `cat_${cat.id}_${sanitizeFolderName(catSlug)}`;
    const thisCatDir = join(catDir, folderName);
    const subDir = join(thisCatDir, "by_subgroup");

    mkdirSync(thisCatDir, { recursive: true });
    mkdirSync(subDir, { recursive: true });

    const catTopics = topics.filter((t: any) => t.category_id === cat.id);
    
    // Group topics by sub_group
    const bySubGroup: Record<string, any[]> = {};
    for (const t of catTopics) {
      const subKey = t.sub_group ? sanitizeFolderName(t.sub_group) : "uncategorized";
      if (!bySubGroup[subKey]) bySubGroup[subKey] = [];
      
      const topicQs = questionsByTopicMap.get(t.id) ?? [];
      bySubGroup[subKey].push({
        ...t,
        question_count: topicQs.length,
        questions: topicQs,
      });
    }

    for (const [subKey, items] of Object.entries(bySubGroup)) {
      writeFileSync(join(subDir, `${subKey}.json`), JSON.stringify(items, null, 2), "utf-8");
    }

    const catMeta = {
      id: cat.id,
      slug: cat.slug,
      title_en: cat.title_en,
      title_km: cat.title_km,
      sort_order: cat.sort_order,
      is_active: cat.is_active,
      topic_count: catTopics.length,
      sub_groups: subgroupsPerCategory[cat.id] ?? {},
    };

    writeFileSync(join(thisCatDir, "summary.json"), JSON.stringify(catMeta, null, 2), "utf-8");
    writeFileSync(
      join(thisCatDir, "signs_bilingual.json"),
      JSON.stringify(
        catTopics.map((t: any) => ({
          ...t,
          questions: questionsByTopicMap.get(t.id) ?? [],
        })),
        null,
        2
      ),
      "utf-8"
    );

    categorySummary.push(catMeta);
    console.log(`   └─ Folder: ${folderName.padEnd(35)} (${catTopics.length} items)`);
  }

  // 4. Game Data & Master Datasets
  console.log("\n🎮 4/5 Exporting game modes, questions & master datasets...");
  writeFileSync(join(gameDir, "game_modes.json"), JSON.stringify(gameModes, null, 2), "utf-8");
  writeFileSync(join(gameDir, "priority_scenes.json"), JSON.stringify(priorityScenes, null, 2), "utf-8");
  writeFileSync(join(gameDir, "all_questions_with_answers.json"), JSON.stringify(fullQuestions, null, 2), "utf-8");

  // Audio & Image Indexes
  const audioIndex: any[] = [];
  const imageIndex: any[] = [];

  const masterSigns = topics.map((t: any) => {
    const qCount = (questionsByTopicMap.get(t.id) ?? []).length;
    if (t.audio_url_km || t.audio_url_en) {
      audioIndex.push({
        id: t.id,
        topic_code: t.topic_code,
        name_en: t.name_en,
        name_km: t.name_km,
        category_id: t.category_id,
        sub_group: t.sub_group,
        audio_url_km: t.audio_url_km,
        audio_url_en: t.audio_url_en,
      });
    }
    if (t.primary_image_url) {
      imageIndex.push({
        id: t.id,
        topic_code: t.topic_code,
        name_en: t.name_en,
        name_km: t.name_km,
        category_id: t.category_id,
        primary_image_url: t.primary_image_url,
      });
    }
    return {
      id: t.id,
      topic_code: t.topic_code,
      category_id: t.category_id,
      sub_group: t.sub_group,
      title_en: t.name_en,
      title_km: t.name_km,
      description_en: t.description_en,
      description_km: t.description_km,
      image_url: t.primary_image_url,
      audio_url_km: t.audio_url_km,
      audio_url_en: t.audio_url_en,
      question_count: qCount,
      questions: questionsByTopicMap.get(t.id) ?? [],
    };
  });

  writeFileSync(join(unifiedDir, "all_signs_master.json"), JSON.stringify(masterSigns, null, 2), "utf-8");
  writeFileSync(join(unifiedDir, "audio_index.json"), JSON.stringify(audioIndex, null, 2), "utf-8");
  writeFileSync(join(unifiedDir, "image_index.json"), JSON.stringify(imageIndex, null, 2), "utf-8");

  // 5. Build Manifest
  console.log("\n📊 5/5 Writing backup manifest...");
  const manifest = {
    createdAtUTC: timestampStr,
    database: "Neon PostgreSQL",
    totalBaseTables: tables.length,
    totalRows: totalRows,
    tableRowCounts: tableSummary,
    summary: {
      total_categories: categories.length,
      total_signs_topics: topics.length,
      total_questions: questions.length,
      total_answers: answers.length,
      total_game_modes: gameModes.length,
      total_priority_scenes: priorityScenes.length,
      total_audio_linked: audioIndex.length,
      total_images_linked: imageIndex.length,
    },
    category_breakdown: categorySummary,
  };

  writeFileSync(join(baseDir, "_manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

  console.log("\n✅ Backup Completed Successfully!");
  console.log(`📁 Directory: ${baseDir}`);
  console.log(`📊 Total Tables: ${tables.length} | Total Rows: ${totalRows}`);
  console.log(`🚦 Categories: ${categories.length} | Signs/Topics: ${topics.length} | Questions: ${questions.length}`);
}

run().catch((err) => {
  console.error("❌ Backup failed:", err);
  process.exit(1);
});
