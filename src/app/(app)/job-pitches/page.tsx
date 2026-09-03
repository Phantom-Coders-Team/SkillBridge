import { redirect } from "next/navigation";
import { Briefcase, IndianRupee, Target } from "lucide-react";
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
        : user.role === "INDUSTRY"
          ? { industryId: user.id }
          : {},
    include: {
      industry: { select: { profile: { select: { companyName: true } } } },
      student: { select: { name: true } },
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
            user.role === "INDUSTRY"
              ? "Pitch top students from the reverse-placement leaderboard to start conversations."
              : "When industry partners pitch you a role, it will show up here."
          }
        />
      ) : (
        <div className="space-y-4">
          {pitches.map((p) => {
            const company = p.industry.profile?.companyName || "an industry partner";
            const match = Math.round(p.priScore * 100);
            return (
              <Card key={p.id} hover className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{p.roleDetails || "Role"}</h3>
                      <Badge tone={STATUS_TONE[p.status] ?? "gray"}>{p.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {user.role === "STUDENT" ? `From ${company}` : `For ${p.student.name}`}
                    </p>
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
                  {user.role === "STUDENT" && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Updated {new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
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