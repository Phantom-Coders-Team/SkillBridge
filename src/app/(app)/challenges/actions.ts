"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ChallengeTypeValue = "CAPSTONE" | "R_AND_D" | "MICRO_CONSULTANCY";

export async function postChallenge(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const challengeType = formData.get("challengeType") as string | null;
  const domain = formData.get("domain") as string | null;
  const techStack = formData.get("techStack") as string | null;
  const objectives = formData.get("objectives") as string | null;
  const stipend = formData.get("stipend") as string | null;
  const deadline = formData.get("deadline") as string | null;
  const rndOnly = formData.get("rndOnly") === "on";

  if (!title || !description || !challengeType) {
    return { error: "Title, description, and type are required." };
  }

  try {
    await prisma.industryChallenge.create({
      data: {
        industryId: user.id,
        title,
        description,
        challengeType: challengeType as ChallengeTypeValue,
        domain: domain || null,
        techStack: techStack || null,
        objectives: objectives || null,
        stipend: stipend ? parseInt(stipend, 10) : null,
        deadline: deadline ? new Date(deadline) : null,
        rndOnly,
      },
    });

    revalidatePath("/challenges");
    return { success: true };
  } catch {
    return { error: "Failed to post challenge." };
  }
}
