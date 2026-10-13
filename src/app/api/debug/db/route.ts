import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
    if (!dbUrl) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl);

    // Test basic query
    const r1 = await sql`SELECT 1 as ok`;
    // Test topics table exists
    const r2 = await sql`SELECT COUNT(*)::int as c FROM topics`;
    // Test nested sql fragment
    const userId = 1;
    const r3 = await sql`SELECT id FROM topics WHERE 1=1 ${sql`AND id > 0`} LIMIT 1`;

    return NextResponse.json({
      ok: true,
      basic: r1[0],
      topicsCount: r2[0].c,
      nestedSql: r3.length >= 0 ? "works" : "empty",
    });
  } catch (e: unknown) {
    return NextResponse.json({
      ok: false,
      error: "Database check failed",
    }, { status: 500 });
  }
}
