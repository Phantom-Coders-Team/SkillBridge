import { redirect } from "next/navigation";
import { Building2, Sparkles, Users2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import PostChallengeModal from "./PostChallengeModal";
import MyChallengesModal, { type SerializedChallenge } from "./MyChallengesModal";

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

  const isIndustry = user.role === "INDUSTRIES" || user.role === "INDUSTRY";

  const [challenges, myChallengesRaw] = await Promise.all([
    prisma.industryChallenge.findMany({
      include: {
        industry: { select: { name: true, profile: { select: { companyName: true } } } },
        _count: { select: { applications: true, labUnits: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    isIndustry
      ? prisma.industryChallenge.findMany({
          where: { industryId: user.id },
          include: {
            applications: {
              include: {
                labUnit: {
                  include: {
                    faculty: { select: { name: true, email: true } },
                    members: {
                      include: {
                        student: {
                          select: {
                            name: true,
                            email: true,
                            profile: { select: { department: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            _count: { select: { applications: true, labUnits: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const serializedMyChallenges: SerializedChallenge[] = myChallengesRaw.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    challengeType: c.challengeType,
    domain: c.domain,
    techStack: c.techStack,
    objectives: c.objectives,
    stipend: c.stipend,
    status: c.status,
    deadline: c.deadline ? c.deadline.toISOString() : null,
    rndOnly: c.rndOnly,
    createdAt: c.createdAt.toISOString(),
    applications: c.applications.map((app) => ({
      id: app.id,
      proposal: app.proposal,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      labUnit: {
        id: app.labUnit.id,
        name: app.labUnit.name,
        faculty: app.labUnit.faculty
          ? { name: app.labUnit.faculty.name, email: app.labUnit.faculty.email }
          : null,
        members: app.labUnit.members.map((m) => ({
          student: {
            name: m.student.name,
            email: m.student.email,
            profile: m.student.profile ? { department: m.student.profile.department } : null,
          },
        })),
      },
    })),
    _count: c._count,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Challenge Marketplace"
        subtitle="Capstones, R&D sprints and micro-consultancy gigs posted by industry partners."
        icon={Sparkles}
        actions={
          isIndustry ? (
            <div className="flex flex-wrap items-center gap-2">
              <MyChallengesModal challenges={serializedMyChallenges} />
              <PostChallengeModal />
            </div>
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge tone={TYPE_TONE[c.challengeType] ?? "gray"}>
                    {c.challengeType.replaceAll("_", " ")}
                  </Badge>
                  {isIndustry && c.industryId === user.id && (
                    <Badge tone="purple">Your Posting</Badge>
                  )}
                </div>
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
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{c.stipend.toLocaleString("en-IN")}</span>
                )}
                {c.deadline && (
                  <span>
                    Due {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>

              {c.rndOnly && (
                <span className="mt-3 inline-block w-fit rounded-lg bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
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