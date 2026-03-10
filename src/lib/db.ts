import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// SECURITY: This module is server-side only. Never import in client components.
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
export { sql };
