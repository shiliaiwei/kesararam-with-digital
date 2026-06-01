import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("inviteCode");
  const schoolName = searchParams.get("schoolName");
  const province = searchParams.get("province");
  const gradeLevel = searchParams.get("gradeLevel");
  const section = searchParams.get("section");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kesararamwithdigital.tech";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "Google Client ID is not configured on this server." }, { status: 500 });
  }

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("prompt", "select_account");

  // Pack credentials inside base64url encoded state parameter
  let state = "login";
  if (code) {
    const stateObj = { code, schoolName, province, gradeLevel, section };
    state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");
  }
  googleUrl.searchParams.set("state", state);

  return NextResponse.redirect(googleUrl.toString());
}
