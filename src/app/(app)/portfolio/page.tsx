import { redirect } from "next/navigation";
import { Award, BadgeCheck, FileText, FolderOpen, Plus, ScrollText, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import AddPortfolioForm from "./AddPortfolioForm";
import RemovePortfolioItem from "./RemovePortfolioItem";
import AIResumeParseButton from "./AIResumeParseButton";
import PortfolioDocumentsSection from "./PortfolioDocumentsSection";
import SharePortfolioButton from "./SharePortfolioButton";

const TYPE_TONE: Record<string, BadgeTone> = {
  CERTIFICATION: "purple",
  PROJECT: "blue",
  INTERNSHIP: "emerald",
  ACHIEVEMENT: "amber",
  PUBLICATION: "violet",
  VOLUNTEERING: "cyan",
};

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, skills, proofs, items, documents, projects] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.skillAssessment.findMany({ where: { studentId: user.id }, orderBy: { score: "desc" } }),
    prisma.proofOfWork.findMany({
      where: { studentId: user.id },
      include: { project: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.portfolioItem.findMany({ where: { studentId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.userDocument.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const grouped: Record<string, typeof items> = {};
  for (const it of items) {
    (grouped[it.type] ??= []).push(it);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Digital Portfolio"
        subtitle="A living showcase of your verified skills, certifications, projects, and achievements."
        icon={ScrollText}
        actions={
          user.role === "STUDENT" ? (
            <div className="flex flex-wrap items-center gap-3">
              <SharePortfolioButton userId={user.id} />
              <AIResumeParseButton />
              <details className="group relative">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                    <Plus className="size-4" /> Add Item
                  </span>
                </summary>
                <div className="animate-pop-in absolute right-0 z-20 mt-2 w-[460px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border-muted bg-surface p-5 shadow-pop">
                  <AddPortfolioForm />
                </div>
              </details>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Summary card */}
        <Card className="flex flex-col items-center px-6 py-8">
          <Avatar name={user.name} size="lg" />
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile?.department ? `${profile.department}${profile.year ? ` · Year ${profile.year}` : ""}` : "Student"}</p>
          <div className="mt-5 w-full space-y-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Verified skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.length === 0 && <span className="text-xs text-slate-400">No verified skills yet</span>}
                {skills.slice(0, 12).map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <BadgeCheck className="size-3 text-indigo-600 dark:text-indigo-400" /> {s.skillName} · {s.score}%
                  </span>
                ))}
              </div>
            </div>
            {profile?.bio && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{profile.bio}</p>}
          </div>
        </Card>

        <div className="space-y-6">
          {/* Certifications & achievements */}
          <Card>
            <div className="border-b border-border-muted px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Certifications & Achievements</h3>
            </div>
            <div className="p-5">
              {items.length === 0 ? (
                <EmptyState icon={Award} title="No portfolio items yet" description="Add certifications, internships, and achievements to strengthen your profile." />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border-muted p-3">
                      <div className="min-w-0">
                        <Badge tone={TYPE_TONE[item.type] ?? "gray"}>{item.type}</Badge>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        {item.issuer && <p className="text-xs text-slate-500 dark:text-slate-400">{item.issuer}{item.year ? ` · ${item.year}` : ""}</p>}
                        {item.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>}
                      </div>
                      {user.role === "STUDENT" && <RemovePortfolioItem id={item.id} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Proof of work */}
          <Card>
            <div className="border-b border-border-muted px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <FolderOpen className="size-4 text-indigo-500" /> Proof of Work & Projects
              </h3>
            </div>
            <div className="divide-y divide-border-muted">
              {[...proofs, ...projects.map((p) => ({ id: p.id, project: { title: p.title }, description: p.description, status: p.status }))].map((po, i) => (
                <div key={`${po.id}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{po.project.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{po.description}</p>
                  </div>
                  {"status" in po && po.status === "COMPLETED" ? (
                    <Badge tone="green">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="size-3" /> Blockchain Verified</span>
                    </Badge>
                  ) : "facultySignOff" in po ? (
                    <Badge tone={(po as any).facultySignOff === "APPROVED" && (po as any).industrySignOff === "APPROVED" ? "green" : "amber"}>
                      {(po as any).facultySignOff === "APPROVED" && (po as any).industrySignOff === "APPROVED" ? (
                        <span className="flex items-center gap-1.5"><ShieldCheck className="size-3" /> Dual sign-off (Verified)</span>
                      ) : "Pending sign-off"}
                    </Badge>
                  ) : (
                    <Badge tone="gray">{(po as any).status ?? ""}</Badge>
                  )}
                </div>
              ))}
              {proofs.length === 0 && projects.length === 0 && (
                <p className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500">No projects or proof of work yet.</p>
              )}
            </div>
          </Card>

          {/* Documents & Resume */}
          <PortfolioDocumentsSection
            documents={documents}
            canUpload={user.role === "STUDENT"}
          />
        </div>
      </div>
    </div>
  );
}
