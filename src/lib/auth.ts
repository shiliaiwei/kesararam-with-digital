import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "student" | "teacher" | "admin" | "staff";

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  iat?: number;
  exp?: number;
}

function getSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(jwtSecret);
}

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  const expiresIn = payload.role === "student" ? "7d" : "8h";
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("kwd_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getRedirectUrl(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "https://dashboard.kesararamwithdigital.tech/teacher/classes";
    case "admin":
      return "https://dashboard.kesararamwithdigital.tech/admin/users";
    case "staff":
      return "https://dashboard.kesararamwithdigital.tech/staff/content";
    default:
      return "/profile/student";
  }
}
