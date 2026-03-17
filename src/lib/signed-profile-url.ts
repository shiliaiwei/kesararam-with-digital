import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.PROFILE_TOKEN_SECRET ?? "kwd-technovation-2026-secret-key"
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
