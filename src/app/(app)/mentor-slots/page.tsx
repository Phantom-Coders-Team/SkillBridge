import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MentorSlotsClient } from "./MentorSlotsClient";

export default async function MentorSlotsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isIndustry = user.role === "INDUSTRIES" || user.role === "INDUSTRY";

  const slots = await prisma.mentorSlot.findMany({
    where: isIndustry ? { industryId: user.id } : { studentId: user.id },
    include: {
      student: { select: { name: true, email: true } },
    },
    orderBy: { timeSlot: "asc" },
    take: 50,
  });

  const formattedSlots = slots.map((s) => ({
    id: s.id,
    topic: s.topic,
    timeSlot: s.timeSlot.toISOString(),
    durationMins: s.durationMins,
    status: s.status,
    studentName: s.student?.name || null,
    studentEmail: s.student?.email || null,
  }));

  return <MentorSlotsClient slots={formattedSlots} isIndustry={isIndustry} />;
}