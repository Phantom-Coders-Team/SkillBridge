import { redirect } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";

const COMPANY_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
];

export default async function PartnersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const partners = await prisma.user.findMany({
    where: { role: { in: ["INDUSTRIES", "INDUSTRY"] } },
    include: { profile: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Building2}
        title="Industry Partners"
        subtitle="Corporate collaborators engaged with the university."
      />

      {partners.length === 0 ? (
        <EmptyState icon={Building2} title="No industry partners yet" description="Partner companies will appear once they join the portal." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p, i) => {
            const name = p.profile?.companyName || p.name;
            return (
              <Card key={p.id} hover className="p-5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white ${
                    COMPANY_COLORS[i % COMPANY_COLORS.length]
                  }`}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{name}</h3>
                {p.profile?.designation && <p className="text-sm text-slate-500 dark:text-slate-400">{p.profile.designation}</p>}
                {p.profile?.department && <p className="text-sm text-slate-500 dark:text-slate-400">{p.profile.department}</p>}
                {p.profile?.location && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <MapPin aria-hidden className="size-3.5" />
                    {p.profile.location}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}