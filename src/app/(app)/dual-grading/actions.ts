"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, normalizeRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitGrading(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required." };

  const role = normalizeRole(user.role);
  if (role !== "ACADEMICIAN" && role !== "INDUSTRY") {
    return { error: "Only academicians and industry partners can submit evaluations." };
  }

  const gradingId = formData.get("gradingId") as string | null;
  const remarks = formData.get("remarks") as string | null;

  if (!gradingId) return { error: "Grading record is required." };

  const grading = await prisma.dualGrading.findUnique({
    where: { id: gradingId },
    include: {
      labUnit: {
        include: {
          members: true,
        },
      },
    },
  });
  if (!grading) return { error: "Grading record not found." };

  if (role === "ACADEMICIAN") {
    const marksRaw = formData.get("academicMarks") as string | null;
    if (!marksRaw) return { error: "Academic marks are required." };
    const academicMarks = parseInt(marksRaw, 10);
    if (isNaN(academicMarks) || academicMarks < 0 || academicMarks > 100) {
      return { error: "Academic marks must be between 0 and 100." };
    }

    await prisma.dualGrading.update({
      where: { id: gradingId },
      data: {
        academicMarks,
        facultyRemarks: remarks || null,
        gradedByFacultyId: user.id,
        submittedAt: grading.submittedAt ?? new Date(),
      },
    });
  } else if (role === "INDUSTRY") {
    const scoreRaw = formData.get("jobReadinessScore") as string | null;
    if (!scoreRaw) return { error: "Job readiness score is required." };
    const jobReadinessScore = parseInt(scoreRaw, 10);
    if (isNaN(jobReadinessScore) || jobReadinessScore < 0 || jobReadinessScore > 100) {
      return { error: "Job readiness score must be between 0 and 100." };
    }

    await prisma.dualGrading.update({
      where: { id: gradingId },
      data: {
        jobReadinessScore,
        industryRemarks: remarks || null,
        gradedByIndustryId: user.id,
        submittedAt: grading.submittedAt ?? new Date(),
      },
    });
  }

  revalidatePath("/dual-grading");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createGradingRecord(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required." };

  const role = normalizeRole(user.role);
  if (role !== "ACADEMICIAN" && role !== "INDUSTRY" && role !== "INSTITUTION") {
    return { error: "Unauthorized." };
  }

  const challengeId = formData.get("challengeId") as string | null;
  const labUnitId = formData.get("labUnitId") as string | null;

  if (!challengeId || !labUnitId) {
    return { error: "Please select both an Industry Challenge and a Student Lab Unit." };
  }

  const existing = await prisma.dualGrading.findUnique({
    where: {
      challengeId_labUnitId: { challengeId, labUnitId },
    },
  });

  if (existing) {
    return { error: "A Dual Grading record already exists for this challenge and lab unit pairing." };
  }

  try {
    await prisma.dualGrading.create({
      data: { challengeId, labUnitId },
    });

    revalidatePath("/dual-grading");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to create dual grading record." };
  }
}
