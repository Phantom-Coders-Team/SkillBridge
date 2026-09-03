"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionState {
  error?: string;
  success?: boolean;
}

type ProgramType = "FACULTY_INTERNSHIP" | "INDUSTRIAL_TRAINING" | "FDP" | "CONSULTANCY" | "RESEARCH";

export async function applyToProgram(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["FACULTY"]);
  const listingId = formData.get("listingId") as string | null;
  const message = formData.get("message") as string | null;

  if (!listingId) return { error: "Missing listing." };

  try {
    await prisma.facultyProgramApplication.upsert({
      where: { listingId_facultyId: { listingId, facultyId: user.id } },
      update: { message: message || null, status: "APPLIED" },
      create: { listingId, facultyId: user.id, message: message || null },
    });
    revalidatePath("/faculty-portal");
    return { success: true };
  } catch {
    return { error: "Failed to apply." };
  }
}

export async function postFacultyProgram(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["INDUSTRY"]);
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const programType = formData.get("programType") as string | null;
  const domain = formData.get("domain") as string | null;
  const duration = formData.get("duration") as string | null;
  const location = formData.get("location") as string | null;
  const compensation = formData.get("compensation") as string | null;

  if (!title || !description || !programType) {
    return { error: "Title, description, and type are required." };
  }

  try {
    await prisma.facultyProgramListing.create({
      data: {
        companyId: user.id,
        title,
        description,
        programType: programType as ProgramType,
        domain: domain || null,
        duration: duration || null,
        location: location || null,
        compensation: compensation || null,
      },
    });
    revalidatePath("/faculty-portal");
    return { success: true };
  } catch {
    return { error: "Failed to post the program." };
  }
}

export async function updateFacultyApplicationStatus(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRY"]);
  const appId = formData.get("appId") as string | null;
  const status = formData.get("status") as string | null;
  if (!appId || !status) return { error: "Missing fields." };
  try {
    await prisma.facultyProgramApplication.update({ where: { id: appId }, data: { status } });
    revalidatePath("/faculty-portal");
    return { success: true };
  } catch {
    return { error: "Failed to update status." };
  }
}

export async function getFacultyApplications() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") return [];
  return prisma.facultyProgramApplication.findMany({
    where: { facultyId: user.id },
    include: { listing: { include: { company: { select: { name: true, profile: { select: { companyName: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });
}
