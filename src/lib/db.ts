import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// SECURITY: Server-side only. Never import in client components.
// Lazy init — DATABASE_URL only required at runtime, not build time.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
let _sql: NeonQueryFunction<false, false> | null = null;

function init() {
  if (_db) return;
  const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
  if (!dbUrl) throw new Error("DATABASE_URL is not set");
  _sql = neon(dbUrl);
  _db = drizzle(_sql, { schema });
}

// db proxy — works for all drizzle ORM calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_, prop) {
    init();
    return _db[prop];
  },
});

// sql — full proxy that behaves exactly like the neon sql function
// Supports: sql`query`, sql`nested ${sql`sub`}`, and all neon sql properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: NeonQueryFunction<false, false> = new Proxy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function sqlProxy(...args: any[]) {
    init();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_sql as any)(...args);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    get(_, prop) {
      init();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (_sql as any)[prop];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apply(_, thisArg, args: any[]) {
      init();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (_sql as any).apply(thisArg, args);
    },
  }
);
