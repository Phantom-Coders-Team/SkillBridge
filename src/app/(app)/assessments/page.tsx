import { redirect } from "next/navigation";
import { ClipboardCheck, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import { SkillQuizModal } from "./SkillQuizModal";

const DECAY_TONE: Record<string, BadgeTone> = {
  ACTIVE: "green",
  AT_RISK: "amber",
  EXPIRED: "red",
  PENDING: "gray",
};

export default async function AssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [assessments, myAssessments] = await Promise.all([
    prisma.skillAssessment.findMany({
      where: user.role === "STUDENT" ? { studentId: user.id } : undefined,
      include: {
        student: {
          select: {
            name: true,
            profile: { select: { rollNumber: true, department: true } },
          },
        },
      },
      orderBy: { lastAssessedAt: "desc" },
      take: 50,
    }),
    prisma.skillAssessment.findMany({
      where: { studentId: user.id },
      orderBy: { lastAssessedAt: "desc" },
    }),
  ]);

  const avgMyScore =
    myAssessments.length > 0
      ? Math.round(myAssessments.reduce((sum, a) => sum + a.score, 0) / myAssessments.length)
      : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Student Skill Assessments"
        subtitle="Standardized questionnaire evaluations, skill gap analysis, and industry competency verification."
        actions={<SkillQuizModal />}
      />

      {/* Student Personal Benchmark Banner */}
      {myAssessments.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
              {avgMyScore}%
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">My Avg Competency</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {avgMyScore >= 80 ? "Top Tier" : avgMyScore >= 60 ? "Industry Ready" : "In Progress"}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified Skills</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {myAssessments.filter((a) => a.score >= 70).length} of {myAssessments.length} Skills
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gaps to Upskill</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {myAssessments.filter((a) => a.score < 70).length} Targeted Areas
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Table of all assessments */}
      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No assessments completed yet"
          description="Click 'Take Skill Assessment' above to evaluate technical competencies and identify skill gaps."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-border-muted px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {user.role === "STUDENT" ? "My Recent Evaluations" : "Recent Institutional Skill Evaluations"}
            </h3>
            <span className="text-xs text-slate-400">{assessments.length} Records</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Department</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Skill Track</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Score</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {assessments.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">
                    <span className="font-medium">{a.student.name}</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500">
                      {a.student.profile?.rollNumber || "ID: " + a.studentId.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {a.student.profile?.department || "General"}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {a.skillName}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{a.score}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full ${
                            a.score >= 80 ? "bg-emerald-500" : a.score >= 60 ? "bg-indigo-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${a.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
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