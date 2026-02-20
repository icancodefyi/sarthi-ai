import { createHash } from "crypto";

/**
 * Generates a deterministic SHA-256 hash from the given data object.
 * Used for tamper-detection on certified reports.
 */
export function generateIntegrityHash(data: Record<string, unknown>): string {
  const canonical = JSON.stringify(data, Object.keys(data).sort());
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Recalculate hash from report snapshot fields to verify integrity.
 * Returns true if hash matches (untampered), false if tampered.
 */
export function verifyIntegrityHash(
  data: Record<string, unknown>,
  storedHash: string
): boolean {
  return generateIntegrityHash(data) === storedHash;
}
