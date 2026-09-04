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
  });
  if (!pitch || pitch.studentId !== user.id) {
    return { ok: false, error: "Pitch not found or unauthorized." };
  }

  await prisma.jobPitch.update({
    where: { id: pitchId },
    data: { status },
  });

  revalidatePath("/reverse-placement");
  revalidatePath("/job-pitches");
  revalidatePath("/dashboard");
  return { ok: true };
}


export async function computeStudentPri(studentId: string) {
  const [assessments, projects, proofs, gradings, ledger, challengeCount] = await Promise.all([
    prisma.skillAssessment.findMany({ where: { studentId } }),
    prisma.project.count({ where: { ownerId: studentId, status: { in: ["IN_PROGRESS", "COMPLETED"] } } }),
    prisma.proofOfWork.count({ where: { studentId } }),
    prisma.dualGrading.findMany({ where: { labUnit: { members: { some: { studentId } } } } }),
    prisma.tokenLedger.findFirst({ where: { studentId } }),
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
    tokenBalance: ledger?.balance ?? 0,
    challengeCompletions: challengeCount,
  });
}
