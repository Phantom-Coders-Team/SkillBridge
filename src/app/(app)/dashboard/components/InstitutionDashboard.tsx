import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Landmark,
  Layers,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, Badge, Card, CardHeader, StatCard } from "@/components/ui";

export interface InstitutionDashboardProps {
  name: string;
  dateLabel: string;
  stats: {
    studentsCount: number;
    offersCount: number;
    partnersCount: number;
    syllabiCount: number;
    totalPitches: number;
    shortlistedCount: number;
  };
  recentPitches: Array<{
    id: string;
    priScore: number;
    status: string;
    stipend: number | null;
    roleDetails: string | null;
    createdAt: Date;
    student: {
      name: string;
      profile: {
        department: string | null;
        rollNumber: string | null;
      } | null;
    };
    industry: {
      name: string;
    };
  }>;
  highRiskSyllabi: Array<{
    id: string;
    title: string;
    department: string;
    obsolescenceScore: number;
  }>;
  partnersList: Array<{
    id: string;
    name: string;
    profile: {
      location: string | null;
      department: string | null;
    } | null;
    challenges: Array<{ id: string }>;
  }>;
  benchmarks: Array<{
    id: string;
    department: string;
    skillName: string;
    requiredScore: number;
  }>;
}

export function InstitutionDashboard({
  name,
  dateLabel,
  stats,
  recentPitches,
  highRiskSyllabi,
  partnersList,
  benchmarks,
}: InstitutionDashboardProps) {
  const conversionRate =
    stats.totalPitches > 0
      ? Math.round((stats.offersCount / stats.totalPitches) * 100)
      : 0;

  const getPitchStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "OFFERED":
        return <Badge tone="emerald">Offered</Badge>;
      case "SHORTLISTED":
        return <Badge tone="blue">Shortlisted</Badge>;
      case "ACCEPTED":
        return <Badge tone="green">Accepted</Badge>;
      default:
        return <Badge tone="amber">Pitched</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-r from-surface via-surface to-amber-50/40 p-6 shadow-card dark:border-amber-950/60 dark:from-surface dark:via-surface dark:to-amber-950/20 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-24 bottom-0 hidden size-40 rounded-full bg-indigo-500/10 blur-3xl sm:block" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30">
              <Landmark className="size-3.5" />
              Institution Administration Workspace
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
              <TrendingUp className="size-3.5" />
              {stats.offersCount} Placement Offers Verified
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {dateLabel} — Supervise campus placement conversion, departmental skill deficit heatmaps, and corporate recruiters.
          </p>

          {/* Quick Action Navigation Chips */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/heatmap"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-semibold text-amber-700 shadow-xs transition-all hover:border-amber-300 hover:bg-amber-50 active:scale-[0.98] dark:border-amber-900/60 dark:bg-surface dark:text-amber-300 dark:hover:bg-slate-800"
            >
              <BarChart3 className="size-4 text-amber-600" />
              Skill Deficit Heatmap
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/placements"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-amber-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Target className="size-4 text-emerald-500" />
              Placement Records & Offers
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-amber-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Building2 className="size-4 text-indigo-500" />
              Corporate Partner Directory
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-amber-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Layers className="size-4 text-violet-500" />
              Cohort Analytics & Accreditation
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Primary KPI Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Enrolled Cohort"
          value={stats.studentsCount}
          icon={Users}
          tone="indigo"
          sub="Registered students"
        />
        <StatCard
          label="Placement Offers"
          value={stats.offersCount}
          icon={Briefcase}
          tone="emerald"
          sub={`${conversionRate}% conversion rate`}
        />
        <StatCard
          label="Corporate Partners"
          value={stats.partnersCount}
          icon={Building2}
          tone="violet"
          sub="Active recruiters"
        />
        <StatCard
          label="Syllabi Monitored"
          value={stats.syllabiCount}
          icon={BookOpen}
          tone="amber"
          sub="Obsolescence scanned"
        />
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Placement & Pitch Velocity */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Campus Placement & Hiring Velocity"
              subtitle="Real-time reverse-placement funnel from initial recruiter pitch to signed offer."
              icon={Target}
              action={
                <Link
                  href="/placements"
                  className="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
                >
                  View All Records →
                </Link>
              }
            />

            {/* Funnel Metrics Row */}
            <div className="grid grid-cols-4 border-b border-border-muted bg-surface-subtle/50 p-4 text-center">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Pitches</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{stats.totalPitches}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Shortlisted</p>
                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">{stats.shortlistedCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Offers Made</p>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.offersCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Conversion</p>
                <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">{conversionRate}%</p>
              </div>
            </div>

            {/* Recent Pitches List */}
            <div className="divide-y divide-border-muted">
              {recentPitches.length > 0 ? (
                recentPitches.map((pitch) => (
                  <div key={pitch.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {pitch.student.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({pitch.student.profile?.department ?? "Engineering"})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Recruiter: <strong className="text-slate-700 dark:text-slate-300">{pitch.industry.name}</strong>
                        {pitch.roleDetails && ` • Role: ${pitch.roleDetails}`}
                        {pitch.stipend && ` • ₹${pitch.stipend.toLocaleString("en-IN")}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {getPitchStatusBadge(pitch.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No pitches recorded in current cycle.
                </div>
              )}
            </div>
          </Card>

          {/* Institutional Skill Deficit Heatmap Preview */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Departmental Skill Deficit Heatmap"
              subtitle="Comparison of industry benchmark requirements against current cohort test scores."
              icon={BarChart3}
              action={
                <Link
                  href="/heatmap"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Interactive Heatmap →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {benchmarks.slice(0, 5).map((bm) => (
                <div key={bm.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {bm.skillName}
                      </span>
                      <Badge tone="gray">{bm.department}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Industry benchmark threshold: {bm.requiredScore}% proficiency
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge tone={bm.requiredScore >= 80 ? "amber" : "blue"}>
                      {bm.requiredScore >= 80 ? "High Deficit" : "Moderate"}
                    </Badge>
                    <Link
                      href="/heatmap"
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Corporate Recruiter Network */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Corporate Partner Network"
              subtitle="Registered enterprises providing capstone sponsorships and reverse-placement hiring."
              icon={Building2}
              action={
                <Link
                  href="/partners"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Partner Directory ({stats.partnersCount}) →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {partnersList.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {partner.name}
                    </span>
                    <p className="text-xs text-slate-500">
                      {partner.profile?.location ?? "India"} • {partner.challenges.length} challenges posted
                    </p>
                  </div>

                  <Badge tone="indigo">Active Recruiter</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Accreditation Pro-Tip Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-700 to-indigo-900 p-6 text-white shadow-card">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />

            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <Landmark className="size-4 text-amber-200" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-white">NAAC & NIRF Accreditation</h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-amber-100">
              SkillBridge automated outcome tracking provides verified evidence for NAAC Criterion 1 (Curricular Aspects) and Criterion 5 (Student Progression).
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white/10 p-3 text-xs">
                <p className="font-semibold text-white">NBA OBE Compliance</p>
                <p className="mt-0.5 text-amber-100">Course Outcomes (CO) directly map to Industry Challenge dual grading.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 text-xs">
                <p className="font-semibold text-white">Placement Transparency</p>
                <p className="mt-0.5 text-amber-100">Cryptographically signed Proof of Work and reverse-placement logs.</p>
              </div>
            </div>

            <Link
              href="/analytics"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-amber-900 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Export Accreditation Reports <ArrowRight className="size-3.5" />
            </Link>
          </Card>

          {/* High-Risk Syllabi Alerts */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <AlertTriangle className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Curriculum Gap Alerts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Courses with &gt;40% industry obsolescence.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {highRiskSyllabi.slice(0, 3).map((s) => (
                <div key={s.id} className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {s.title}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      {Math.round(s.obsolescenceScore * 100)}% Gap
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Dept: {s.department} • Requires Board of Studies patch
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/syllabus"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
            >
              Review in AI Syllabus Audit →
            </Link>
          </Card>

          {/* Leadership Best Practices */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <CheckCircle2 className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  TPO Action Plan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drive 100% placement readiness.
                </p>
              </div>
            </div>

            <ol className="mt-4 space-y-3">
              {[
                "Share skill deficit heatmaps with Department Heads.",
                "Incentivize faculty to lead industry capstone lab units.",
                "Onboard alumni networks as corporate mentors.",
                "Review reverse-placement pitch shortlists weekly.",
              ].map((step, idx) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
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
