import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// SECURITY: This module is server-side only. Never import in client components.
// Strip surrounding quotes in case the env var was stored with them (e.g. in Vercel).
const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
export { sql };
