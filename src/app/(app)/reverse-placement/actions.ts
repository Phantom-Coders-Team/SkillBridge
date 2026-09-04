"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculatePri } from "@/lib/pri";

export interface ReversePitchResult {
  ok: boolean;
  error?: string;
  created?: boolean;
}

export async function pitchTopCandidate(
  studentId: string,
  roleDetails: string,
  stipend: number
): Promise<ReversePitchResult> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INDUSTRIES" && user.role !== "INDUSTRY")) {
    return { ok: false, error: "Only industry recruiters can pitch candidates." };
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });
  if (!student || student.role !== "STUDENT") {
    return { ok: false, error: "Candidate not found." };
  }

  // Verify candidate has unlocked reverse placement (PRI > 850)
  const pri = await computeStudentPri(studentId);
  if (!pri.unlocked) {
    return { ok: false, error: "Candidate has not unlocked reverse placement yet (PRI ≤ 850)." };
  }

  const existing = await prisma.jobPitch.findFirst({
    where: { industryId: user.id, studentId },
  });
  if (existing) {
    return { ok: false, error: "This candidate has already been pitched by your company." };
  }

  await prisma.jobPitch.create({
    data: {
      industryId: user.id,
      studentId,
      priScore: pri.score,
      status: "PITCHED",
      stipend,
      roleDetails,
    },
  });

  // Dispatch email notification to student
  if (student.email) {
    const company = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
    const companyName = company?.profile?.companyName || company?.name || "Corporate Recruiter";
    const { notifyRecruiterPitch } = await import("@/lib/notifications");
    notifyRecruiterPitch({
      studentId: student.id,
      studentEmail: student.email,
      studentName: student.name,
      companyName,
      roleDetails,
      stipend,
    }).catch((err) => console.error("Failed to dispatch pitch notification:", err));
  }

  revalidatePath("/reverse-placement");
  revalidatePath("/job-pitches");
  revalidatePath("/dashboard");
  return { ok: true, created: true };
}

export async function respondToPitch(
  pitchId: string,
  status: "ACCEPTED" | "REJECTED",
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { ok: false, error: "Only students can respond to direct pitches." };
  }

  const pitch = await prisma.jobPitch.findUnique({
    where: { id: pitchId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      industry: { select: { id: true, name: true, email: true, profile: { select: { companyName: true } } } },
    },
  });
  if (!pitch || pitch.studentId !== user.id) {
    return { ok: false, error: "Pitch not found or unauthorized." };
  }

  await prisma.jobPitch.update({
    where: { id: pitchId },
    data: { status },
  });

  // If job pitch was accepted, notify recruiter and student via email
  if (status === "ACCEPTED" && pitch.industry?.email) {
    const recruiterName = pitch.industry.profile?.companyName || pitch.industry.name || "Corporate Recruiter";
    const { notifyPitchAccepted } = await import("@/lib/notifications");
    try {
      await notifyPitchAccepted({
        recruiterId: pitch.industry.id,
        recruiterEmail: pitch.industry.email,
        recruiterName,
        studentId: pitch.student.id,
        studentEmail: pitch.student.email,
        studentName: pitch.student.name,
        roleDetails: pitch.roleDetails || "Technical Placement Offer",
        stipend: pitch.stipend ?? 0,
      });
    } catch (err) {
      console.error("Failed to dispatch pitch acceptance notification:", err);
    }
  }

  revalidatePath("/reverse-placement");
  revalidatePath("/job-pitches");
  revalidatePath("/dashboard");
  return { ok: true };
}


export async function computeStudentPri(studentId: string) {
  const [assessments, projects, proofs, gradings, mentorSlotsCount, challengeCount] = await Promise.all([
    prisma.skillAssessment.findMany({ where: { studentId } }),
    prisma.project.count({ where: { ownerId: studentId, status: { in: ["IN_PROGRESS", "COMPLETED"] } } }),
    prisma.proofOfWork.count({ where: { studentId } }),
    prisma.dualGrading.findMany({ where: { labUnit: { members: { some: { studentId } } } } }),
    prisma.mentorSlot.count({ where: { studentId, status: { in: ["BOOKED", "COMPLETED"] } } }),
    prisma.labUnitMember.count({ where: { studentId } }),
  ]);

  const skillScore = assessments.reduce((sum, a) => sum + a.score, 0) / Math.max(1, assessments.length);
  const dualScores = gradings
    .map((g) => [g.jobReadinessScore, g.academicMarks])
    .flat()
    .filter((v): v is number => v !== null && v !== undefined);
  const dualGradingScore = dualScores.length ? dualScores.reduce((a, b) => a + b, 0) / dualScores.length : null;

  return calculatePri({
    skillScore: Math.round(skillScore),
    projectsCompleted: projects,
    proofOfWorkCount: proofs,
    dualGradingScore,
    mentorshipSlots: mentorSlotsCount,
    challengeCompletions: challengeCount,
  });
}
