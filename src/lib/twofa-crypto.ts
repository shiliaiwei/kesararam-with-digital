/**
 * Symmetric encryption for TOTP secrets at rest.
 *
 * WHY: the TOTP secret is the "master key" to a user's 6-digit codes. If your DB
 * leaks and secrets are plaintext, an attacker can generate valid codes forever.
 * So we encrypt each secret with AES-256-GCM using a key kept in env (NOT the DB).
 * GCM also authenticates the ciphertext (tamper-evident) via its auth tag.
 *
 * Stored format: "<ivHex>:<authTagHex>:<cipherHex>"
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer {
  const hex = process.env.TWOFA_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TWOFA_ENCRYPTION_KEY must be a 32-byte hex string (64 chars)");
  }
  return Buffer.from(hex, "hex");
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12); // 96-bit nonce, recommended for GCM
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(stored: string): string {
  const [ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted secret");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
