import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const DECAY_TONE: Record<string, BadgeTone> = {
  ACTIVE: "green",
  AT_RISK: "amber",
  EXPIRED: "red",
  PENDING: "gray",
};

export default async function AssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const assessments = await prisma.skillAssessment.findMany({
    include: { student: { select: { name: true, profile: { select: { rollNumber: true, department: true } } } } },
    orderBy: { lastAssessedAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={ClipboardCheck}
        title="Student Skill Assessments"
        subtitle="Verified skill scores and decay status to plan recertification."
      />

      {assessments.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No assessments yet" description="Skill assessments will appear once students complete evaluations." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Department</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Skill</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Score</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {assessments.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                    {a.student.name}
                    <span className="block text-xs text-slate-400 dark:text-slate-500">{a.student.profile?.rollNumber}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{a.student.profile?.department || "—"}</td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{a.skillName}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{a.score}%</td>
                  <td className="px-5 py-3">
                    <Badge tone={DECAY_TONE[a.decayStatus] ?? "gray"}>{a.decayStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}