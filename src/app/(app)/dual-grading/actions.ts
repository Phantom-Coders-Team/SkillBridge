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
  if (role !== "ACADEMICIAN" && role !== "INDUSTRY" && role !== "INSTITUTION") {
    return { error: "Only academicians, industry partners, and institutions can submit or edit evaluations." };
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

  if (role === "ACADEMICIAN" || (role === "INSTITUTION" && formData.has("academicMarks"))) {
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
        facultyRemarks: remarks !== null ? remarks : grading.facultyRemarks,
        gradedByFacultyId: user.id,
        submittedAt: grading.submittedAt ?? new Date(),
      },
    });
  }

  if (role === "INDUSTRY" || (role === "INSTITUTION" && formData.has("jobReadinessScore"))) {
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
        industryRemarks: remarks !== null ? remarks : grading.industryRemarks,
        gradedByIndustryId: user.id,
        submittedAt: grading.submittedAt ?? new Date(),
      },
    });
  }

  revalidatePath("/dual-grading");
  revalidatePath("/dashboard");
  revalidatePath("/reverse-placement");
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
    return { error: "A Joint Evaluation record already exists for this challenge and lab unit pairing." };
  }

  try {
    await prisma.dualGrading.create({
      data: { challengeId, labUnitId },
    });

    revalidatePath("/dual-grading");
    revalidatePath("/dashboard");
    revalidatePath("/reverse-placement");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to create joint evaluation record." };
  }
}

export async function updateGradingSession(
  gradingId: string,
  challengeId: string,
  labUnitId: string,
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required." };

  const role = normalizeRole(user.role);
  if (role !== "ACADEMICIAN" && role !== "INDUSTRY" && role !== "INSTITUTION") {
    return { error: "Only faculty, industry mentors, and institution administrators can modify evaluation sessions." };
  }

  if (!gradingId || !challengeId || !labUnitId) {
    return { error: "All fields are required." };
  }

  try {
    const conflict = await prisma.dualGrading.findFirst({
      where: {
        challengeId,
        labUnitId,
        id: { not: gradingId },
      },
    });

    if (conflict) {
      return { error: "Another Joint Evaluation session already exists for this challenge and lab unit pairing." };
    }

    await prisma.dualGrading.update({
      where: { id: gradingId },
      data: { challengeId, labUnitId },
    });

    revalidatePath("/dual-grading");
    revalidatePath("/dashboard");
    revalidatePath("/reverse-placement");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to update joint evaluation session." };
  }
}

export async function deleteGradingRecord(
  gradingId: string,
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required." };

  const role = normalizeRole(user.role);
  if (role !== "ACADEMICIAN" && role !== "INDUSTRY" && role !== "INSTITUTION") {
    return { error: "Only faculty, industry partners, or institution administrators can delete evaluations." };
  }

  if (!gradingId) return { error: "Grading record ID is required." };

  try {
    await prisma.dualGrading.delete({
      where: { id: gradingId },
    });

    revalidatePath("/dual-grading");
    revalidatePath("/dashboard");
    revalidatePath("/reverse-placement");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to delete joint evaluation record." };
  }
}
