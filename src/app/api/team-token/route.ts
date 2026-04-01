/**
 * Generates a short-lived signed token for team member QR codes.
 * Token expires in 3 minutes. No auth required — public endpoint.
 */
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "kwd-fallback-secret"
);

// GET /api/team-token?id=VSID-2026-001
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const token = await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3m")
    .sign(secret);

  return NextResponse.json({ token });
}

// POST /api/team-token — verify token
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ valid: true, id: payload.id });
  } catch {
    return NextResponse.json({ valid: false, error: "Token expired or invalid" }, { status: 401 });
  }
}
