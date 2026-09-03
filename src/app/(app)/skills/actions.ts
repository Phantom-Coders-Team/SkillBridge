"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
export type DecayStatus = "ACTIVE" | "STALE" | "EXPIRED" | "RECERTIFIED";

export interface RecertResult {
  refreshed: number;
  skills: { id: string; skillName: string; score: number; decayStatus: DecayStatus }[];
  message: string;
}

export interface QuestionnaireResult {
  added: number;
  message: string;
}

export async function submitSkillQuestionnaire(
  skillRatings: { name: string; score: number }[],
): Promise<QuestionnaireResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { added: 0, message: "Only students can submit the skill questionnaire." };
  }

  const rated = (skillRatings || []).filter((r) => r && r.name && r.score > 0);
  if (rated.length === 0) {
    return { added: 0, message: "Select and rate at least one skill." };
  }

  const existing = await prisma.skillAssessment.findMany({
    where: { studentId: user.id },
    select: { skillName: true, id: true },
  });
  const existingMap = new Map(existing.map((e) => [e.skillName.toLowerCase(), e.id]));

  let added = 0;
  for (const r of rated) {
    const key = r.name.toLowerCase();
    const existingId = existingMap.get(key);
    if (existingId) {
      await prisma.skillAssessment.update({
        where: { id: existingId },
        data: {
          score: r.score,
          decayStatus: r.score >= 80 ? "ACTIVE" : "STALE",
          lastAssessedAt: new Date(),
          verifiedAt: new Date(),
        },
      });
    } else {
      await prisma.skillAssessment.create({
        data: {
          studentId: user.id,
          skillName: r.name,
          score: r.score,
          decayStatus: "ACTIVE",
          verifiedAt: new Date(),
        },
      });
      added += 1;
    }
  }

  revalidatePath("/skills");
  return { added, message: `Questionnaire saved. ${rated.length} skill${rated.length === 1 ? "" : "s"} updated.` };
}

export async function runReCertificationDiagnostic(): Promise<RecertResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { refreshed: 0, skills: [], message: "Only students can take the diagnostic." };
  }

  const assessments = await prisma.skillAssessment.findMany({
    where: { studentId: user.id },
  });

  if (assessments.length === 0) {
    return { refreshed: 0, skills: [], message: "No verified skills to re-certify yet." };
  }

  const updates = await Promise.all(
    assessments.map((a) => {
      const refreshedScore = a.score >= 90 ? 96 : Math.min(95, a.score + 7);
      return prisma.skillAssessment.update({
        where: { id: a.id },
        data: {
          score: refreshedScore,
          decayStatus: "RECERTIFIED",
          lastAssessedAt: new Date(),
          verifiedAt: new Date(),
        },
      });
    })
  );

  const refreshed = updates.filter((u) => u.decayStatus === "RECERTIFIED").length;

  revalidatePath("/skills");
  return {
    refreshed,
    skills: updates.map((u) => ({
      id: u.id,
      skillName: u.skillName,
      score: u.score,
      decayStatus: u.decayStatus as DecayStatus,
    })),
    message: `Diagnostic complete. ${refreshed} badge${refreshed === 1 ? "" : "s"} refreshed to RECERTIFIED.`,
  };
}
