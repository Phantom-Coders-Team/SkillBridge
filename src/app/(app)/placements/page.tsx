import { redirect } from "next/navigation";
import { Briefcase, IndianRupee } from "lucide-react";
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

export default async function PlacementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pitches = await prisma.jobPitch.findMany({
    where: { status: { in: ["OFFERED", "ACCEPTED", "SHORTLISTED", "PITCHED"] } },
    include: {
      industry: { select: { profile: { select: { companyName: true } } } },
      student: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const offered = pitches.filter((p) => p.status === "OFFERED" || p.status === "ACCEPTED").length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Briefcase}
        title="Placement Tracker"
        subtitle="Every pitch across industry partners, from first contact to signed offer."
      />

      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        {offered} offer{offered !== 1 ? "s" : ""} in motion
      </p>

      {pitches.length === 0 ? (
        <EmptyState icon={Briefcase} title="No active pitches yet" description="Pitches made to students will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-muted bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Company</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Role</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Stipend</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {pitches.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{p.student.name}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{p.industry.profile?.companyName || "—"}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{p.roleDetails || "—"}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                      {p.stipend !== null ? p.stipend.toLocaleString("en-IN") : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[p.status] ?? "gray"}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}