/**
 * seed-categories.ts
 * Seeds the 8 required categories into the new database.
 * Run: npx tsx scripts/seed-categories.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL not set");
const sql = neon(dbUrl);

async function main() {
  const cats = [
    { id: 1, slug: "road-sign",              title_en: "Traffic Signs",           title_km: "សញ្ញាចរាចរ",         sort: 1 },
    { id: 2, slug: "road-traffic",           title_en: "Road Traffic Law",        title_km: "ច្បាប់ចរាចរ",         sort: 2 },
    { id: 3, slug: "priority",               title_en: "Right of Way",            title_km: "សិទ្ធិដំណើរ",          sort: 3 },
    { id: 4, slug: "driving",                title_en: "Driving Skills",          title_km: "ជំនាញបើកបរ",          sort: 4 },
    { id: 5, slug: "technical",              title_en: "Vehicle Technology",      title_km: "បច្ចេកទេសយានយន្ត",    sort: 5 },
    { id: 6, slug: "loading-people-goods",   title_en: "Loading People & Goods",  title_km: "ការដឹកអ្នកដំណើរ",     sort: 6 },
    { id: 7, slug: "general-knowledge",      title_en: "General Knowledge",       title_km: "ចំណេះដឹងទូទៅ",        sort: 7 },
    { id: 8, slug: "emergency",              title_en: "Emergency",               title_km: "អាសន្ន",               sort: 8 },
  ];

  for (const c of cats) {
    await sql`
      INSERT INTO categories (id, slug, title_en, title_km, sort_order, is_active)
      VALUES (${c.id}, ${c.slug}, ${c.title_en}, ${c.title_km}, ${c.sort}, true)
      ON CONFLICT (id) DO UPDATE SET
        slug     = EXCLUDED.slug,
        title_en = EXCLUDED.title_en,
        title_km = EXCLUDED.title_km,
        sort_order = EXCLUDED.sort_order,
        is_active  = true
    `;
    console.log(`✅ ${c.id} — ${c.title_en}`);
  }

  // Reset sequence so next insert gets id > 8
  await sql`SELECT setval(pg_get_serial_sequence('categories','id'), 8, true)`;
  console.log("\nDone. Categories seeded.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
