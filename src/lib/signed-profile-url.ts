import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.PROFILE_TOKEN_SECRET ?? process.env.JWT_SECRET ?? "kwd-profile-token-fallback-2026"
);

export interface ProfileTokenPayload {
  memberId: string;
  imageUrl: string;
}

export async function generateProfileToken(
  memberId: string,
  imageUrl: string
): Promise<string> {
  return new SignJWT({ memberId, imageUrl })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
}

export async function verifyProfileToken(
  token: string
): Promise<ProfileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as ProfileTokenPayload;
  } catch {
    return null;
  }
}
