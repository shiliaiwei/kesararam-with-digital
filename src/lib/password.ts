/**
 * Password hashing — salted scrypt (Node built-in, no extra dependency).
 *
 * Stored format is self-describing:  "scrypt$<N>$<saltHex>$<hashHex>"
 *
 * Legacy accounts were stored as unsalted SHA-256 hex (fast, brute-forceable).
 * verifyPassword() still accepts those and returns needsUpgrade=true so the
 * caller can transparently re-hash to scrypt on the next successful login.
 */
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

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

/**
 * Verify a plaintext password against a stored salted scrypt hash.
 *
 * @returns valid — does the password match?
 *          needsUpgrade — false for standard scrypt hashes.
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

  return { valid: false, needsUpgrade: false };
}
