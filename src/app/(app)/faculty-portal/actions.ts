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
  const user = await requireRole(["ACADEMICIAN", "FACULTY"]);
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
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);
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
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);
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

import crypto from "crypto";
import { createNotification } from "@/lib/notifications";

export async function getFacultyApplications() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ACADEMICIAN" && user.role !== "FACULTY")) return [];
  return prisma.facultyProgramApplication.findMany({
    where: { facultyId: user.id },
    include: {
      listing: {
        include: {
          company: { select: { id: true, name: true, email: true, profile: { select: { companyName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function submitFacultyMilestoneAction(data: {
  applicationId: string;
  milestoneStage: string;
  workplanUrl?: string;
  finalReportUrl?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await requireRole(["ACADEMICIAN", "FACULTY"]);

  try {
    const app = await prisma.facultyProgramApplication.findUnique({
      where: { id: data.applicationId },
      include: {
        listing: {
          include: {
            company: { select: { id: true, name: true, email: true, profile: { select: { companyName: true } } } },
          },
        },
      },
    });

    if (!app || app.facultyId !== user.id) {
      return { success: false, error: "Application record not found or unauthorized." };
    }

    const updated = await prisma.facultyProgramApplication.update({
      where: { id: data.applicationId },
      data: {
        milestoneStage: data.milestoneStage,
        workplanUrl: data.workplanUrl || app.workplanUrl,
        finalReportUrl: data.finalReportUrl || app.finalReportUrl,
        message: data.notes ? `${app.message || ""}\n[${data.milestoneStage}]: ${data.notes}` : app.message,
      },
    });

    // Notify company mentor
    await createNotification({
      userId: app.listing.company.id,
      userEmail: app.listing.company.email,
      userName: app.listing.company.profile?.companyName || app.listing.company.name,
      title: "Faculty Milestone Submitted 📋",
      message: `${user.name} submitted milestone "${data.milestoneStage}" for ${app.listing.title}. Ready for evaluation.`,
      type: "TEST",
      link: `/faculty-portal`,
    });

    revalidatePath("/faculty-portal");
    return { success: true };
  } catch (err) {
    console.error("submitFacultyMilestone error:", err);
    return { success: false, error: "Failed to submit milestone." };
  }
}

export async function evaluateFacultyMilestoneAction(data: {
  applicationId: string;
  rating: number;
  feedback: string;
  approveCompletion: boolean;
}): Promise<{ success: boolean; certificateHash?: string; error?: string }> {
  const user = await requireRole(["INDUSTRIES", "INDUSTRY"]);

  try {
    const app = await prisma.facultyProgramApplication.findUnique({
      where: { id: data.applicationId },
      include: {
        faculty: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, companyId: true } },
      },
    });

    if (!app || app.listing.companyId !== user.id) {
      return { success: false, error: "Application not found or unauthorized." };
    }

    let certificateHash: string | undefined = undefined;
    if (data.approveCompletion) {
      certificateHash = crypto
        .createHash("sha256")
        .update(`FACULTY_CERT:${app.facultyId}:${app.listingId}:${Date.now()}`)
        .digest("hex")
        .slice(0, 32)
        .toUpperCase();
    }

    await prisma.facultyProgramApplication.update({
      where: { id: data.applicationId },
      data: {
        mentorRating: data.rating,
        mentorFeedback: data.feedback,
        status: data.approveCompletion ? "COMPLETED" : "APPROVED",
        milestoneStage: data.approveCompletion ? "COMPLETED" : app.milestoneStage,
        completionCertificateHash: certificateHash || app.completionCertificateHash,
      },
    });

    // Notify faculty
    await createNotification({
      userId: app.faculty.id,
      userEmail: app.faculty.email,
      userName: app.faculty.name,
      title: data.approveCompletion
        ? "Faculty Industrial Training Certified! 🎓"
        : "Mentor Feedback Received 📝",
      message: data.approveCompletion
        ? `Congratulations! ${user.name} approved your industrial training with a ${data.rating}/5 rating. Your official certificate is ready.`
        : `${user.name} evaluated your milestone with a ${data.rating}/5 rating and feedback.`,
      type: "BADGE",
      link: `/faculty-portal`,
    });

    revalidatePath("/faculty-portal");
    return { success: true, certificateHash };
  } catch (err) {
    console.error("evaluateFacultyMilestone error:", err);
    return { success: false, error: "Failed to evaluate milestone." };
  }
}

