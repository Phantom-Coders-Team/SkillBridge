import { redirect } from "next/navigation";
import { CalendarClock, Handshake, MapPin, Video } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const SLOT_TONE: Record<string, BadgeTone> = {
  AVAILABLE: "green",
  BOOKED: "blue",
  COMPLETED: "gray",
  CANCELLED: "red",
};

export default async function MentorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const slots = await prisma.mentorSlot.findMany({
    where: { status: "AVAILABLE" },
    include: { industry: { select: { name: true, profile: { select: { companyName: true, designation: true, location: true } } } } },
    orderBy: { timeSlot: "asc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Handshake}
        title="Mentorship Opportunities"
        subtitle="One-on-one sessions hosted by industry professionals."
      />

      {slots.length === 0 ? (
        <EmptyState icon={Handshake} title="No slots right now" description="New mentorship slots will appear here as partners publish them." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <Card key={s.id} hover className="flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                  {(s.industry.profile?.companyName || s.industry.name).slice(0, 2).toUpperCase()}
                </div>
                <Badge tone={SLOT_TONE[s.status] ?? "gray"}>{s.status}</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
                {s.industry.profile?.companyName || s.industry.name}
              </h3>
              {s.industry.profile?.designation && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.industry.profile.designation}</p>
              )}
              {s.topic && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.topic}</p>}
              <div className="mt-auto space-y-1.5 pt-4 text-xs text-slate-500 dark:text-slate-400">
                <p className="inline-flex items-center gap-1.5">
                  <CalendarClock aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                  {new Date(s.timeSlot).toLocaleString()}
                </p>
                <p className="inline-flex items-center gap-1.5">
                  <Video aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                  {s.durationMins} min session
                </p>
                {s.industry.profile?.location && (
                  <p className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                    {s.industry.profile.location}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}