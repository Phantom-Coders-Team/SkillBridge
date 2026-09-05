"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, normalizeRole, requireRole } from "@/lib/auth";
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
    return { error: "Title, description, and challenge type are required." };
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
  } catch (err) {
    console.error("Failed to post challenge:", err);
    return { error: "Failed to post challenge. Please try again." };
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

export async function deleteChallenge(
  challengeId: string,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  try {
    const challenge = await prisma.industryChallenge.findUnique({
      where: { id: challengeId },
      select: { industryId: true },
    });

    if (!challenge || challenge.industryId !== user.id) {
      return { error: "Unauthorized to delete this challenge." };
    }

    await prisma.industryChallenge.delete({
      where: { id: challengeId },
    });

    revalidatePath("/challenges");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to delete challenge." };
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
      include: {
        challenge: { select: { id: true, industryId: true, status: true } },
        labUnit: { select: { id: true, name: true } },
      },
    });

    if (!application || application.challenge.industryId !== user.id) {
      return { error: "Unauthorized to update this application." };
    }

    await prisma.challengeApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    // If approved or accepted, automatically integrate with Joint Evaluation and activate the Lab Unit
    if (status === "APPROVED" || status === "ACCEPTED") {
      // 1. Create or upsert DualGrading entry
      await prisma.dualGrading.upsert({
        where: {
          challengeId_labUnitId: {
            challengeId: application.challenge.id,
            labUnitId: application.labUnit.id,
          },
        },
        create: {
          challengeId: application.challenge.id,
          labUnitId: application.labUnit.id,
          gradedByIndustryId: user.id,
        },
        update: {
          gradedByIndustryId: user.id,
        },
      });

      // 2. Set the Lab Unit as ACTIVE and link to challenge
      await prisma.labUnit.update({
        where: { id: application.labUnit.id },
        data: {
          status: "ACTIVE",
          challengeId: application.challenge.id,
        },
      });

      // 3. If the challenge was open, mark it as in progress / assigned
      if (application.challenge.status === "OPEN") {
        await prisma.industryChallenge.update({
          where: { id: application.challenge.id },
          data: { status: "ASSIGNED" },
        });
      }
    }

    revalidatePath("/challenges");
    revalidatePath("/dual-grading");
    revalidatePath("/lab-units");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to update application status:", err);
    return { error: "Failed to update application status." };
  }
}

export async function applyLabUnitToChallenge(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["ACADEMICIAN", "FACULTY"]);

  const challengeId = formData.get("challengeId") as string | null;
  const existingLabUnitId = formData.get("labUnitId") as string | null;
  const isNewUnit = formData.get("isNewUnit") === "true";
  const newUnitName = formData.get("newUnitName") as string | null;
  const studentIds = formData.getAll("studentIds") as string[];
  const proposal = formData.get("proposal") as string | null;

  if (!challengeId) {
    return { error: "Challenge selection is required." };
  }

  const challenge = await prisma.industryChallenge.findUnique({
    where: { id: challengeId },
    select: { id: true, status: true, title: true },
  });

  if (!challenge) {
    return { error: "Challenge not found." };
  }

  if (challenge.status === "CLOSED" || challenge.status === "COMPLETED") {
    return { error: "This challenge is no longer accepting new proposals." };
  }

  try {
    let targetLabUnitId = existingLabUnitId;

    if (isNewUnit) {
      if (!newUnitName || newUnitName.trim().length === 0) {
        return { error: "A name is required to create a new Lab Unit." };
      }

      const newUnit = await prisma.labUnit.create({
        data: {
          name: newUnitName.trim(),
          facultyId: user.id,
          challengeId,
          status: "FORMING",
          members: studentIds.length > 0
            ? {
                create: studentIds.map((sid) => ({ studentId: sid })),
              }
            : undefined,
        },
      });
      targetLabUnitId = newUnit.id;
    } else {
      if (!targetLabUnitId) {
        return { error: "Please select an existing Lab Unit or create a new one." };
      }

      const verifiedUnit = await prisma.labUnit.findUnique({
        where: { id: targetLabUnitId },
        select: { id: true, facultyId: true },
      });

      if (!verifiedUnit || verifiedUnit.facultyId !== user.id) {
        return { error: "You can only apply with Lab Units that you lead." };
      }
    }

    // Check if an application already exists
    const existingApp = await prisma.challengeApplication.findUnique({
      where: {
        challengeId_labUnitId: {
          challengeId,
          labUnitId: targetLabUnitId!,
        },
      },
    });

    if (existingApp) {
      return { error: "This Lab Unit has already applied to this challenge." };
    }

    await prisma.challengeApplication.create({
      data: {
        challengeId,
        labUnitId: targetLabUnitId!,
        proposal: proposal?.trim() || null,
        status: "SUBMITTED",
      },
    });

    revalidatePath("/challenges");
    revalidatePath("/lab-units");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to submit challenge application:", err);
    return { error: "Failed to submit challenge proposal. Please try again." };
  }
}

export async function applyStudentToChallenge(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["STUDENT"]);

  const challengeId = formData.get("challengeId") as string | null;
  const labUnitId = formData.get("labUnitId") as string | null;
  const facultyId = formData.get("facultyId") as string | null;
  const proposal = formData.get("proposal") as string | null;

  if (!challengeId) {
    return { error: "Challenge is required." };
  }

  const challenge = await prisma.industryChallenge.findUnique({
    where: { id: challengeId },
    select: { id: true, status: true, rndOnly: true },
  });

  if (!challenge) {
    return { error: "Challenge not found." };
  }

  if (challenge.status === "CLOSED" || challenge.status === "COMPLETED") {
    return { error: "This challenge is closed to applications." };
  }

  try {
    // Case 1: Student is already a member of an existing Lab Unit
    if (labUnitId) {
      const membership = await prisma.labUnitMember.findUnique({
        where: {
          labUnitId_studentId: {
            labUnitId,
            studentId: user.id,
          },
        },
      });

      if (!membership) {
        return { error: "You are not a member of the selected Lab Unit." };
      }

      // Check if application exists
      const existing = await prisma.challengeApplication.findUnique({
        where: {
          challengeId_labUnitId: {
            challengeId,
            labUnitId,
          },
        },
      });

      if (existing) {
        return { error: "Your Lab Unit has already applied to this challenge." };
      }

      await prisma.challengeApplication.create({
        data: {
          challengeId,
          labUnitId,
          proposal: proposal?.trim() || null,
          status: "SUBMITTED",
        },
      });

      revalidatePath("/challenges");
      revalidatePath("/dashboard");
      return { success: true };
    }

    // Case 2: Student requests a faculty mentor to sponsor/form a Lab Unit
    if (!facultyId) {
      return {
        error:
          challenge.rndOnly
            ? "R&D challenges require an academician mentor. Please select a faculty advisor to lead your team."
            : "Please select a faculty mentor or an existing Lab Unit to apply.",
      };
    }

    // Check if faculty exists and is ACADEMICIAN/FACULTY
    const faculty = await prisma.user.findUnique({
      where: { id: facultyId },
      select: { id: true, role: true, name: true },
    });

    if (!faculty) {
      return { error: "Selected faculty mentor was not found." };
    }

    // Create a student-initiated Lab Unit under this faculty mentor
    const labUnit = await prisma.labUnit.create({
      data: {
        name: `${user.name}'s Project Team`,
        facultyId: faculty.id,
        challengeId,
        status: "FORMING",
        members: {
          create: [{ studentId: user.id }],
        },
      },
    });

    // Create the challenge application
    await prisma.challengeApplication.create({
      data: {
        challengeId,
        labUnitId: labUnit.id,
        proposal: proposal?.trim() || `Student application sponsored by Prof. ${faculty.name}`,
        status: "SUBMITTED",
      },
    });

    revalidatePath("/challenges");
    revalidatePath("/lab-units");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to submit student challenge interest:", err);
    return { error: "Failed to submit challenge application. Please try again." };
  }
}
