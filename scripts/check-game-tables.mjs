import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const tables = await sql`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name
`;

console.log("All tables in DB:");
tables.forEach(t => console.log(" -", t.table_name));

const gameTables = tables.filter(t => t.table_name.startsWith("game"));
console.log("\nGame tables:", gameTables.length ? gameTables.map(t => t.table_name) : "NONE - migration not run!");
