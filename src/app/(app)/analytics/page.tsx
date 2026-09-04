import { redirect } from "next/navigation";
import { BarChart3, Briefcase, FolderKanban, Gauge, Users, School, TrendingDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, StatCard } from "@/components/ui";

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
      <div className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [totalUsers, byRole, totalProjects, byStatus, totalPitches, byPitchStatus, totalSkills, avgSkill] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.project.count(),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.jobPitch.count(),
      prisma.jobPitch.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.skillAssessment.count(),
      prisma.skillAssessment.aggregate({ _avg: { score: true } }),
    ]);

  const maxUsers = Math.max(1, ...byRole.map((r) => r._count._all));
  const maxProjects = Math.max(1, ...byStatus.map((s) => s._count._all));
  const maxPitches = Math.max(1, ...byPitchStatus.map((s) => s._count._all));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={BarChart3}
        title="Platform Analytics"
        subtitle="High-level aggregate metrics across the collaboration portal."
      />

      {(user.role === "ACADEMICIAN" || user.role === "FACULTY") && (
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-6 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-surface">
          <div className="flex items-center gap-3 border-b border-indigo-100 pb-4 dark:border-indigo-900/50">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <School className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Institutional Admin View</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Aggregated skill gap analysis for your students.</p>
            </div>
          </div>
          
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Top Institutional Strengths</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-emerald-700 dark:text-emerald-400">Full Stack Development</span>
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">82% pass rate</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-emerald-700 dark:text-emerald-400">Agile Teamwork</span>
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">76% pass rate</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <TrendingDown className="size-4 text-amber-500" /> Critical Skill Gaps
              </h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-400">Cloud & DevOps</span>
                  <span className="font-medium text-amber-800 dark:text-amber-300">41% fail rate</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-400">Aptitude & Logical Reasoning</span>
                  <span className="font-medium text-amber-800 dark:text-amber-300">35% fail rate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} icon={Users} tone="indigo" />
        <StatCard label="Total Projects" value={totalProjects} icon={FolderKanban} tone="emerald" />
        <StatCard label="Total Pitches" value={totalPitches} icon={Briefcase} tone="amber" />
        <StatCard label="Avg Skill Score" value={`${(avgSkill._avg.score ?? 0).toFixed(0)}%`} icon={Gauge} tone="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Users by role</h2>
          <ul className="mt-4 space-y-3">
            {byRole.map((r) => (
              <li key={r.role}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600 dark:text-slate-300">{r.role.toLowerCase()}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{r._count._all}</span>
                </div>
                <ProgressBar value={r._count._all} max={maxUsers} />
              </li>
            ))}
          </ul>
          {totalSkills > 0 && <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{totalSkills} skill assessments recorded.</p>}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Projects by status</h2>
          <ul className="mt-4 space-y-3">
            {byStatus.map((s) => (
              <li key={s.status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600 dark:text-slate-300">{s.status.toLowerCase().replaceAll("_", " ")}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{s._count._all}</span>
                </div>
                <ProgressBar value={s._count._all} max={maxProjects} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pitches by status</h2>
          <ul className="mt-4 space-y-3">
            {byPitchStatus.map((s) => (
              <li key={s.status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600 dark:text-slate-300">{s.status.toLowerCase()}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{s._count._all}</span>
                </div>
                <ProgressBar value={s._count._all} max={maxPitches} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
