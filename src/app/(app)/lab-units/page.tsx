import { redirect } from "next/navigation";
import { Building2, FlaskConical } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import LabUnitForms from "./LabUnitForms";

const STATUS_TONE: Record<string, BadgeTone> = {
  FORMING: "amber",
  ACTIVE: "green",
  COMPLETED: "blue",
};

const APP_TONE: Record<string, BadgeTone> = {
  SUBMITTED: "gray",
  SHORTLISTED: "amber",
  SELECTED: "green",
  REJECTED: "red",
};

export default async function LabUnitsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [labUnits, challenges, students] = await Promise.all([
    prisma.labUnit.findMany({
      where: user.role === "ACADEMICIAN" || user.role === "FACULTY" ? { facultyId: user.id } : {},
      include: {
        faculty: { select: { name: true } },
        challenge: { select: { title: true } },
        members: { include: { student: { select: { name: true } } } },
        applications: { include: { challenge: { select: { title: true } } } },
        gradings: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.industryChallenge.findMany({
      select: { id: true, title: true, challengeType: true, rndOnly: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={FlaskConical}
        title="R&D Lab Units"
        subtitle="Academician-led teams for capstone and R&D challenge execution."
      />

      {(user.role === "ACADEMICIAN" || user.role === "FACULTY") && (
        <div className="mb-6">
          <LabUnitForms challenges={challenges} students={students} />
        </div>
      )}

      {labUnits.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No lab units found" description="Lab units spinning up around challenges will appear here." />
      ) : (
        <div className="space-y-4">
          {labUnits.map((lu) => (
            <Card key={lu.id} hover className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{lu.name}</h3>
                  <Badge tone={STATUS_TONE[lu.status] ?? "gray"}>{lu.status}</Badge>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">ID: {lu.id.slice(0, 8)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Academician: <span className="font-medium text-slate-600 dark:text-slate-300">{lu.faculty.name}</span>
              </p>
              {lu.challenge && <p className="text-xs text-slate-500 dark:text-slate-400">Challenge: {lu.challenge.title}</p>}

              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Members ({lu.members.length})</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {lu.members.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                    >
                      <Building2 aria-hidden className="size-3" />
                      {m.student.name}
                    </span>
                  ))}
                </div>
              </div>

              {lu.applications.length > 0 && (
                <div className="mt-3 border-t border-border-muted pt-3">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Applications</p>
                  {lu.applications.map((app) => (
                    <div key={app.id} className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Badge tone={APP_TONE[app.status] ?? "gray"}>{app.status}</Badge>
                      <span className="truncate">{app.challenge.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}