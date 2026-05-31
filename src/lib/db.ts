import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// SECURITY: Server-side only. Never import in client components.

let _initialized = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
let _sql: NeonQueryFunction<false, false> | null = null;

function init() {
  if (_initialized) return;
  const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
  if (!dbUrl) throw new Error("DATABASE_URL is not set");
  _sql = neon(dbUrl);
  _db = drizzle(_sql, { schema });
  _initialized = true;
}

// db — lazy drizzle instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_, prop) {
    init();
    return _db[prop];
  },
});

// sql — must behave EXACTLY like the neon sql function including:
//   1. sql`query ${value}` → tagged template (returns Promise)
//   2. sql`fragment` inside another sql`...` → returns NeonQueryFragment
//   3. sql.transaction(), sql.unsafe() etc → property access
//
// We use a Proxy on a real function so all three work correctly.
// The key: we proxy the FUNCTION itself so `apply` handles tagged templates,
// and `get` forwards all property access to the real neon sql.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: NeonQueryFunction<false, false> = new Proxy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((...args: any[]) => {
    init();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_sql as any)(...args);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
  {
    // Property access: sql.transaction, sql.unsafe, etc.
    get(_target, prop, receiver) {
      init();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (_sql as any)[prop];
      if (typeof val === "function") return val.bind(_sql);
      return val;
    },
    // Function call: sql`...` tagged template
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apply(_target, _thisArg, args: any[]) {
      init();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (_sql as any)(...args);
    },
  }
);
