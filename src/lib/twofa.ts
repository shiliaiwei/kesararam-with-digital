/**
 * 2FA core: TOTP (authenticator app), one-time backup codes, and the
 * short-lived "password OK, awaiting code" token used between the two
 * login steps.
 */
import * as OTPAuth from "otpauth";
import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const ISSUER = "KWD";

function buildTotp(secretBase32: string, accountEmail = "user"): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountEmail,
    algorithm: "SHA1", // RFC 6238 default; what authenticator apps expect
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

/* ── TOTP ─────────────────────────────────────────────────────── */

/** Fresh base32 secret to store (encrypted) for a user. */
export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32; // 160-bit, RFC-recommended
}

/** otpauth:// URL encoded into the enrollment QR code. */
export function otpauthUrl(accountEmail: string, secret: string): string {
  return buildTotp(secret, accountEmail).toString();
}

/** True if the 6-digit code matches the secret (±1 time step ≈ ±30s). */
export function verifyTotp(token: string, secret: string): boolean {
  const clean = (token || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  try {
    // validate() returns the time-step delta (incl. 0) on match, or null on miss.
    return buildTotp(secret).validate({ token: clean, window: 1 }) !== null;
  } catch {
    return false;
  }
}

/* ── Backup codes ─────────────────────────────────────────────── */
// Shown ONCE at enrollment; stored only as hashes. Each works a single time.

const hashCode = (code: string) =>
  createHash("sha256").update(code.replace(/[\s-]/g, "").toLowerCase()).digest("hex");

/** Returns the plaintext codes (to show once) + their hashes (to store). */
export function generateBackupCodes(count = 8): { plain: string[]; hashes: string[] } {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(4).toString("hex"); // 8 hex chars
    plain.push(`${raw.slice(0, 4)}-${raw.slice(4)}`); // e.g. "1a2b-3c4d"
  }
  return { plain, hashes: plain.map(hashCode) };
}

export const serializeBackupCodes = (hashes: string[]) => JSON.stringify(hashes);

/**
 * Verify a backup code against the stored JSON. On success returns the new
 * JSON with that code consumed (removed). On failure returns null.
 */
export function consumeBackupCode(
  storedJson: string | null,
  input: string,
): { remainingJson: string } | null {
  if (!storedJson) return null;
  let hashes: string[];
  try {
    hashes = JSON.parse(storedJson);
  } catch {
    return null;
  }
  const h = hashCode(input);
  const idx = hashes.indexOf(h);
  if (idx === -1) return null;
  hashes.splice(idx, 1);
  return { remainingJson: JSON.stringify(hashes) };
}

/* ── Pending-2FA token (between password and code) ────────────── */

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(s);
}

/** Short-lived proof that the password was correct; NOT a full session. */
export async function signPending2fa(userId: number): Promise<string> {
  return new SignJWT({ uid: userId, scope: "2fa_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret());
}

export async function verifyPending2fa(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.scope !== "2fa_pending" || typeof payload.uid !== "number") return null;
    return payload.uid;
  } catch {
    return null;
  }
}
