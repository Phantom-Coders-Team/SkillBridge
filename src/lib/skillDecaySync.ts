import { prisma } from "@/lib/prisma";

export type DecayStatus = "ACTIVE" | "STALE" | "EXPIRED" | "RECERTIFIED";

/**
 * Computes the exact objective freshness status of a skill badge based on the date:
 * - Fresh (ACTIVE): Tested <= 45 days ago; verified through diagnostic assessment or work proof.
 * - Decaying (STALE): Tested 46-90 days ago OR unverified self-declaration; needs diagnostic.
 * - Expired (EXPIRED): Exceeded 90 days (>90d) since last test — requires diagnostic renewal.
 * - Refreshed (RECERTIFIED): Refreshed and verified through recent diagnostic test.
 */
export function computeSkillStatusFromDate(
  declaredStatus: string,
  verifiedAt: Date | string | null
): DecayStatus {
  if (!verifiedAt) {
    return "STALE"; // unverified self-declaration
  }

  const vDate = typeof verifiedAt === "string" ? new Date(verifiedAt) : verifiedAt;
  const now = new Date();
  const diffMs = now.getTime() - vDate.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // Rule 1: Exceeded 90 days since last test — requires diagnostic renewal.
  if (daysElapsed > 90) {
    return "EXPIRED";
  }

  // Rule 2: Refreshed and verified through recent diagnostic test.
  if (declaredStatus === "RECERTIFIED") {
    return "RECERTIFIED";
  }

  // Rule 3: Decaying (tested 46-90 days ago) or decaying declaration.
  if (daysElapsed > 45 || declaredStatus === "STALE") {
    return "STALE";
  }

  // Rule 4: Fresh (tested <= 45 days ago).
  return "ACTIVE";
}

/**
 * Automatically syncs and updates skill assessment decay statuses in the database
 * based on real-time date rules for a student.
 */
export async function syncStudentSkillDecay(studentId: string) {
  if (!studentId) return;

  const assessments = await prisma.skillAssessment.findMany({
    where: { studentId },
    select: { id: true, decayStatus: true, verifiedAt: true },
  });

  const updates = assessments
    .map((a) => {
      const computed = computeSkillStatusFromDate(a.decayStatus, a.verifiedAt);
      if (computed !== a.decayStatus) {
        return prisma.skillAssessment.update({
          where: { id: a.id },
          data: { decayStatus: computed },
        });
      }
      return null;
    })
    .filter(Boolean);

  if (updates.length > 0) {
    await Promise.all(updates);
  }
}
