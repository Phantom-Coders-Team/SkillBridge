"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  generateTotpSecret,
  generateOtpauthUrl,
  generateQrCodeDataUrl,
  verifyTotpToken,
  generateBackupCodes,
  hashBackupCode,
} from "@/lib/totp";

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
}

export async function getTwoFactorStatusAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true },
  });

  return { twoFactorEnabled: dbUser?.twoFactorEnabled ?? false };
}

export async function initTwoFactorSetupAction(): Promise<TwoFactorSetupData> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const secret = generateTotpSecret();
  const otpauthUrl = generateOtpauthUrl(user.email, secret);
  const qrCodeUrl = await generateQrCodeDataUrl(otpauthUrl);

  return {
    secret,
    qrCodeUrl,
    otpauthUrl,
  };
}

export async function confirmAndEnableTwoFactorAction(secret: string, token: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const isValid = verifyTotpToken(token, secret);
  if (!isValid) {
    return { success: false, error: "Invalid verification code. Please make sure your device clock is synced and try again." };
  }

  // Generate 8 backup codes
  const plainBackupCodes = generateBackupCodes(8);
  const hashedBackupCodes = plainBackupCodes.map(hashBackupCode);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
    },
  });

  return {
    success: true,
    backupCodes: plainBackupCodes,
  };
}

export async function disableTwoFactorAction(tokenOrCode: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorSecret: true },
  });

  if (dbUser?.twoFactorSecret) {
    const isValid = verifyTotpToken(tokenOrCode, dbUser.twoFactorSecret);
    if (!isValid) {
      return { success: false, error: "Invalid verification code." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
      twoFactorBackupCodes: null,
    },
  });

  return { success: true };
}
