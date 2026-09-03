import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GradingCard from "./GradingCard";

export default async function DualGradingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const gradings = await prisma.dualGrading.findMany({
    where:
      user.role === "FACULTY"
        ? { gradedByFacultyId: user.id }
        : user.role === "INDUSTRY"
          ? { gradedByIndustryId: user.id }
          : {},
    include: {
      challenge: { select: { title: true } },
      labUnit: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dual-Grading Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Faculty enters academic marks (0-100), Industry Lead inputs corporate job readiness score.
        </p>
      </div>

      {gradings.length === 0 ? (
        <div className="rounded-2xl border border-border-muted bg-surface p-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-card">
          No grading records assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {gradings.map((g) => (
            <GradingCard
              key={g.id}
              grading={{
                id: g.id,
                academicMarks: g.academicMarks,
                jobReadinessScore: g.jobReadinessScore,
                facultyRemarks: g.facultyRemarks,
                industryRemarks: g.industryRemarks,
                gradedByFacultyId: g.gradedByFacultyId,
                gradedByIndustryId: g.gradedByIndustryId,
                submittedAt: g.submittedAt,
                challenge: g.challenge,
                labUnit: g.labUnit,
              }}
              role={user.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
