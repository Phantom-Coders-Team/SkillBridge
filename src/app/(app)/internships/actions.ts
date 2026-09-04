"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionState {
  error?: string;
  success?: boolean;
}

type ProgramType = "INTERNSHIP" | "APPRENTICESHIP" | "ENTRY_JOB" | "TRAINING" | "CERTIFICATION" | "WORKSHOP" | "MENTORSHIP";

export async function postOpportunity(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const programType = formData.get("programType") as string | null;
  const skills = formData.get("skills") as string | null;
  const duration = formData.get("duration") as string | null;
  const mode = formData.get("mode") as string | null;
  const certification = formData.get("certification") === "on";

  if (!title || !description || !programType) {
    return { error: "Title, description, and type are required." };
  }

  try {
    await prisma.learningProgram.create({
      data: {
        companyId: user.id,
        title,
        description,
        programType: programType as ProgramType,
        skills: skills || null,
        duration: duration || null,
        mode: mode || null,
        certification,
      },
    });
    revalidatePath("/internships");
    return { success: true };
  } catch {
    return { error: "Failed to post the opportunity." };
  }
}

export async function applyToOpportunity(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["STUDENT"]);
  const listingId = formData.get("listingId") as string | null;
  const message = formData.get("message") as string | null;

  if (!listingId) return { error: "Missing listing." };

  try {
    await prisma.internshipApplication.upsert({
      where: { listingId_studentId: { listingId, studentId: user.id } },
      update: { message: message || null, status: "APPLIED" },
      create: { listingId, studentId: user.id, message: message || null },
    });
    revalidatePath("/internships");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to apply." };
  }
}

export async function updateApplicationStatus(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);
  const appId = formData.get("appId") as string | null;
  const status = formData.get("status") as string | null;

  if (!appId || !status) return { error: "Missing fields." };

  try {
    await prisma.internshipApplication.update({
      where: { id: appId },
      data: { status },
    });
    revalidatePath("/internships");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update status." };
  }
}
