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

// sql — tagged template literal function
// Must be a real callable function, not a Proxy, for tagged template syntax to work
export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): ReturnType<NeonQueryFunction<false, false>> {
  init();
  return _sql!(strings, ...values);
}

// Allow sql to be used as a namespace for sub-queries (sql`...` inside sql`...`)
// by forwarding property access to the underlying neon sql function
Object.setPrototypeOf(sql, new Proxy(Function.prototype, {
  get(_, prop) {
    init();
    return (_sql as unknown as Record<string | symbol, unknown>)[prop];
  },
}));
