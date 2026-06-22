import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const teachers = await sql`SELECT id, username, email FROM users WHERE role = 'teacher' ORDER BY id`;
console.log("Teachers:", teachers.length);
for (const t of teachers) {
    const r = await sql`
    SELECT
      (SELECT COUNT(*) FROM topics WHERE created_by = ${t.id}) AS topics,
      (SELECT COUNT(*) FROM topics WHERE approved_by = ${t.id}) AS topics_appr,
      (SELECT COUNT(*) FROM questions WHERE created_by = ${t.id}) AS questions,
      (SELECT COUNT(*) FROM priority_scenes WHERE created_by = ${t.id}) AS scenes,
      (SELECT COUNT(*) FROM classes WHERE teacher_id = ${t.id}) AS classes`;
    console.log(`  #${t.id} ${t.username} <${t.email}> →`, JSON.stringify(r[0]));
}
const sess = await sql`SELECT COUNT(*)::int AS n FROM sessions`;
console.log("Total sessions:", sess[0].n);
