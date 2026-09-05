import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, IndianRupee, Target, FileText, ScrollText, ExternalLink, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const STATUS_TONE: Record<string, BadgeTone> = {
  PITCHED: "gray",
  SHORTLISTED: "blue",
  OFFERED: "green",
  ACCEPTED: "emerald",
  REJECTED: "red",
};

export default async function JobPitchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pitches = await prisma.jobPitch.findMany({
    where:
      user.role === "STUDENT"
        ? { studentId: user.id }
        : user.role === "INDUSTRIES" || user.role === "INDUSTRY"
          ? { industryId: user.id }
          : {},
    include: {
      industry: { select: { profile: { select: { companyName: true } } } },
      student: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              department: true,
              skills: true,
              collegeName: true,
            },
          },
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Briefcase}
        title="Job Pitches"
        subtitle={
          user.role === "STUDENT"
            ? "Role pitches made to you by industry partners, ranked by compatibility."
            : "Role pitches you've made to students, ranked by compatibility."
        }
      />

      {pitches.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job pitches yet"
          description={
            user.role === "INDUSTRIES" || user.role === "INDUSTRY"
              ? "Pitch top students from the reverse-placement leaderboard to start conversations."
              : "When industry partners pitch you a role, it will show up here."
          }
        />
      ) : (
        <div className="space-y-4">
          {pitches.map((p) => {
            const company = p.industry.profile?.companyName || "an industry partner";
            const match = p.priScore > 1 ? Math.min(100, Math.round(p.priScore / 10)) : Math.round(p.priScore * 100);
            const resumeDoc =
              p.student.documents?.find(
                (d) =>
                  d.type?.toLowerCase().includes("resume") ||
                  d.name?.toLowerCase().includes("resume") ||
                  d.type?.toLowerCase().includes("cv")
              ) || p.student.documents?.[0];

            return (
              <Card key={p.id} hover className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{p.roleDetails || "Role"}</h3>
                      <Badge tone={STATUS_TONE[p.status] ?? "gray"}>{p.status}</Badge>
                    </div>
                    {user.role === "STUDENT" ? (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        From {company}
                      </p>
                    ) : (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Candidate:</span>
                        <Link
                          href={`/profile/${p.student.id}`}
                          className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {p.student.name}
                        </Link>
                        {p.student.profile?.department && (
                          <span className="text-xs text-slate-400">({p.student.profile.department})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2">
                    <Target aria-hidden className="size-4 text-indigo-600" />
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{match}%</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">compat</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-3">
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    {p.stipend !== null && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <IndianRupee aria-hidden className="size-4" />
                        {p.stipend.toLocaleString("en-IN")}
                        <span className="font-normal text-slate-400 dark:text-slate-500">/month</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {user.role !== "STUDENT" && (
                      <>
                        {resumeDoc && (
                          <a
                            href={`/api/documents/${resumeDoc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-800 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                          >
                            <FileText className="size-3" />
                            <span>Resume</span>
                            <ExternalLink className="size-2 opacity-60" />
                          </a>
                        )}
                        <Link
                          href={`/portfolio/${p.student.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                        >
                          <ScrollText className="size-3" />
                          <span>Portfolio</span>
                        </Link>
                      </>
                    )}
                    {user.role === "STUDENT" && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Updated {new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}