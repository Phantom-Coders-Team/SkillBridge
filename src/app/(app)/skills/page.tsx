import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, ClipboardList, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import { syncStudentSkillDecay } from "@/lib/skillDecaySync";
import { SkillDecayEngine, type SkillEntry } from "./SkillDecayEngine";
import SkillQuestionnaire from "./SkillQuestionnaire";
import SkillMappingHub from "./SkillMappingHub";

const DECAY_TONE: Record<string, BadgeTone> = {
  ACTIVE: "green",
  STALE: "amber",
  EXPIRED: "red",
  RECERTIFIED: "blue",
};

export default async function SkillsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "STUDENT") {
    // Automatically update skill decay statuses in the database according to date
    await syncStudentSkillDecay(user.id);

    const [assessments, learningPrograms] = await Promise.all([
      prisma.skillAssessment.findMany({
        where: { studentId: user.id },
        orderBy: { skillName: "asc" },
        take: 50,
      }),
      prisma.learningProgram.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          programType: true,
          skills: true,
          duration: true,
          company: { select: { name: true, profile: { select: { companyName: true } } } },
        },
        take: 12,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const skills: SkillEntry[] = assessments.map((a) => ({
      id: a.id,
      skillName: a.skillName,
      score: a.score,
      decayStatus: a.decayStatus as SkillEntry["decayStatus"],
      verifiedAt: a.verifiedAt ? a.verifiedAt.toISOString() : null,
    }));

    const selected = assessments.map((a) => a.skillName);

    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          icon={ClipboardCheck}
          title="Skill Radar, Mapping & Career Guidance"
          subtitle="Track verified proficiency against badge decay, map your skill profile to target industries and job roles, and bridge skill gaps."
          actions={
            <Link
              href="/assessments"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all"
            >
              <ClipboardList className="size-4" />
              <span>Take Technical Assessments</span>
            </Link>
          }
        />

        {/* 1. Skill Mapping & Career Guidance Hub */}
        <SkillMappingHub
          assessedSkills={assessments.map((a) => ({
            id: a.id,
            skillName: a.skillName,
            score: a.score,
            decayStatus: a.decayStatus,
          }))}
          learningPrograms={learningPrograms.map((lp) => ({
            id: lp.id,
            title: lp.title,
            description: lp.description,
            programType: lp.programType,
            companyName: lp.company.profile?.companyName || lp.company.name,
            skills: lp.skills,
            duration: lp.duration,
          }))}
        />

        {/* 2. Skill Decay Engine & Radar */}
        <div className="pt-4 border-t border-border-muted">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Temporal Skill Freshness & Decay Radar
            </h3>
            <p className="text-xs text-slate-500">
              Technology competencies naturally decay over time. Commit code and retake diagnostic assessments to keep badges ACTIVE.
            </p>
          </div>
          <SkillDecayEngine initialSkills={skills} />
        </div>

        {/* 3. Skill Questionnaire */}
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <ListChecks className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Self-Assessed Skill Questionnaire</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update your self-reported skills to shape your profile and personalized recommendations.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <SkillQuestionnaire selected={selected} />
          </div>
        </Card>
      </div>
    );
  }

  const assessments = await prisma.skillAssessment.findMany({
    include: { student: { select: { name: true } } },
    orderBy: [{ decayStatus: "asc" }, { score: "desc" }],
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={ClipboardCheck}
        title="Skill Assessments"
        subtitle="Verified skill scores and decay status, so stale skills can be flagged for recertification."
      />

      {assessments.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No assessments recorded" description="Student skill assessments will appear here once evaluated." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Skill</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Score</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {assessments.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/40">
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{a.student.name}</td>
                  <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{a.skillName}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{a.score}%</td>
                  <td className="px-5 py-3">
                    <Badge tone={DECAY_TONE[a.decayStatus] ?? "gray"}>{a.decayStatus}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400 dark:text-slate-500">
                    {a.verifiedAt ? new Date(a.verifiedAt).toLocaleDateString() : "—"}
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