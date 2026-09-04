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
    const normalizedScore = Math.max(0, Math.min(100, Math.round(data.score)));
    const isPassed = normalizedScore >= 60;
    const finalDecayStatus = data.decayStatus || (isPassed ? "ACTIVE" : "STALE");

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
          score: normalizedScore,
          decayStatus: finalDecayStatus,
          verifiedAt: isPassed ? new Date() : existing.verifiedAt,
          lastAssessedAt: new Date(),
        },
      });
    } else {
      await prisma.skillAssessment.create({
        data: {
          studentId: user.id,
          skillName: data.skillName,
          score: normalizedScore,
          decayStatus: finalDecayStatus,
          verifiedAt: isPassed ? new Date() : null,
          lastAssessedAt: new Date(),
        },
      });
    }

    // If candidate passed the assessment, sync this skill into student's profile for matching
    if (isPassed && user.role === "STUDENT") {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        const currentSkills = profile.skills
          ? profile.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const skillAlreadyPresent = currentSkills.some(
          (s) => s.toLowerCase() === data.skillName.toLowerCase()
        );

        if (!skillAlreadyPresent) {
          const updatedSkills = [...currentSkills, data.skillName].join(", ");
          await prisma.profile.update({
            where: { userId: user.id },
            data: { skills: updatedSkills },
          });
        }
      }
    }

    revalidatePath("/assessments");
    revalidatePath("/dashboard");
    revalidatePath("/internships");
    revalidatePath("/portfolio");
    revalidatePath("/skills");
    revalidatePath("/reverse-placement");

    return { success: true };
  } catch (err: any) {
    console.error("Submit assessment error:", err);
    return { success: false, error: err.message || "Failed to record assessment" };
  }
}
