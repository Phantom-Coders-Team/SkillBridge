import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SkillDeficitHeatmap, type HeatCell, type Recommendation } from "./SkillDeficitHeatmap";

export default async function HeatmapPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "TPO") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-border-muted bg-surface p-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-card">
        Only Training &amp; Placement Officers can view the skill deficit heatmap.
      </div>
    );
  }

  const [benchmarks, students, assessments] = await Promise.all([
    prisma.hiringBenchmark.findMany(),
    prisma.user.findMany({
      where: { role: "STUDENT", profile: { isNot: null } },
      include: { profile: true },
    }),
    prisma.skillAssessment.findMany(),
  ]);

  const studentsByProfile = students
    .filter((s) => s.profile?.department && s.profile.year)
    .map((s) => ({
      id: s.id,
      department: s.profile!.department!,
      year: s.profile!.year!,
    }));

  const batchLabel = (department: string, year: number) =>
    `${department} ${year}${yearSuffix(year)} Year`;

  const yearSuffix = (y: number) => {
    const m = y % 10;
    if (m === 1) return "st";
    if (m === 2) return "nd";
    if (m === 3) return "rd";
    return "th";
  };

  const assessmentsByStudent = new Map<string, { skillName: string; score: number }[]>();
  for (const a of assessments) {
    const arr = assessmentsByStudent.get(a.studentId) || [];
    arr.push({ skillName: a.skillName, score: a.score });
    assessmentsByStudent.set(a.studentId, arr);
  }

  const cells: HeatCell[] = [];
  for (const b of benchmarks) {
    const batchStudents = studentsByProfile.filter(
      (s) => s.department === b.department && s.year === b.year
    );
    if (batchStudents.length === 0) continue;

    let sum = 0;
    let count = 0;
    for (const s of batchStudents) {
      const skills = assessmentsByStudent.get(s.id) || [];
      const match = skills.find((k) => k.skillName.toLowerCase() === b.skillName.toLowerCase());
      if (match) {
        sum += match.score;
        count += 1;
      }
    }
    if (count === 0) continue;
    const avgScore = Math.round(sum / count);

    cells.push({
      batch: batchLabel(b.department, b.year),
      skill: b.skillName,
      avgScore,
      requiredScore: b.requiredScore,
    });
  }

  const recommendations: Recommendation[] = cells
    .filter((c) => c.requiredScore - c.avgScore >= 8)
    .sort((a, b) => b.requiredScore - b.avgScore - (a.requiredScore - a.avgScore))
    .map((c, i) => {
      const deficit = c.requiredScore - c.avgScore;
      return {
        id: `rec-${i}`,
        batch: c.batch,
        skill: c.skill,
        deficit,
        message: recommendationMessage(c.batch, c.skill, deficit),
      };
    });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">TPO Skill Deficit Heatmap</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Contrasts each department batch&apos;s average verified skill scores against the required
        benchmark for upcoming campus hiring drives.
      </p>
      <div className="mt-6">
        <SkillDeficitHeatmap initialCells={cells} initialRecommendations={recommendations} />
      </div>
    </div>
  );
}

function recommendationMessage(batch: string, skill: string, deficit: number): string {
  if (deficit >= 25) {
    return `Critical gap in ${skill} for ${batch}. Schedule an intensive ${skill} bootcamp BEFORE the next campus hiring window and add a targeted assessment.`;
  }
  if (deficit >= 15) {
    return `Significant deficit in ${skill} for ${batch}. Stand up a ${skill} bootcamp or industry guest session before the upcoming campus drive.`;
  }
  return `Minor gap in ${skill} for ${batch}. Optional refresher workshop recommended to secure readiness before campus hiring.`;
}
