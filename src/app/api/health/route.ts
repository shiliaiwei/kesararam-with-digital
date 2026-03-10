import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — remove after confirming env vars on Vercel
export async function GET() {
  return NextResponse.json({
    jwt_secret_set: !!process.env.JWT_SECRET,
    database_url_set: !!process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
  });
}
