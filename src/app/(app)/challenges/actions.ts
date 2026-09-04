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
        title: title.trim(),
        description: description.trim(),
        challengeType: challengeType as ChallengeTypeValue,
        domain: domain?.trim() || null,
        techStack: techStack?.trim() || null,
        objectives: objectives?.trim() || null,
        stipend: stipend ? parseInt(stipend, 10) : null,
        deadline: deadline ? new Date(deadline) : null,
        rndOnly,
      },
    });

    revalidatePath("/challenges");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to post challenge." };
  }
}

export async function updateChallengeStatus(
  challengeId: string,
  status: string,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  try {
    const challenge = await prisma.industryChallenge.findUnique({
      where: { id: challengeId },
      select: { industryId: true },
    });

    if (!challenge || challenge.industryId !== user.id) {
      return { error: "Unauthorized to update this challenge." };
    }

    await prisma.industryChallenge.update({
      where: { id: challengeId },
      data: { status },
    });

    revalidatePath("/challenges");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update challenge status." };
  }
}

export async function updateChallengeApplicationStatus(
  applicationId: string,
  status: string,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  try {
    const application = await prisma.challengeApplication.findUnique({
      where: { id: applicationId },
      include: { challenge: { select: { industryId: true } } },
    });

    if (!application || application.challenge.industryId !== user.id) {
      return { error: "Unauthorized to update this application." };
    }

    await prisma.challengeApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    revalidatePath("/challenges");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update application status." };
  }
}

