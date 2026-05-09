/**
 * Short-code token system for team member QR codes.
 * Generates a 6-char alphanumeric code that maps to a member ID.
 * Expires in 60 seconds. Short URL = easy QR scanning.
 */
import { NextRequest, NextResponse } from "next/server";

const TTL = 60 * 1000; // 1 minute

// In-memory store: code → { id, expiresAt }
const store = new Map<string, { id: string; expiresAt: number }>();

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function cleanup() {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt < now) store.delete(k);
  }
}

// GET /api/team-token?id=VSID-2026-001 — generate short code
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  cleanup();

  let code = randomCode();
  // Ensure uniqueness
  while (store.has(code)) code = randomCode();

  store.set(code, { id, expiresAt: Date.now() + TTL });

  return NextResponse.json({ code });
}

// POST /api/team-token — verify short code
export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ valid: false }, { status: 400 });

  cleanup();

  const entry = store.get(code);
  if (!entry) return NextResponse.json({ valid: false, error: "expired" }, { status: 401 });

  // One-time use — delete after verify
  store.delete(code);

  return NextResponse.json({ valid: true, id: entry.id });
}
