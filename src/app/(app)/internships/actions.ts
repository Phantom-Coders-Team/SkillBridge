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
  const durationInput = formData.get("duration") as string | null;
  const deadlineInput = formData.get("deadline") as string | null;
  const mode = formData.get("mode") as string | null;
  const certification = formData.get("certification") === "on";

  if (!title || !description || !programType) {
    return { error: "Title, description, and type are required." };
  }

  let duration = durationInput || null;
  if (deadlineInput) {
    duration = durationInput
      ? `${durationInput} · Deadline: ${deadlineInput}`
      : `Deadline: ${deadlineInput}`;
  }

  try {
    await prisma.learningProgram.create({
      data: {
        companyId: user.id,
        title,
        description,
        programType: programType as ProgramType,
        skills: skills || null,
        duration,
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

export async function deleteOpportunity(
  listingId: string
): Promise<{ success?: boolean; error?: string }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  const listing = await prisma.learningProgram.findUnique({
    where: { id: listingId },
    select: { companyId: true },
  });

  if (!listing) {
    return { error: "Listing not found." };
  }

  if (listing.companyId !== user.id) {
    return { error: "You can only remove listings that your company posted." };
  }

  try {
    await prisma.learningProgram.delete({
      where: { id: listingId },
    });
    revalidatePath("/internships");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete listing:", err);
    return { error: "Failed to remove the listing." };
  }
}

import {
  notifyNewApplicationSubmitted,
  notifyApplicationStatusChange,
} from "@/lib/notifications";

export async function applyToOpportunity(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["STUDENT"]);
  const listingId = formData.get("listingId") as string | null;
  const message = formData.get("message") as string | null;

  if (!listingId) return { error: "Missing listing." };

  try {
    const listing = await prisma.learningProgram.findUnique({
      where: { id: listingId },
      include: { company: { select: { id: true, email: true, name: true } } },
    });

    if (!listing) return { error: "Opportunity not found." };

    // Check if application deadline has passed
    if (listing.duration && listing.duration.includes("Deadline:")) {
      const match = listing.duration.match(/Deadline:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      if (match && match[1]) {
        const deadlineDate = new Date(match[1]);
        deadlineDate.setHours(23, 59, 59, 999);
        if (deadlineDate.getTime() < Date.now()) {
          return { error: "Applications for this opportunity have closed (Deadline has passed)." };
        }
      }
    }

    await prisma.internshipApplication.upsert({
      where: { listingId_studentId: { listingId, studentId: user.id } },
      update: { message: message || null, status: "APPLIED" },
      create: { listingId, studentId: user.id, message: message || null },
    });

    // Send email notification to recruiter
    if (listing?.company?.email) {
      try {
        await notifyNewApplicationSubmitted({
          recruiterId: listing.company.id,
          recruiterEmail: listing.company.email,
          recruiterName: listing.company.name,
          studentName: user.name,
          listingTitle: listing.title,
        });
      } catch (err) {
        console.error("Failed to notify recruiter of new application:", err);
      }
    }

    revalidatePath("/internships");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to apply." };
  }
}

import {
  parseApplicationMessage,
  encodeApplicationMessage,
  type InterviewDetails,
} from "@/lib/interview";

export async function updateApplicationStatus(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);
  const appId = formData.get("appId") as string | null;
  const status = formData.get("status") as string | null;

  if (!appId || !status) return { error: "Missing fields." };

  try {
    const currentApp = await prisma.internshipApplication.findUnique({
      where: { id: appId },
      select: { message: true },
    });

    let updatedMessage = currentApp?.message || null;
    let interviewDetails: InterviewDetails | undefined = undefined;

    if (status === "INTERVIEW") {
      const interviewDate = formData.get("interviewDate") as string | null;
      const interviewMode = (formData.get("interviewMode") as string | null) || "Google Meet";
      const interviewLink = formData.get("interviewLink") as string | null;
      const interviewNotes = formData.get("interviewNotes") as string | null;

      const existingParsed = parseApplicationMessage(currentApp?.message);
      interviewDetails = {
        date: interviewDate || existingParsed.interview?.date || new Date().toISOString(),
        mode: interviewMode,
        link: interviewLink || existingParsed.interview?.link || undefined,
        notes: interviewNotes || existingParsed.interview?.notes || undefined,
        scheduledAt: new Date().toISOString(),
      };

      updatedMessage = encodeApplicationMessage(existingParsed.coverLetter, interviewDetails);
    }

    const updatedApp = await prisma.internshipApplication.update({
      where: { id: appId },
      data: {
        status,
        ...(status === "INTERVIEW" ? { message: updatedMessage } : {}),
      },
      include: {
        student: { select: { id: true, email: true, name: true } },
        listing: {
          include: {
            company: { select: { name: true, profile: { select: { companyName: true } } } },
          },
        },
      },
    });

    // Send email notification to student
    if (updatedApp.student?.email) {
      const companyName =
        updatedApp.listing.company.profile?.companyName ||
        updatedApp.listing.company.name ||
        "Industry Partner";

      try {
        await notifyApplicationStatusChange({
          studentId: updatedApp.student.id,
          studentEmail: updatedApp.student.email,
          studentName: updatedApp.student.name,
          listingTitle: updatedApp.listing.title,
          companyName,
          status,
          interviewDetails,
        });
      } catch (err) {
        console.error("Failed to dispatch status email to student:", err);
      }
    }

    revalidatePath("/internships");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return { error: "Failed to update status." };
  }
}
