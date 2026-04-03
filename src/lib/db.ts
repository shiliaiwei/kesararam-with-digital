import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// SECURITY: Server-side only. Never import in client components.
// Uses lazy init so DATABASE_URL is only required at runtime, not build time.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sql: any = null;

function init() {
  if (_db) return;
  const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
  if (!dbUrl) throw new Error("DATABASE_URL is not set");
  _sql = neon(dbUrl);
  _db = drizzle(_sql, { schema });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_, prop) { init(); return _db[prop]; },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: ReturnType<typeof neon> = new Proxy((() => {}) as any, {
  get(_, prop) { init(); return _sql[prop]; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(_, thisArg, args: any[]) { init(); return _sql(...args); },
});
