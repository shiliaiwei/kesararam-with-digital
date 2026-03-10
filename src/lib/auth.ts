import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "student" | "teacher" | "admin";

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "kwd-fallback-secret",
);

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  const expiresIn = payload.role === "student" ? "7d" : "8h";
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
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
      return "https://dashboard.kesararamwithdigital.tech/teacher/overview";
    case "admin":
      return "https://dashboard.kesararamwithdigital.tech/admin/overview";
    default:
      return "/profile/student";
  }
}
