import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OfficeHoursClient } from "./OfficeHoursClient";
import type { BookableSlot } from "./BookingModal";

export default async function OfficeHoursPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "STUDENT") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-border-muted bg-surface p-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-card">
        Skill-token office hours are available to students.
      </div>
    );
  }

  const [slots, ledger] = await Promise.all([
    prisma.mentorSlot.findMany({
      where: { status: "AVAILABLE" },
      include: { industry: { select: { name: true, profile: { select: { companyName: true, designation: true } } } } },
      orderBy: { timeSlot: "asc" },
      take: 30,
    }),
    prisma.tokenLedger.findFirst({ where: { studentId: user.id } }),
  ]);

  const bookable: BookableSlot[] = slots.map((s) => ({
    id: s.id,
    topic: s.topic,
    timeSlot: s.timeSlot.toISOString(),
    durationMins: s.durationMins,
    companyName: s.industry.profile?.companyName || s.industry.name,
    mentorName: s.industry.name,
    designation: s.industry.profile?.designation || null,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Skill-Token Mentor Office Hours</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Spend your earned skill tokens to reserve 15-min code clinic slots or office hours with
        industry mentors.
      </p>
      <OfficeHoursClient slots={bookable} initialBalance={ledger?.balance ?? 0} />
    </div>
  );
}
