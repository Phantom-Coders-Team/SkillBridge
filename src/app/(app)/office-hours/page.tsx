import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OfficeHoursClient, type BookedSession } from "./OfficeHoursClient";
import type { BookableSlot } from "./BookingModal";

export default async function OfficeHoursPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "STUDENT") {
    const isIndustry = user.role === "INDUSTRY" || user.role === "INDUSTRIES";
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-border-muted bg-surface p-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-card space-y-4">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          1:1 Industry Mentorship and Code Clinics are student-facing booking sessions.
        </p>
        {isIndustry ? (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              As an Industry Partner, you can publish and manage your open consultation slots from your host portal.
            </p>
            <a
              href="/mentor-slots"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Manage &amp; Host Mentor Slots →
            </a>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Switch to the Student persona from the demo switcher below to test booking live clinic slots.
          </p>
        )}
      </div>
    );
  }

  const [availableSlots, userBookings] = await Promise.all([
    prisma.mentorSlot.findMany({
      where: { status: "AVAILABLE" },
      include: { industry: { select: { name: true, profile: { select: { companyName: true, designation: true } } } } },
      orderBy: { timeSlot: "asc" },
      take: 30,
    }),
    prisma.mentorSlot.findMany({
      where: { studentId: user.id },
      include: { industry: { select: { name: true, profile: { select: { companyName: true, designation: true } } } } },
      orderBy: { timeSlot: "desc" },
      take: 20,
    }),
  ]);

  const bookable: BookableSlot[] = availableSlots.map((s) => ({
    id: s.id,
    topic: s.topic,
    timeSlot: s.timeSlot.toISOString(),
    durationMins: s.durationMins,
    companyName: s.industry.profile?.companyName || s.industry.name,
    mentorName: s.industry.name,
    designation: s.industry.profile?.designation || null,
  }));

  const myBooked: BookedSession[] = userBookings.map((s) => ({
    id: s.id,
    topic: s.topic,
    timeSlot: s.timeSlot.toISOString(),
    durationMins: s.durationMins,
    status: s.status,
    mentorName: s.industry.name,
    companyName: s.industry.profile?.companyName || s.industry.name,
    designation: s.industry.profile?.designation || null,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        1:1 Industry Mentorship & Code Clinics
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Connect directly with senior engineers, technical leaders, and hiring managers. Attend live video consultations to review projects, debug code, and sharpen interview readiness.
      </p>
      <OfficeHoursClient slots={bookable} myBookings={myBooked} />
    </div>
  );
}
