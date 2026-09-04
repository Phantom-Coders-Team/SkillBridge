import "server-only";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

const ISSUER_NAME = "SkillBridge Portal";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function generateOtpauthUrl(email: string, secret: string): string {
  return generateURI({
    issuer: ISSUER_NAME,
    label: email,
    secret,
  });
}

export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTotpToken(token: string, secret: string): boolean {
  const sanitized = token.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(sanitized)) {
    return false;
  }
  try {
    const result = verifySync({
      token: sanitized,
      secret,
      epochTolerance: 30, // 30s window before/after for time drift
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. 8F2A9D1C
    codes.push(code);
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function verifyAndConsumeBackupCode(inputCode: string, hashedCodesJson: string | null): { valid: boolean; remainingHashedJson: string | null } {
  if (!hashedCodesJson) return { valid: false, remainingHashedJson: null };
  try {
    const hashedCodes: string[] = JSON.parse(hashedCodesJson);
    const inputHash = hashBackupCode(inputCode);
    const index = hashedCodes.indexOf(inputHash);
    if (index === -1) {
      return { valid: false, remainingHashedJson: hashedCodesJson };
    }
    // Remove consumed backup code
    hashedCodes.splice(index, 1);
    return { valid: true, remainingHashedJson: JSON.stringify(hashedCodes) };
  } catch {
    return { valid: false, remainingHashedJson: hashedCodesJson };
  }
}
