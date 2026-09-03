import { redirect } from "next/navigation";
import { Building2, Clock3, GraduationCap, MapPin, Wallet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import { PostSabbaticalForm } from "./PostSabbaticalForm";

const STATUS_TONE: Record<string, BadgeTone> = {
  OPEN: "green",
  FILLED: "blue",
  CLOSED: "gray",
};

export default async function SabbaticalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await prisma.sabbaticalListing.findMany({
    where: user.role === "INDUSTRY" ? { companyId: user.id } : { status: "OPEN" },
    include: { company: { select: { name: true, profile: { select: { companyName: true, location: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const canPost = user.role === "INDUSTRY";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={GraduationCap}
        title="Faculty Industrial Sabbatical Exchange"
        subtitle="Summer industry immersion opportunities for faculty, posted by partner companies."
        actions={canPost ? <PostSabbaticalForm /> : undefined}
      />

      {listings.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No sabbatical opportunities yet" description="Industry-funded sabbaticals will appear here once posted." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <Card key={l.id} hover className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{l.title}</h3>
                <Badge tone={STATUS_TONE[l.status] ?? "gray"}>{l.status}</Badge>
              </div>
              {canPost && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Building2 aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                  {l.company.profile?.companyName || l.company.name}
                </p>
              )}
              {l.domain && (
                <span className="mt-2 self-start rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {l.domain}
                </span>
              )}
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{l.description}</p>
              <div className="mt-4 flex-1" />
              <dl className="mt-4 space-y-1.5 border-t border-border-muted pt-3 text-xs text-slate-500 dark:text-slate-400">
                {l.duration && (
                  <div className="inline-flex items-center gap-1.5">
                    <Clock3 aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                    <dt className="text-slate-400 dark:text-slate-500">Duration:</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-300">{l.duration}</dd>
                  </div>
                )}
                {l.location && (
                  <div className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                    <dt className="text-slate-400 dark:text-slate-500">Location:</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-300">{l.location}</dd>
                  </div>
                )}
                {l.compensation && (
                  <div className="inline-flex items-center gap-1.5">
                    <Wallet aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                    <dt className="text-slate-400 dark:text-slate-500">Compensation:</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-300">{l.compensation}</dd>
                  </div>
                )}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}