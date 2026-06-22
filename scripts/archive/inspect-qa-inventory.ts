import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);

const slug = process.argv[2] ?? "emergency";

async function main() {
  const rows = await sql`
    SELECT t.id, t.topic_code, t.name_en, t.name_km, t.sub_group,
           t.description_en, t.description_km, t.primary_image_url
    FROM topics t JOIN categories c ON c.id=t.category_id
    WHERE c.slug = ${slug} ORDER BY t.sort_order, t.id`;
  console.log(`# ${slug}: ${rows.length} topics`);
  for (const r of rows) {
    console.log(JSON.stringify({
      id: r.id, code: r.topic_code, sub: r.sub_group,
      en: r.name_en?.trim(), km: r.name_km?.trim(),
      ans_en: (r.description_en ?? "").replace(/\s+/g, " ").trim(),
      ans_km: (r.description_km ?? "").replace(/\s+/g, " ").trim(),
    }));
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
