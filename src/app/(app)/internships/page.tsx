import { redirect } from "next/navigation";
import { Briefcase, Building2, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import PostOpportunityForm from "./PostOpportunityForm";
import ApplyButton from "./ApplyButton";
import ExportButton from "./ExportButton";
import ApplicantList from "./ApplicantList";
import MatchBadge from "./MatchBadge";
import { MyApplicationsModal } from "./MyApplicationsModal";

const TYPE_TONE: Record<string, BadgeTone> = {
  INTERNSHIP: "blue",
  APPRENTICESHIP: "violet",
  ENTRY_JOB: "emerald",
  TRAINING: "amber",
  CERTIFICATION: "purple",
  WORKSHOP: "cyan",
  MENTORSHIP: "pink",
};

export default async function InternshipsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isIndustry = user.role === "INDUSTRIES" || user.role === "INDUSTRY";

  const [listings, studentProfile, myApplications] = await Promise.all([
    prisma.learningProgram.findMany({
      where: isIndustry ? { companyId: user.id } : undefined,
      include: {
        company: { select: { name: true, profile: { select: { companyName: true } } } },
        applications: {
          include: {
            student: { select: { id: true, name: true, profile: { select: { department: true, rollNumber: true, skills: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    user.role === "STUDENT"
      ? prisma.profile.findUnique({ where: { userId: user.id }, select: { skills: true } })
      : null,
    user.role === "STUDENT"
      ? prisma.internshipApplication.findMany({
          where: { studentId: user.id },
          include: {
            listing: {
              include: {
                company: {
                  select: {
                    name: true,
                    profile: { select: { companyName: true, location: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const mySkills = user.role === "STUDENT"
    ? (studentProfile?.skills ?? "").toLowerCase().split(/[,\s]+/).filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Internships & Opportunities"
        subtitle="Industry internships, apprenticeships, entry-level roles, and learning programs — matched to your skills."
        icon={Briefcase}
        actions={
          isIndustry ? (
            <div className="flex flex-wrap items-center gap-2">
              <ExportButton
                href={`/api/exports/applications`}
                label="Export All to Excel"
                variant="outline"
              />
              <details className="group relative">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                    <Sparkles className="size-4" /> Post Opportunity
                  </span>
                </summary>
                <div className="animate-pop-in absolute right-0 z-20 mt-2 w-[540px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border-muted bg-surface p-5 shadow-pop">
                  <PostOpportunityForm />
                </div>
              </details>
            </div>
          ) : user.role === "STUDENT" ? (
            <MyApplicationsModal
              applications={myApplications}
              mySkills={studentProfile?.skills ?? ""}
            />
          ) : undefined
        }
      />

      {listings.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={isIndustry ? "No opportunities posted yet" : "No opportunities posted yet"}
          description={isIndustry ? "Post your first internship or learning program to get started." : "When industry partners post internships and learning programs, they'll appear here."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const myApplication = user.role === "STUDENT"
              ? l.applications.find((a) => a.studentId === user.id)
              : undefined;
            return (
              <Card key={l.id} hover className="flex flex-col p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge tone={TYPE_TONE[l.programType] ?? "gray"}>
                    {l.programType.replaceAll("_", " ")}
                  </Badge>
                  {l.certification && <Badge tone="green">Certification</Badge>}
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{l.title}</h3>
                <p className="mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {l.description}
                </p>

                {l.skills && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Required skills</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {l.skills.split(",").map((s, i) => (
                        <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(l.duration || l.mode) && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {l.duration && <span>⏱ {l.duration}</span>}
                    {l.mode && <span>📍 {l.mode}</span>}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border-muted pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <Building2 className="size-3.5" />
                    {l.company.profile?.companyName || l.company.name}
                  </span>
                  {user.role === "STUDENT" && <MatchBadge skills={l.skills ?? ""} mySkills={studentProfile?.skills ?? ""} />}
                </div>

                <div className="mt-3">
                  {user.role === "STUDENT" &&
                    (myApplication ? (
                      <div className="text-center text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Applied · {myApplication.status}
                      </div>
                    ) : (
                      <ApplyButton listingId={l.id} />
                    ))}
                  {(user.role === "INDUSTRIES" || user.role === "INDUSTRY") && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      {l.applications.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500">No applicants yet</p>
                      ) : (
                        <ApplicantList listingId={l.id} applicants={l.applications} listingSkills={l.skills ?? ""} />
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
