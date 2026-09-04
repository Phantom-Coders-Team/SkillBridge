import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar, Badge, Card, CardHeader, StatCard } from "@/components/ui";

export interface AcademicianDashboardProps {
  name: string;
  dateLabel: string;
  stats: {
    pendingProofsCount: number;
    labUnitsCount: number;
    syllabiCount: number;
    dualGradingsCount: number;
  };
  pendingProofs: Array<{
    id: string;
    description: string | null;
    artifactUrl: string | null;
    createdAt: Date;
    student: {
      id: string;
      name: string;
      email: string;
      profile: {
        department: string | null;
        rollNumber: string | null;
      } | null;
    };
    project: {
      id: string;
      title: string;
      domain: string | null;
    };
  }>;
  topSyllabi: Array<{
    id: string;
    title: string;
    department: string;
    obsolescenceScore: number;
    reviewCount: number;
    topicsJson: string;
  }>;
  labUnits: Array<{
    id: string;
    name: string;
    status: string;
    challenge: {
      title: string;
    } | null;
    members: Array<{
      student: {
        name: string;
      };
    }>;
  }>;
}

export function AcademicianDashboard({
  name,
  dateLabel,
  stats,
  pendingProofs,
  topSyllabi,
  labUnits,
}: AcademicianDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-surface via-surface to-emerald-50/40 p-6 shadow-card dark:border-emerald-950/60 dark:from-surface dark:via-surface dark:to-emerald-950/20 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-24 bottom-0 hidden size-40 rounded-full bg-indigo-500/10 blur-3xl sm:block" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
              <GraduationCap className="size-3.5" />
              Academician Workspace
            </span>
            {stats.pendingProofsCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30">
                <AlertCircle className="size-3.5" />
                {stats.pendingProofsCount} Student Submissions Awaiting Sign-Off
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                <CheckCircle2 className="size-3.5" />
                Sign-offs Up to Date
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {dateLabel} — Guide capstone lab units, evaluate dual-grading submissions, and patch curriculum gaps.
          </p>

          {/* Quick Action Navigation Chips */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/proof-of-work"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.98] dark:border-emerald-900/60 dark:bg-surface dark:text-emerald-300 dark:hover:bg-slate-800"
            >
              <Award className="size-4 text-emerald-600" />
              Review Student Sign-offs
              {stats.pendingProofsCount > 0 && (
                <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] text-white">
                  {stats.pendingProofsCount}
                </span>
              )}
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/syllabus"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-emerald-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <BookOpen className="size-4 text-indigo-500" />
              AI Syllabus Gap Audit
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/lab-units"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-emerald-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FlaskConical className="size-4 text-violet-500" />
              R&D Lab Units
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/dual-grading"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-emerald-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Scale className="size-4 text-amber-500" />
              Dual Grading Console
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Primary KPI Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Pending Sign-Offs"
          value={stats.pendingProofsCount}
          icon={Award}
          tone={stats.pendingProofsCount > 0 ? "amber" : "emerald"}
          sub={stats.pendingProofsCount > 0 ? "Requires review" : "Queue clear"}
        />
        <StatCard
          label="Supervised Lab Units"
          value={stats.labUnitsCount}
          icon={FlaskConical}
          tone="indigo"
          sub="Student R&D units"
        />
        <StatCard
          label="Syllabi Monitored"
          value={stats.syllabiCount}
          icon={BookOpen}
          tone="emerald"
          sub="AI obsolescence tracking"
        />
        <StatCard
          label="Dual Gradings Due"
          value={stats.dualGradingsCount}
          icon={Scale}
          tone="violet"
          sub="Awaiting academic marks"
        />
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action Required: Student Sign-Off Queue */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Student Proof of Work Sign-Off Queue"
              subtitle="Review and validate student project submissions. Dual-sign-off triggers verified badge minting."
              icon={Award}
              action={
                <Link
                  href="/proof-of-work"
                  className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Manage All ({stats.pendingProofsCount}) →
                </Link>
              }
            />

            {pendingProofs.length > 0 ? (
              <div className="divide-y divide-border-muted">
                {pendingProofs.map((proof) => (
                  <div key={proof.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar name={proof.student.name} size="sm" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {proof.student.name}
                          </span>
                          {proof.student.profile?.rollNumber && (
                            <span className="text-xs text-slate-400 font-mono">
                              ({proof.student.profile.rollNumber})
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Project: {proof.project.title}
                        </p>
                        {proof.project.domain && (
                          <span className="text-[11px] text-slate-500">
                            Domain: {proof.project.domain}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {proof.artifactUrl && (
                        <a
                          href={proof.artifactUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border-muted p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          title="View Repository"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                      <Link
                        href="/proof-of-work"
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      >
                        Review & Sign-Off →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Sign-Off Queue Clear!
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  You have reviewed all student submissions. New submissions will appear here automatically.
                </p>
              </div>
            )}
          </Card>

          {/* AI Syllabus Obsolescence Watch */}
          <Card className="overflow-hidden">
            <CardHeader
              title="AI Syllabus Obsolescence & Curriculum Watch"
              subtitle="Monitored courses evaluated by SkillBridge AI against real-time industry hiring stacks."
              icon={BookOpen}
              action={
                <Link
                  href="/syllabus"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Full AI Audit →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {topSyllabi.map((syllabus) => {
                const scorePercent = Math.round(syllabus.obsolescenceScore * 100);
                const isHigh = scorePercent > 40;
                return (
                  <div key={syllabus.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {syllabus.title}
                        </span>
                        <Badge tone={isHigh ? "amber" : "emerald"}>
                          {syllabus.department}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{syllabus.reviewCount} industry reviews</span>
                        <span>•</span>
                        <span>Obsolescence Index: <strong className={isHigh ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>{scorePercent}%</strong></span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="hidden w-28 sm:block">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        href="/syllabus"
                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
                      >
                        Audit & Patch →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Supervised R&D Lab Units */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Supervised R&D Lab Units"
              subtitle="Student engineering squads partnered with corporate sponsors on active capstones."
              icon={FlaskConical}
              action={
                <Link
                  href="/lab-units"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Manage Teams →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {labUnits.map((unit) => (
                <div key={unit.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {unit.name}
                      </span>
                      <Badge tone={unit.status === "ACTIVE" ? "emerald" : "blue"}>
                        {unit.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Challenge: {unit.challenge?.title ?? "General R&D Lab"} • {unit.members.length} student researchers
                    </p>
                  </div>

                  <Link
                    href="/lab-units"
                    className="self-start rounded-lg border border-border-muted px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-center"
                  >
                    View Unit →
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Academician Impact Pro-Tip Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 p-6 text-white shadow-card">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />

            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <Scale className="size-4 text-emerald-200" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-white">Dual-Grading & Accreditation</h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-emerald-100">
              Dual-graded student projects count directly towards NBA Outcome-Based Education (OBE) metrics and NAAC Criteria 1.3. Prompt sign-offs boost your institution&apos;s PRI ranking.
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white/10 p-3 text-xs">
                <p className="font-semibold text-white">Academician Sign-Off Role</p>
                <p className="mt-0.5 text-emerald-100">Validates academic rigor, theory mastery, and architectural soundness.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 text-xs">
                <p className="font-semibold text-white">Industry Sign-Off Role</p>
                <p className="mt-0.5 text-emerald-100">Evaluates deployment readiness, code maintainability, and business utility.</p>
              </div>
            </div>

            <Link
              href="/dual-grading"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Dual Grading Console <ArrowRight className="size-3.5" />
            </Link>
          </Card>

          {/* Academician Development & Sabbaticals */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Building2 className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Corporate Sabbaticals
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Faculty industry immersion programs.
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Top corporate partners (Infosys, TCS, Zoho) sponsor 4-12 week faculty sabbaticals in emerging tech domains like AI/ML and Cloud Infrastructure.
            </p>

            <Link
              href="/faculty-portal"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Browse Faculty Programs →
            </Link>
          </Card>

          {/* Educator Best Practices */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Educator Action Guide
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Steps to maximize student placement rates.
                </p>
              </div>
            </div>

            <ol className="mt-4 space-y-3">
              {[
                "Clear pending sign-offs within 48 hours.",
                "Review syllabus obsolescence index every term.",
                "Assign lab units to real corporate challenges.",
                "Input dual-grading academic marks upon completion.",
              ].map((step, idx) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
