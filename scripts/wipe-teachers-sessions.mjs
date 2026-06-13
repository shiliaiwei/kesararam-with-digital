/**
 * Fresh start: delete all sessions and all teacher accounts.
 * Teacher-owned classes block deletion (classes.teacher_id), so we clear each
 * teacher's classes (and their enrollments) first. Backup taken beforehand.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

// 1. Wipe all sessions
const s = await sql`DELETE FROM sessions RETURNING id`;
console.log(`Sessions deleted: ${s.length}`);

// 2. Find teachers
const teachers = await sql`SELECT id, username FROM users WHERE role = 'teacher'`;
console.log(`Teachers to remove: ${teachers.length}`);

for (const t of teachers) {
    const classes = await sql`SELECT id FROM classes WHERE teacher_id = ${t.id}`;
    for (const c of classes) {
        await sql`DELETE FROM class_enrollments WHERE class_id = ${c.id}`;
        await sql`DELETE FROM invite_codes WHERE class_id = ${c.id}`;
        await sql`DELETE FROM classes WHERE id = ${c.id}`;
    }
    await sql`DELETE FROM invite_codes WHERE teacher_id = ${t.id}`;
    const del = await sql`DELETE FROM users WHERE id = ${t.id} RETURNING id, username`;
    if (del.length) console.log(`  deleted teacher #${del[0].id} ${del[0].username} (classes: ${classes.length})`);
}

const remaining = await sql`SELECT id, username, role FROM users ORDER BY id`;
console.log("\nRemaining users:");
remaining.forEach((u) => console.log(`  ${u.id}\t${u.username}\t${u.role}`));
console.log("\nDone — fresh start.");
