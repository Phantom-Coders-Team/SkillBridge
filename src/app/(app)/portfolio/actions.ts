"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function addPortfolioItem(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["STUDENT"]);
  const type = formData.get("type") as string | null;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const issuer = formData.get("issuer") as string | null;
  const year = formData.get("year") ? Number(formData.get("year")) : null;

  if (!type || !title) return { error: "Type and title are required." };

  try {
    await prisma.portfolioItem.create({
      data: {
        studentId: user.id,
        type,
        title,
        description: description || null,
        issuer: issuer || null,
        year: year || null,
      },
    });
    revalidatePath("/portfolio");
    return { success: true };
  } catch {
    return { error: "Failed to add item." };
  }
}

export async function removePortfolioItem(itemId: string) {
  const user = await requireRole(["STUDENT"]);
  await prisma.portfolioItem.deleteMany({
    where: { id: itemId, studentId: user.id },
  });
  revalidatePath("/portfolio");
}
