import { redirect } from "next/navigation";
import { BookOpen, Building2, FlaskConical, Users2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, type BadgeTone } from "@/components/ui";
import ApplyToProgramButton from "./ApplyToProgramButton";
import PostFacultyForm from "./PostFacultyForm";

const TYPE_TONE: Record<string, BadgeTone> = {
  FACULTY_INTERNSHIP: "blue",
  INDUSTRIAL_TRAINING: "cyan",
  FDP: "purple",
  CONSULTANCY: "amber",
  RESEARCH: "emerald",
};

export default async function FacultyPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAcademician = user.role === "ACADEMICIAN" || user.role === "FACULTY";
  const isIndustry = user.role === "INDUSTRIES" || user.role === "INDUSTRY";

  const [listings, myApps] = await Promise.all([
    prisma.facultyProgramListing.findMany({
      where: isIndustry ? { companyId: user.id } : undefined,
      include: {
        company: { select: { name: true, profile: { select: { companyName: true } } } },
        applications: { select: { facultyId: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    isAcademician
      ? prisma.facultyProgramApplication.findMany({
          where: { facultyId: user.id },
          include: { listing: true },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Academician Development Portal"
        subtitle="Academician immersions, industrial training, FDPs, consultancy, and collaborative research."
        icon={BookOpen}
        actions={
          isIndustry ? (
            <details className="group relative">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                  <FlaskConical className="size-4" /> Post Program
                </span>
              </summary>
              <div className="animate-pop-in absolute right-0 z-20 mt-2 w-[540px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border-muted bg-surface p-5 shadow-pop">
                <PostFacultyForm />
              </div>
            </details>
          ) : undefined
        }
      />

      {/* Academician: My applications */}
      {isAcademician && myApps.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            My Applications
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myApps.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{a.listing.title}</h3>
                  <Badge tone={a.status === "APPLIED" ? "blue" : a.status === "SELECTED" ? "green" : a.status === "REJECTED" ? "red" : "amber"}>
                    {a.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {isIndustry ? "My programs" : isAcademician ? "Available programs" : "All programs"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => {
          const applied = isAcademician && l.applications.some((a) => a.facultyId === user.id);
          return (
            <Card key={l.id} hover className="flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge tone={TYPE_TONE[l.programType] ?? "gray"}>{l.programType.replaceAll("_", " ")}</Badge>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{l.title}</h3>
              <p className="mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{l.description}</p>

              {l.domain && (
                <dl className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex gap-1.5"><dt className="font-medium text-slate-400 dark:text-slate-500">Domain:</dt><dd>{l.domain}</dd></div>
                </dl>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {l.duration && <span>⏱ {l.duration}</span>}
                {l.location && <span>📍 {l.location}</span>}
                {l.compensation && <span className="font-semibold text-emerald-700 dark:text-emerald-400">{l.compensation}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border-muted pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Building2 className="size-3.5" /> {l.company.profile?.companyName || l.company.name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Users2 className="size-3.5" /> {l.applications.length}
                </span>
              </div>

              <div className="mt-3">
                {isAcademician &&
                  (applied ? (
                    <div className="text-center text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Applied
                    </div>
                  ) : (
                    <ApplyToProgramButton listingId={l.id} />
                  ))}
              </div>
            </Card>
          );
        })}
      </div>

      {listings.length === 0 && (
        <div className="rounded-2xl border border-border-muted bg-surface px-6 py-14 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isIndustry ? "No programs posted yet. Post your first program to get started." : "No programs posted yet."}
          </p>
        </div>
      )}
    </div>
  );
}
