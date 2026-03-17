import { NextRequest, NextResponse } from "next/server";
import { verifyProfileToken } from "@/lib/signed-profile-url";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
  }

  const payload = await verifyProfileToken(token);

  if (!payload) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, memberId: payload.memberId });
}
