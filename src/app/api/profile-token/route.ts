import { NextRequest, NextResponse } from "next/server";
import { generateProfileToken } from "@/lib/signed-profile-url";

const ALLOWED_MEMBER_IDS = [
  "shiliaiwei", "roza-neun", "lin-many",
  "chantha-kanika", "piseth-pheap", "sun-runamara", "danai-yin",
];

export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("memberId");
  const imageUrl = req.nextUrl.searchParams.get("imageUrl");

  if (!memberId || !imageUrl) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (!ALLOWED_MEMBER_IDS.includes(memberId)) {
    return NextResponse.json({ error: "Unknown member" }, { status: 403 });
  }

  const token = await generateProfileToken(memberId, imageUrl);
  return NextResponse.json({ token, expiresIn: 60 });
}
