import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Radar,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge, Card, CardHeader, StatCard } from "@/components/ui";
import { parseApplicationMessage, formatInterviewDateTime } from "@/lib/interview";

export interface StudentDashboardProps {
  name: string;
  dateLabel: string;
  stats: {
    projectsCount: number;
    proofsCount: number;
    skillsCount: number;
    tokenBalance?: number;
    pitchesCount: number;
    slotsCount: number;
    applicationsCount?: number;
    acceptedOffersCount?: number;
  };
  recentProofs: Array<{
    id: string;
    description: string | null;
    facultySignOff: string;
    industrySignOff: string;
    artifactUrl: string | null;
    createdAt: Date;
    project: {
      id: string;
      title: string;
      domain: string | null;
    };
  }>;
  availableChallenges: Array<{
    id: string;
    title: string;
    challengeType: string;
    domain: string | null;
    techStack: string | null;
    stipend: number | null;
    industry: {
      name: string;
    };
  }>;
  recentApplications?: Array<{
    id: string;
    status: string;
    message?: string | null;
    updatedAt: Date;
    listing: {
      id: string;
      title: string;
      programType: string;
      company: {
        name: string;
        profile?: { companyName?: string | null } | null;
      };
    };
  }>;
  skillBreakdown?: {
    active: number;
    stale: number;
    expired: number;
  };
}

export function StudentDashboard({
  name,
  dateLabel,
  stats,
  recentProofs,
  availableChallenges,
  recentApplications = [],
  skillBreakdown = { active: 3, stale: 1, expired: 0 },
}: StudentDashboardProps) {
  const firstName = name.split(" ")[0];

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return <Badge tone="emerald">Verified</Badge>;
      case "REJECTED":
        return <Badge tone="red">Rejected</Badge>;
      default:
        return <Badge tone="amber">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-surface via-surface to-indigo-50/40 p-6 shadow-card dark:border-indigo-950/60 dark:from-surface dark:via-surface dark:to-indigo-950/20 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-24 bottom-0 hidden size-40 rounded-full bg-violet-500/10 blur-3xl sm:block" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30">
              <GraduationCap className="size-3.5" />
              Student Workspace
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
              <CalendarClock className="size-3.5" />
              {stats.slotsCount ?? 0} Mentorship Sessions Booked
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {dateLabel} — Track your proof-of-work verifications, diagnostic radar, and capstone milestones.
          </p>

          {/* Quick Action Navigation Chips */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-xs transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-[0.98] dark:border-indigo-900/60 dark:bg-surface dark:text-indigo-300 dark:hover:bg-slate-800"
            >
              <Briefcase className="size-4 text-emerald-500" />
              My Applications & Offers ({stats.applicationsCount ?? 0})
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-indigo-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Radar className="size-4 text-indigo-500" />
              Skill Radar & Diagnostic
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/proof-of-work"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-indigo-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Award className="size-4 text-emerald-500" />
              Proof of Work & Badges
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl border border-border-muted bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-indigo-200 hover:bg-slate-50 active:scale-[0.98] dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Sparkles className="size-4 text-violet-500" />
              Challenge Marketplace
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Accepted Offer Alert Banner */}
      {(stats.acceptedOffersCount ?? 0) > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                  🎉 Congratulations! Internship Offer Extended / Accepted
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  Active Offer
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                An industry partner has updated and approved your placement application. Review company details and onboard.
              </p>
            </div>
          </div>
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shrink-0 shadow-sm"
          >
            Track in My Applications <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Stats - 2 Rows of 3 Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="My Applications"
          value={stats.applicationsCount ?? 0}
          icon={Briefcase}
          tone="emerald"
          sub={`${stats.acceptedOffersCount ?? 0} accepted`}
          href="/internships"
        />
        <StatCard
          label="Project Repos"
          value={stats.projectsCount}
          icon={FolderKanban}
          tone="indigo"
          sub="Live repos"
          href="/proof-of-work"
        />
        <StatCard
          label="Proofs of Work"
          value={stats.proofsCount}
          icon={Award}
          tone="emerald"
          sub="Verified badges"
          href="/proof-of-work"
        />
        <StatCard
          label="Skills Tested"
          value={stats.skillsCount}
          icon={Radar}
          tone="violet"
          sub="Radar benchmarks"
          href="/skills"
        />
        <StatCard
          label="Mentor Sessions"
          value={stats.slotsCount ?? 0}
          icon={CalendarClock}
          tone="emerald"
          sub="1:1 video clinics"
          href="/office-hours"
        />
        <StatCard
          label="Job Pitches"
          value={stats.pitchesCount}
          icon={Briefcase}
          tone="blue"
          sub="Recruiter pitches"
          href="/reverse-placement"
        />
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* My Internship Applications Tracker Card */}
          <Card className="overflow-hidden">
            <CardHeader
              title="My Internship Applications & Offer Status"
              subtitle="Real-time recruitment pipeline updates from industry partners."
              icon={Briefcase}
              action={
                <Link
                  href="/internships"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View All in Opportunities ({stats.applicationsCount ?? 0}) →
                </Link>
              }
            />

            {recentApplications.length > 0 ? (
              <div className="divide-y divide-border-muted">
                {recentApplications.map((app) => {
                  const companyName =
                    app.listing.company.profile?.companyName || app.listing.company.name;
                  const isAccepted =
                    app.status === "APPROVED" ||
                    app.status === "OFFERED" ||
                    app.status === "ACCEPTED";
                  const isShortlisted = app.status === "SHORTLISTED";
                  const isInterview = app.status === "INTERVIEW";
                  const isRejected = app.status === "REJECTED";
                  const parsed = parseApplicationMessage(app.message);

                  return (
                    <div
                      key={app.id}
                      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {app.listing.title}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            • {companyName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {app.listing.programType.replaceAll("_", " ")} • Updated{" "}
                          {new Date(app.updatedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {isInterview && parsed?.interview?.date && (
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                            📅 Interview: {formatInterviewDateTime(parsed.interview.date)} ({parsed.interview.mode})
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isAccepted ? (
                          <Badge tone="emerald">Offer Accepted</Badge>
                        ) : isShortlisted ? (
                          <Badge tone="indigo">Shortlisted</Badge>
                        ) : isInterview ? (
                          <Badge tone="purple">Interview Scheduled</Badge>
                        ) : isRejected ? (
                          <Badge tone="red">Not Selected</Badge>
                        ) : (
                          <Badge tone="blue">Under Review</Badge>
                        )}
                        <Link
                          href="/internships"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No active internship applications yet.
                </p>
                <Link
                  href="/internships"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Explore and apply to opportunities →
                </Link>
              </div>
            )}
          </Card>
          {/* Recent Proof of Work Status */}
          <Card className="overflow-hidden">
            <CardHeader
              title="My Proof of Work & Dual Sign-Offs"
              subtitle="Every verified project requires validation from both Academician and Industry partners."
              icon={Award}
              action={
                <Link
                  href="/proof-of-work"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View All ({stats.proofsCount}) →
                </Link>
              }
            />

            {recentProofs.length > 0 ? (
              <div className="divide-y divide-border-muted">
                {recentProofs.map((proof) => (
                  <div key={proof.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {proof.project.title}
                        </span>
                        {proof.project.domain && (
                          <Badge tone="gray">{proof.project.domain}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {proof.description ?? "Capstone project submission for verifiable skill certification."}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-surface-subtle px-2.5 py-1.5">
                        <span className="text-slate-500">Academician:</span>
                        {getStatusBadge(proof.facultySignOff)}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-border-muted bg-surface-subtle px-2.5 py-1.5">
                        <span className="text-slate-500">Industry:</span>
                        {getStatusBadge(proof.industrySignOff)}
                      </div>
                      {proof.artifactUrl && (
                        <a
                          href={proof.artifactUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          title="View Artifact"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No proofs of work submitted yet.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Submit your first project repository to get dual-verified and unlock reverse-placement hiring pitches.
                </p>
                <Link
                  href="/proof-of-work"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Submit Project for Verification →
                </Link>
              </div>
            )}
          </Card>

          {/* Recommended Challenges */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Recommended Industry Challenges"
              subtitle="Solve real-world corporate problem statements to build verified portfolio proofs and land job offers."
              icon={Sparkles}
              action={
                <Link
                  href="/challenges"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Browse Marketplace →
                </Link>
              }
            />

            <div className="divide-y divide-border-muted">
              {availableChallenges.map((challenge) => (
                <div key={challenge.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {challenge.title}
                      </span>
                      <Badge tone="blue">{challenge.challengeType}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sponsored by <strong className="font-medium text-slate-700 dark:text-slate-300">{challenge.industry.name}</strong>
                      {challenge.techStack && ` • Tech: ${challenge.techStack}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {challenge.stipend && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{challenge.stipend.toLocaleString("en-IN")} stipend
                      </span>
                    )}
                    <Link
                      href="/challenges"
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
                    >
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Skill Radar Pro Tip Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-card">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />

            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <Zap className="size-4 text-amber-300" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-white">Skill Radar Health</h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-indigo-100">
              Corporate recruiters filter candidates by active skill badges. Stale badges decay after 90 days and lower your Placement Readiness Index (PRI).
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2 text-xs font-medium">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  Active Badges (Current)
                </span>
                <span className="font-bold">{skillBreakdown.active}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2 text-xs font-medium">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-400" />
                  Stale Badges (Due Diagnostic)
                </span>
                <span className="font-bold">{skillBreakdown.stale}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2 text-xs font-medium">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-400" />
                  Expired Badges
                </span>
                <span className="font-bold">{skillBreakdown.expired}</span>
              </div>
            </div>

            <Link
              href="/skills"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Take Skill Diagnostic <ArrowRight className="size-3.5" />
            </Link>
          </Card>

          {/* Student Fast-Track Checklist */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <CheckCircle2 className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Career Readiness Guide
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rank higher on the reverse-placement leaderboard.
                </p>
              </div>
            </div>

            <ol className="mt-5 space-y-3.5">
              {[
                "Submit project repositories for dual sign-off.",
                "Take the diagnostic test to keep your badges fresh.",
                "Join an R&D lab unit on an open industry challenge.",
                "Book 1:1 office hours and code clinics with industry hiring mentors.",
                "Respond promptly when recruiters pitch you.",
              ].map((step, idx) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
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
