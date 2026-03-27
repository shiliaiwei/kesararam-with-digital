import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

const rows = await sql`
  SELECT t.id, t.topic_code, t.name_en, t.category_id, c.title_en as cat,
    (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as q_count
  FROM topics t
  JOIN categories c ON t.category_id = c.id
  ORDER BY t.category_id, t.id
`;

rows.forEach(r => {
  console.log(`cat${r.category_id} ${r.cat?.substring(0,18).padEnd(18)} | id:${r.id} ${r.topic_code?.padEnd(10)} ${r.name_en?.substring(0,35).padEnd(35)} | Q:${r.q_count}`);
});

await sql.end();
