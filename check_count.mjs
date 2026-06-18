import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
const envContent = readFileSync('.env.local', 'utf-8');
let DATABASE_URL = '';
for (const line of envContent.split('\n')) {
    const m = line.match(/^DATABASE_URL='?([^']+)'?/);
    if (m) { DATABASE_URL = m[1]; break; }
}
const sql = neon(DATABASE_URL);
const [q] = await sql`SELECT COUNT(*) AS cnt FROM questions`;
const [a] = await sql`SELECT COUNT(*) AS cnt FROM answers`;
console.log(`questions: ${q.cnt}  |  answers: ${a.cnt}`);
