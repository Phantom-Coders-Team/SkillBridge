"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitGrading(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["ACADEMICIAN", "FACULTY", "INDUSTRIES", "INDUSTRY"]);

  const gradingId = formData.get("gradingId") as string | null;
  const remarks = formData.get("remarks") as string | null;

  if (!gradingId) return { error: "Grading record is required." };

  const grading = await prisma.dualGrading.findUnique({ where: { id: gradingId } });
  if (!grading) return { error: "Grading record not found." };

  if (user.role === "ACADEMICIAN" || user.role === "FACULTY") {
    const marks = formData.get("academicMarks") as string | null;
    if (!marks) return { error: "Academic marks are required." };

    await prisma.dualGrading.update({
      where: { id: gradingId },
      data: {
        academicMarks: parseInt(marks, 10),
        facultyRemarks: remarks || null,
        gradedByFacultyId: user.id,
        submittedAt: grading.submittedAt ?? new Date(),
      },
    });
  } else if (user.role === "INDUSTRIES" || user.role === "INDUSTRY") {
    const score = formData.get("jobReadinessScore") as string | null;
    if (!score) return { error: "Job readiness score is required." };

    await prisma.dualGrading.update({
      where: { id: gradingId },
      data: {
        jobReadinessScore: parseInt(score, 10),
        industryRemarks: remarks || null,
        gradedByIndustryId: user.id,
        submittedAt: grading.submittedAt ?? new Date(),
      },
    });
  }

  revalidatePath("/dual-grading");
  return { success: true };
}

export async function createGradingRecord(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  await requireRole(["ACADEMICIAN", "FACULTY", "INDUSTRIES", "INDUSTRY"]);

  const challengeId = formData.get("challengeId") as string | null;
  const labUnitId = formData.get("labUnitId") as string | null;

  if (!challengeId || !labUnitId) {
    return { error: "Challenge and lab unit are required." };
  }

  try {
    await prisma.dualGrading.create({
      data: { challengeId, labUnitId },
    });

    revalidatePath("/dual-grading");
    return { success: true };
  } catch {
    return { error: "Failed to create grading record." };
  }
}
