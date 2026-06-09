import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { generateSecret, generateURI, verify } from "otplib";

const ENCRYPTION_VERSION = "v1";
const RECOVERY_CODE_BYTES = 9;
const RECOVERY_CODE_COUNT = 10;

function getBaseSecret() {
  const secret =
    process.env.TWO_FACTOR_SECRET_KEY ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "Missing TWO_FACTOR_SECRET_KEY, AUTH_SECRET, or NEXTAUTH_SECRET.",
    );
  }

  return secret;
}

function getEncryptionKey() {
  return createHash("sha256")
    .update(`two-factor-encryption:${getBaseSecret()}`)
    .digest();
}

function getHashKey() {
  return createHash("sha256")
    .update(`two-factor-recovery:${getBaseSecret()}`)
    .digest();
}

export function encryptTwoFactorSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptTwoFactorSecret(encryptedSecret: string) {
  const [version, encodedIv, encodedTag, encodedCiphertext] =
    encryptedSecret.split(":");

  if (
    version !== ENCRYPTION_VERSION ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext
  ) {
    throw new Error("Invalid encrypted two-factor secret.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function generateTwoFactorSecret() {
  return generateSecret();
}

export function getTwoFactorOtpAuthUrl(email: string, secret: string) {
  return generateURI({
    issuer: "Kaimono",
    label: email,
    secret,
  });
}

export function normalizeTotpCode(code: string) {
  return code.replace(/\s/g, "");
}

export function isTotpCode(code: string) {
  return /^\d{6}$/.test(normalizeTotpCode(code));
}

export async function verifyTotpCode(secret: string, code: string) {
  const normalized = normalizeTotpCode(code);
  if (!isTotpCode(normalized)) return false;

  const result = await verify({
    secret,
    token: normalized,
    epochTolerance: 30,
  });

  return result.valid;
}

export function normalizeRecoveryCode(code: string) {
  return code.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function formatRecoveryCode(code: string) {
  const normalized = normalizeRecoveryCode(code);
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}`;
}

export function generateRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    formatRecoveryCode(randomBytes(RECOVERY_CODE_BYTES).toString("base64url")),
  );
}

export function hashRecoveryCode(userId: string, code: string) {
  const normalized = normalizeRecoveryCode(code);

  return createHmac("sha256", getHashKey())
    .update(`${userId}:${normalized}`)
    .digest("hex");
}

export function recoveryCodeMatches(
  userId: string,
  code: string,
  expectedHash: string,
) {
  const actual = Buffer.from(hashRecoveryCode(userId, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
