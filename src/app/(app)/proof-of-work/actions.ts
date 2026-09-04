"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitProofOfWork(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const user = await requireRole(["STUDENT"]);
    
    const projectId = formData.get("projectId") as string;
    const artifactUrl = formData.get("artifactUrl") as string;
    const description = formData.get("description") as string;
    
    if (!projectId || !description) {
      return { error: "Project and description are required." };
    }

    // Verify the project belongs to the student
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: user.id,
      }
    });

    if (!project) {
      return { error: "Invalid project selected." };
    }

    await prisma.proofOfWork.create({
      data: {
        studentId: user.id,
        projectId,
        artifactUrl,
        description,
        facultySignOff: "PENDING",
        industrySignOff: "PENDING",
      }
    });

    revalidatePath("/proof-of-work");
    revalidatePath("/portfolio");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting proof of work:", error);
    return { error: "Failed to submit proof of work. Please try again." };
  }
}
