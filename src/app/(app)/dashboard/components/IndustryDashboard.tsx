import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Scale,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Avatar, Badge, Card, CardHeader, StatCard } from "@/components/ui";

export interface IndustryDashboardProps {
  name: string;
  dateLabel: string;
  stats: {
    activeChallengesCount: number;
    pitchesCount: number;
    pendingProofsCount: number;
    mentorSlotsCount: number;
  };
  myChallenges: Array<{
    id: string;
    title: string;
    challengeType: string;
    domain: string | null;
    stipend: number | null;
    status: string;
    applications: Array<{ id: string }>;
    labUnits: Array<{ id: string }>;
  }>;
  topTalent: Array<{
    id: string;
    name: string;
    profile: {
      department: string | null;
      year: number | null;
      skills: string | null;
    } | null;
    assessments: Array<{
      skillName: string;
      score: number;
    }>;
    proofsOfWork: Array<{ id: string }>;
  }>;
  pendingProofs: Array<{
    id: string;
    description: string | null;
    artifactUrl: string | null;
    student: {
      name: string;
      profile: {
        department: string | null;
      } | null;
    };
    project: {
      title: string;
      domain: string | null;
    };
  }>;
  upcomingSlots: Array<{
    id: string;
    timeSlot: Date;
    topic: string | null;
    status: string;
    student: {
      name: string;
    } | null;
  }>;
}

export function IndustryDashboard({
  name,
  dateLabel,
  stats,
  myChallenges,
  topTalent,
  pendingProofs,
  upcomingSlots,
}: IndustryDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-r from-surface via-surface to-purple-50/40 p-6 shadow-card dark:border-purple-950/60 dark:from-surface dark:via-surface dark:to-purple-950/20 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-24 bottom-0 hidden size-40 rounded-full bg-indigo-500/10 blur-3xl sm:block" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200/80 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/30">
              <Building2 className="size-3.5" />
              Industry Partner Workspace
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30">
              <Sparkles className="size-3.5" />
              {stats.activeChallengesCount} Active Challenges Live
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {dateLabel} — Source verified pre-vetted students, sponsor R&D capstones, and conduct mentor clinics.
          </p>

          {/* Quick Action Navigation Chips */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3.5 py-2 text-xs font-semibold text-purple-700 shadow-xs transition-all hover:border-purple-300 hover:bg-purple-50 active:scale-[0.98] dark:border-purple-900/60 dark:bg-surface dark:text-purple-300 dark:hover:bg-slate-800"
            >
              <Sparkles className="size-4 text-purple-600" />
              Post New Challenge
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/reverse-placement"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-purple-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <TrendingUp className="size-4 text-indigo-500" />
              Reverse Placement Leaderboard
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/mentor-slots"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-purple-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <CalendarClock className="size-4 text-emerald-500" />
              Host Mentor Office Hours
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/proof-of-work"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-purple-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Award className="size-4 text-amber-500" />
              Verify Student Sign-offs ({stats.pendingProofsCount})
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Primary KPI Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Active Challenges"
          value={stats.activeChallengesCount}
          icon={Sparkles}
          tone="indigo"
          sub="Live capstone briefs"
        />
        <StatCard
          label="Candidate Pitches"
          value={stats.pitchesCount}
          icon={Briefcase}
          tone="blue"
          sub="Hiring offers sent"
        />
        <StatCard
          label="Pending Work Sign-offs"
          value={stats.pendingProofsCount}
          icon={Award}
          tone={stats.pendingProofsCount > 0 ? "amber" : "emerald"}
          sub={stats.pendingProofsCount > 0 ? "Needs industry review" : "All verified"}
        />
        <StatCard
          label="Open Mentor Slots"
          value={stats.mentorSlotsCount}
          icon={CalendarClock}
          tone="emerald"
          sub="Office hours active"
        />
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Reverse Placement Talent Pipeline */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Reverse Placement Talent Pipeline"
              subtitle="Top verified candidates on SkillBridge with verified project proofs and diagnostic scores."
              icon={TrendingUp}
              action={
                <Link
                  href="/reverse-placement"
                  className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                >
                  Full Leaderboard →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {topTalent.map((candidate) => {
                const skillsList = candidate.profile?.skills
                  ? candidate.profile.skills.split(",").slice(0, 3)
                  : candidate.assessments.slice(0, 3).map((a) => a.skillName);

                return (
                  <div key={candidate.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar name={candidate.name} size="sm" />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {candidate.name}
                          </span>
                          {candidate.profile?.year && (
                            <Badge tone="gray">Year {candidate.profile.year}</Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            {candidate.profile?.department ?? "Engineering"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skillsList.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {candidate.proofsOfWork.length > 0 && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                              ✓ {candidate.proofsOfWork.length} Proofs Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/reverse-placement`}
                        className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
                      >
                        Pitch Candidate →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Active Industry Challenges */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Active Industry Challenges & Capstones"
              subtitle="Problem statements posted to attract capstone squads and pre-hire top performers."
              icon={Sparkles}
              action={
                <Link
                  href="/challenges"
                  className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                >
                  Manage All →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {myChallenges.length > 0 ? (
                myChallenges.map((challenge) => (
                  <div key={challenge.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {challenge.title}
                        </span>
                        <Badge tone="indigo">{challenge.challengeType}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {challenge.labUnits.length} lab units active • {challenge.applications.length} applications
                        {challenge.stipend && ` • ₹${challenge.stipend.toLocaleString("en-IN")} stipend`}
                      </p>
                    </div>

                    <Link
                      href="/challenges"
                      className="self-start rounded-lg border border-border-muted px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-center"
                    >
                      View Submissions →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    No active challenges posted yet.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Post a real-world problem statement to engage university lab units and evaluate students before hiring drives.
                  </p>
                  <Link
                    href="/challenges"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700"
                  >
                    Post Challenge →
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Pending Proofs of Work */}
          {pendingProofs.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader
                title="Student Projects Awaiting Industry Sign-Off"
                subtitle="Validate student capstones to certify industry readiness."
                icon={Award}
                action={
                  <Link
                    href="/proof-of-work"
                    className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                  >
                    View All ({stats.pendingProofsCount}) →
                  </Link>
                }
              />
              <div className="divide-y divide-border-muted">
                {pendingProofs.map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {proof.project.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Student: {proof.student.name} • {proof.student.profile?.department ?? "Engineering"}
                      </p>
                    </div>
                    <Link
                      href={`/proof-of-work/${proof.id}`}
                      className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300"
                    >
                      Verify →
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Industry Recruiter Pro-Tip Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 text-white shadow-card">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />

            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <UserCheck className="size-4 text-purple-200" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-white">Proof-First Hiring Advantage</h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-purple-100">
              Students with verified dual-signed Proof of Work convert to high-retention full-time hires 3.2x faster than resume-screened applicants.
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white/10 p-3 text-xs">
                <p className="font-semibold text-white">Reverse Placement Model</p>
                <p className="mt-0.5 text-purple-100">Directly pitch pre-vetted candidates with locked-in stipend offers without waiting for campus drive dates.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 text-xs">
                <p className="font-semibold text-white">Verified Skill Radar</p>
                <p className="mt-0.5 text-purple-100">See real code-clinic benchmarks and live GitHub repositories.</p>
              </div>
            </div>

            <Link
              href="/reverse-placement"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-purple-800 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Pitch Top Candidates <ArrowRight className="size-3.5" />
            </Link>
          </Card>

          {/* Mentorship & Office Hours */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                <CalendarClock className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Mentor Office Hours
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect 1-on-1 with ambitious student talent.
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Hosting 30-minute office hours helps you spot high-potential candidates months before competitors.
            </p>

            <Link
              href="/mentor-slots"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-500/15 dark:text-purple-300"
            >
              Open New Mentor Slots →
            </Link>
          </Card>

          {/* Industry Best Practices */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <CheckCircle2 className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recruiter Workflow
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Best practices for industry partners.
                </p>
              </div>
            </div>

            <ol className="mt-4 space-y-3">
              {[
                "Post R&D challenges with clear milestone goals.",
                "Review student submissions and sign off on verified code.",
                "Shortlist candidates using the reverse-placement leaderboard.",
                "Host office hours clinics to mentor prospective hires.",
              ].map((step, idx) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
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
