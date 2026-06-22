import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS road_markings (
      id          SERIAL PRIMARY KEY,
      category    TEXT NOT NULL,
      name_en     TEXT NOT NULL,
      name_km     TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      description_km TEXT NOT NULL DEFAULT '',
      image_url   TEXT,
      color_code  TEXT,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_by  INTEGER REFERENCES users(id),
      created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("road_markings table created (or already exists).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
