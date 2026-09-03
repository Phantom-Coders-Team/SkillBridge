import { redirect } from "next/navigation";
import { Building2, Sparkles, Users2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import PostChallengeForm from "./PostChallengeForm";

const TYPE_TONE: Record<string, BadgeTone> = {
  CAPSTONE: "blue",
  R_AND_D: "purple",
  MICRO_CONSULTANCY: "orange",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  OPEN: "green",
  ASSIGNED: "amber",
  IN_PROGRESS: "blue",
  COMPLETED: "emerald",
  CLOSED: "gray",
};

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const challenges = await prisma.industryChallenge.findMany({
    include: {
      industry: { select: { name: true, profile: { select: { companyName: true } } } },
      _count: { select: { applications: true, labUnits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Challenge Marketplace"
        subtitle="Capstones, R&D sprints and micro-consultancy gigs posted by industry partners."
        icon={Sparkles}
        actions={
          user.role === "INDUSTRY" ? (
            <details className="group relative">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Button size="md" icon={Sparkles}>Post Challenge</Button>
              </summary>
              <div className="animate-pop-in absolute right-0 z-20 mt-2 w-[540px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border-muted bg-surface p-5 shadow-pop">
                <PostChallengeForm />
              </div>
            </details>
          ) : undefined
        }
      />

      {challenges.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No challenges posted yet"
          description="When industry partners post challenges, they'll appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <Card key={c.id} hover className="flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge tone={TYPE_TONE[c.challengeType] ?? "gray"}>
                  {c.challengeType.replaceAll("_", " ")}
                </Badge>
                <Badge tone={STATUS_TONE[c.status] ?? "gray"}>
                  {c.status.replaceAll("_", " ")}
                </Badge>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{c.title}</h3>
              <p className="mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{c.description}</p>

              {(c.domain || c.techStack) && (
                <dl className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {c.domain && (
                    <div className="flex gap-1.5"><dt className="font-medium text-slate-400 dark:text-slate-500">Domain:</dt><dd>{c.domain}</dd></div>
                  )}
                  {c.techStack && (
                    <div className="flex gap-1.5"><dt className="font-medium text-slate-400 dark:text-slate-500">Stack:</dt><dd>{c.techStack}</dd></div>
                  )}
                </dl>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {c.stipend !== null && (
                  <span className="font-semibold text-emerald-700">₹{c.stipend.toLocaleString("en-IN")}</span>
                )}
                {c.deadline && (
                  <span>
                    Due {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>

              {c.rndOnly && (
                <span className="mt-3 inline-block w-fit rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  R&D only — lab unit required
                </span>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-border-muted pt-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 aria-hidden className="size-3.5" />
                  {c.industry.profile?.companyName || c.industry.name}
                  {c._count.labUnits > 0 && (
                    <span className="text-slate-300 dark:text-slate-600">· {c._count.labUnits} team{c._count.labUnits !== 1 ? "s" : ""}</span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users2 aria-hidden className="size-3.5" />
                  {c._count.applications} applicant{c._count.applications !== 1 ? "s" : ""}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}