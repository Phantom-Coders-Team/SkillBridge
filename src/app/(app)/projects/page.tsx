import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "gray",
  PROPOSED: "amber",
  APPROVED: "green",
  IN_PROGRESS: "blue",
  COMPLETED: "emerald",
  ARCHIVED: "gray",
};

const TYPE_TONE: Record<string, BadgeTone> = {
  CAPSTONE: "indigo",
  MICRO_CONSULTANCY: "orange",
};

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: user.role === "STUDENT" ? { ownerId: user.id } : {},
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={FolderKanban}
        title="Projects"
        subtitle={
          user.role === "STUDENT"
            ? "Your capstone and micro-consultancy projects."
            : "All tracked projects on the portal."
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            user.role === "STUDENT"
              ? "Take on a challenge in the marketplace to start building your first project."
              : "Projects students take on will surface here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} hover className="flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge tone={STATUS_TONE[p.status] ?? "gray"}>
                  {p.status.replaceAll("_", " ")}
                </Badge>
                <Badge tone={TYPE_TONE[p.projectType] ?? "gray"}>
                  {p.projectType.replaceAll("_", " ")}
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{p.title}</h3>
              <p className="mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.description}</p>
              {(p.domain || p.techStack) && (
                <dl className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {p.domain && (
                    <div className="flex gap-1.5"><dt className="font-medium text-slate-400 dark:text-slate-500">Domain:</dt><dd>{p.domain}</dd></div>
                  )}
                  {p.techStack && (
                    <div className="flex gap-1.5"><dt className="font-medium text-slate-400 dark:text-slate-500">Stack:</dt><dd>{p.techStack}</dd></div>
                  )}
                </dl>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}