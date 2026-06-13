/**
 * One-off, idempotent cleanup:
 *  1) Fill + activate the 5 staff accounts (full names; fix linmany→limmany).
 *  2) Reassign content owned by the 2 blocked accounts to srievi (id 2):
 *        - topics.created_by  (user 8 → 2)
 *        - classes.teacher_id (user 18 → 2)
 *  3) Delete the 2 blocked accounts (8, 18). Remaining FKs are CASCADE/SET NULL.
 *
 * A full backup was taken before running (backups/<ts>/).
 * Run: node scripts/cleanup-staff-and-blocked.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const SRIEVI_ID = 2;
const DELETE_IDS = [8, 18];

// Full names for the 5 staff (family name first, as provided).
const STAFF = [
    { id: 3, username: "danaiyinstaff", email: "danaiyinstaff@kwd.tech", name: "YIN DANAI" },
    { id: 4, username: "chanthakanikastaff", email: "chanthakanikastaff@kwd.tech", name: "CHANTHA KANIKA" },
    { id: 5, username: "rozaneunstaff", email: "rozaneunstaff@kwd.tech", name: "ROZA NEUN" },
    { id: 6, username: "limmanystaff", email: "limmanystaff@kwd.tech", name: "LIM MANY" },
    { id: 7, username: "sunrunamarastaff", email: "sunrunamarastaff@kwd.tech", name: "SUN RUNAMARA" },
];

async function main() {
    console.log("→ 1. Fill + activate staff accounts");
    for (const s of STAFF) {
        await sql`
      UPDATE users
      SET display_name = ${s.name},
          username     = ${s.username},
          email        = ${s.email},
          role         = 'staff',
          is_active    = true,
          is_suspended = false,
          updated_at   = now()
      WHERE id = ${s.id}`;
        console.log(`   #${s.id} → ${s.username} (${s.name})`);
    }

    console.log("\n→ 2. Reassign blocked accounts' content to srievi (id 2)");
    const t = await sql`UPDATE topics SET created_by = ${SRIEVI_ID} WHERE created_by = 8 RETURNING id`;
    console.log(`   topics reassigned 8 → ${SRIEVI_ID}: ${t.length}`);
    const c = await sql`UPDATE classes SET teacher_id = ${SRIEVI_ID} WHERE teacher_id = 18 RETURNING id`;
    console.log(`   classes reassigned 18 → ${SRIEVI_ID}: ${c.length}`);

    console.log("\n→ 3. Delete blocked accounts");
    for (const id of DELETE_IDS) {
        const del = await sql`DELETE FROM users WHERE id = ${id} RETURNING id, username`;
        if (del.length) console.log(`   deleted #${del[0].id} ${del[0].username}`);
        else console.log(`   #${id} not found (already deleted)`);
    }

    console.log("\n→ Final user list:");
    const users = await sql`SELECT id, username, display_name, email, role, is_active FROM users ORDER BY id`;
    users.forEach((u) => console.log(`   ${u.id}\t${u.username}\t${u.display_name ?? "—"}\t${u.role}\t${u.is_active}`));
    console.log("\n✅ Cleanup complete.");
}

main().then(() => process.exit(0)).catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
