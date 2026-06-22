// Read-only: count what users 8 and 18 own in non-empty BLOCKING tables.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const rows = await sql`
  SELECT 8 AS uid,
    (SELECT COUNT(*) FROM topics WHERE created_by = 8) AS topics_created,
    (SELECT COUNT(*) FROM topics WHERE approved_by = 8) AS topics_approved,
    (SELECT COUNT(*) FROM questions WHERE created_by = 8) AS questions_created,
    (SELECT COUNT(*) FROM priority_scenes WHERE created_by = 8) AS scenes_created,
    (SELECT COUNT(*) FROM classes WHERE teacher_id = 8) AS classes_owned,
    (SELECT COUNT(*) FROM subscriptions WHERE assigned_by = 8) AS subs_assigned
  UNION ALL
  SELECT 18,
    (SELECT COUNT(*) FROM topics WHERE created_by = 18),
    (SELECT COUNT(*) FROM topics WHERE approved_by = 18),
    (SELECT COUNT(*) FROM questions WHERE created_by = 18),
    (SELECT COUNT(*) FROM priority_scenes WHERE created_by = 18),
    (SELECT COUNT(*) FROM classes WHERE teacher_id = 18),
    (SELECT COUNT(*) FROM subscriptions WHERE assigned_by = 18)`;

for (const r of rows) console.log(JSON.stringify(r));
