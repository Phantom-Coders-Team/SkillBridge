import { redirect } from "next/navigation";
import { CalendarClock, CalendarRange } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";

const SLOT_TONE: Record<string, BadgeTone> = {
  AVAILABLE: "green",
  BOOKED: "blue",
  COMPLETED: "gray",
  CANCELLED: "red",
};

export default async function MentorSlotsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const slots = await prisma.mentorSlot.findMany({
    where:
      user.role === "INDUSTRY"
        ? { industryId: user.id }
        : { studentId: user.id },
    include: { student: { select: { name: true } } },
    orderBy: { timeSlot: "asc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={CalendarRange}
        title="Mentor Slots"
        subtitle={
          user.role === "INDUSTRY"
            ? "Session slots you host for student mentorship."
            : "Mentorship sessions booked with industry professionals."
        }
      />

      {slots.length === 0 ? (
        <EmptyState icon={CalendarRange} title="No mentor slots yet" description="Your mentorship sessions will appear here." />
      ) : (
        <div className="space-y-3">
          {slots.map((s) => (
            <Card key={s.id} hover className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <Badge tone={SLOT_TONE[s.status] ?? "gray"}>{s.status}</Badge>
                {s.topic && <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{s.topic}</p>}
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarClock aria-hidden className="size-3.5 text-slate-400 dark:text-slate-500" />
                  {new Date(s.timeSlot).toLocaleString()} · {s.durationMins} min
                </p>
                {s.student && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Student: {s.student.name}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}