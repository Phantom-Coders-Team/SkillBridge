"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createLabUnit(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["ACADEMICIAN", "FACULTY"]);

  const name = formData.get("name") as string | null;
  const challengeId = formData.get("challengeId") as string | null;
  const studentIds = formData.getAll("studentIds") as string[];

  if (!name) {
    return { error: "Lab unit name is required." };
  }

  try {
    await prisma.labUnit.create({
      data: {
        name,
        facultyId: user.id,
        challengeId: challengeId || null,
        members: studentIds.length > 0 ? { create: studentIds.map((sid) => ({ studentId: sid })) } : undefined,
      },
    });

    revalidatePath("/lab-units");
    return { success: true };
  } catch {
    return { error: "Failed to create lab unit." };
  }
}

export async function applyToChallenge(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["ACADEMICIAN", "FACULTY"]);

  const labUnitId = formData.get("labUnitId") as string | null;
  const challengeId = formData.get("challengeId") as string | null;
  const proposal = formData.get("proposal") as string | null;

  if (!labUnitId || !challengeId) {
    return { error: "Lab unit and challenge are required." };
  }

  const labUnit = await prisma.labUnit.findUnique({ where: { id: labUnitId } });
  if (!labUnit || labUnit.facultyId !== user.id) {
    return { error: "You can only apply with lab units you lead." };
  }

  try {
    await prisma.challengeApplication.create({
      data: {
        challengeId,
        labUnitId,
        proposal: proposal || null,
      },
    });

    revalidatePath("/lab-units");
    revalidatePath("/challenges");
    return { success: true };
  } catch {
    return { error: "Failed to submit application." };
  }
}
