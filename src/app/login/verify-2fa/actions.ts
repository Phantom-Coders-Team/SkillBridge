"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { get2faPendingSession, createSession, destroy2faPendingSession } from "@/lib/auth";
import { verifyTotpToken, verifyAndConsumeBackupCode } from "@/lib/totp";
import type { Role } from "@/lib/types";

export interface Verify2faState {
  error?: string;
}

export async function verify2faAction(_prevState: Verify2faState | null, formData: FormData): Promise<Verify2faState> {
  const pendingUser = await get2faPendingSession();
  if (!pendingUser) {
    redirect("/login");
  }

  const code = String(formData.get("code") || "").trim();
  if (!code) {
    return { error: "Please enter your 6-digit verification code or backup code." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: pendingUser.sub },
    select: { id: true, name: true, email: true, role: true, twoFactorSecret: true, twoFactorBackupCodes: true, twoFactorEnabled: true },
  });

  if (!dbUser || !dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
    await destroy2faPendingSession();
    redirect("/login");
  }

  let isValid = false;

  // 1. Try TOTP 6-digit verification
  if (code.length === 6 && /^\d+$/.test(code)) {
    isValid = verifyTotpToken(code, dbUser.twoFactorSecret);
  }

  // 2. If TOTP invalid or code is 8-character backup code, check backup codes
  if (!isValid) {
    const backupCheck = verifyAndConsumeBackupCode(code, dbUser.twoFactorBackupCodes);
    if (backupCheck.valid) {
      isValid = true;
      // Save remaining backup codes
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { twoFactorBackupCodes: backupCheck.remainingHashedJson },
      });
    }
  }

  if (!isValid) {
    return { error: "Invalid verification code. Please check your authenticator app or backup code." };
  }

  // Verification succeeded -> create full user session
  await createSession({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as Role,
  });

  redirect("/dashboard");
}

export async function cancel2faAction(): Promise<void> {
  await destroy2faPendingSession();
  redirect("/login");
}
