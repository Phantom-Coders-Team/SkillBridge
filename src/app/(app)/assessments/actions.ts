"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitAssessmentAction(data: {
  skillName: string;
  score: number;
  decayStatus?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if an assessment for this skill already exists for this student
    const existing = await prisma.skillAssessment.findFirst({
      where: {
        studentId: user.id,
        skillName: data.skillName,
      },
    });

    if (existing) {
      await prisma.skillAssessment.update({
        where: { id: existing.id },
        data: {
          score: Math.max(0, Math.min(100, data.score)),
          decayStatus: data.decayStatus || "ACTIVE",
          verifiedAt: new Date(),
          lastAssessedAt: new Date(),
        },
      });
    } else {
      await prisma.skillAssessment.create({
        data: {
          studentId: user.id,
          skillName: data.skillName,
          score: Math.max(0, Math.min(100, data.score)),
          decayStatus: data.decayStatus || "ACTIVE",
          verifiedAt: new Date(),
          lastAssessedAt: new Date(),
        },
      });
    }

    // Award tokens for passing skill assessment
    if (data.score >= 50) {
      let ledger = await prisma.tokenLedger.findFirst({
        where: { studentId: user.id },
      });
      if (!ledger) {
        ledger = await prisma.tokenLedger.create({
          data: { studentId: user.id, balance: 100 },
        });
      }
      const tokenReward = 30;
      await prisma.tokenLedger.update({
        where: { id: ledger.id },
        data: { balance: { increment: tokenReward } },
      });
      await prisma.tokenTransaction.create({
        data: {
          ledgerId: ledger.id,
          amount: tokenReward,
          type: "CREDIT",
          reason: `Passed Skill Assessment · ${data.skillName} (${data.score}%)`,
        },
      });
    }

    revalidatePath("/assessments");
    revalidatePath("/dashboard");
    revalidatePath("/tokens");
    revalidatePath("/internships");
    revalidatePath("/portfolio");

    return { success: true };
  } catch (err: any) {
    console.error("Submit assessment error:", err);
    return { success: false, error: err.message || "Failed to record assessment" };
  }
}
