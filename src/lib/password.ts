/**
 * Password hashing — salted scrypt (Node built-in, no extra dependency).
 *
 * Stored format is self-describing:  "scrypt$<N>$<saltHex>$<hashHex>"
 *
 * Legacy accounts were stored as unsalted SHA-256 hex (fast, brute-forceable).
 * verifyPassword() still accepts those and returns needsUpgrade=true so the
 * caller can transparently re-hash to scrypt on the next successful login.
 */
import { scryptSync, randomBytes, timingSafeEqual, createHash } from "crypto";

const PREFIX = "scrypt$";
const N = 16384; // CPU/memory cost (2^14) — ~16 MiB, well under the 32 MiB default
const R = 8;
const P = 1;
const KEYLEN = 64;

/** Produce a fresh salted scrypt hash for a plaintext password. */
export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, KEYLEN, { N, r: R, p: P }).toString("hex");
  return `${PREFIX}${N}$${salt}$${hash}`;
}

const legacySha256 = (pw: string) => createHash("sha256").update(pw).digest("hex");

/**
 * Verify a plaintext password against a stored hash. Supports both the scrypt
 * format and legacy unsalted SHA-256 hex.
 *
 * @returns valid — does the password match?
 *          needsUpgrade — true when a legacy hash matched; the caller should
 *          re-hash with hashPassword() and persist it.
 */
export function verifyPassword(
  pw: string,
  stored: string | null | undefined,
): { valid: boolean; needsUpgrade: boolean } {
  if (!stored) return { valid: false, needsUpgrade: false };

  if (stored.startsWith(PREFIX)) {
    const [, costStr, salt, hashHex] = stored.split("$"); // ["scrypt", N, salt, hash]
    const cost = Number(costStr);
    if (!cost || !salt || !hashHex) return { valid: false, needsUpgrade: false };
    const expected = Buffer.from(hashHex, "hex");
    let valid = false;
    try {
      const actual = scryptSync(pw, salt, expected.length, { N: cost, r: R, p: P });
      valid = expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
      valid = false;
    }
    return { valid, needsUpgrade: false };
  }

  // Legacy unsalted SHA-256 hex.
  const expected = Buffer.from(stored, "utf8");
  const actual = Buffer.from(legacySha256(pw), "utf8");
  const valid = expected.length === actual.length && timingSafeEqual(expected, actual);
  return { valid, needsUpgrade: valid };
}
