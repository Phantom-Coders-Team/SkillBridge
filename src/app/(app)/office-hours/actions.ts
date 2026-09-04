"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface BookingResult {
  ok: boolean;
  error?: string;
  meetingLink?: string;
}

export async function bookOfficeHour(
  slotId: string,
  sessionFormat: string = "Career Mentorship",
  notes?: string
): Promise<BookingResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { ok: false, error: "Only registered students can book mentorship sessions." };
  }

  const slot = await prisma.mentorSlot.findUnique({
    where: { id: slotId },
    include: {
      industry: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { companyName: true, designation: true } },
        },
      },
    },
  });

  if (!slot) {
    return { ok: false, error: "Mentorship slot not found." };
  }
  if (slot.status !== "AVAILABLE") {
    return { ok: false, error: "This slot has already been booked by another student." };
  }

  const combinedTopic = notes
    ? `${sessionFormat} · ${notes}`
    : `${sessionFormat} · ${slot.topic || "Technical & Career Mentorship"}`;

  // Direct free booking - set studentId and mark as BOOKED
  await prisma.mentorSlot.update({
    where: { id: slot.id },
    data: {
      studentId: user.id,
      status: "BOOKED",
      topic: combinedTopic,
    },
  });

  const meetingLink = `https://meet.jit.si/SkillBridge-Mentor-${slot.id.slice(0, 10)}`;

  // Dispatch confirmation emails & in-app notifications
  try {
    const mentor = slot.industry;
    if (mentor) {
      const timeLabel = new Date(slot.timeSlot).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const mentorDisplayName = mentor.profile?.companyName || mentor.name;
      const { notifyMentorBooking } = await import("@/lib/notifications");

      notifyMentorBooking({
        studentId: user.id,
        studentEmail: user.email,
        studentName: user.name,
        mentorId: mentor.id,
        mentorEmail: mentor.email,
        mentorName: mentorDisplayName,
        topic: combinedTopic,
        timeLabel,
      }).catch((err) => console.error("Failed to dispatch mentor booking emails:", err));
    }
  } catch (err) {
    console.error("Error retrieving mentor for booking notification:", err);
  }

  revalidatePath("/office-hours");
  revalidatePath("/mentor-slots");
  revalidatePath("/dashboard");
  return { ok: true, meetingLink };
}

export async function cancelOfficeHour(slotId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const slot = await prisma.mentorSlot.findUnique({ where: { id: slotId } });
  if (!slot) {
    return { ok: false, error: "Slot not found" };
  }

  // Only the booked student or the industry mentor can cancel
  if (slot.studentId !== user.id && slot.industryId !== user.id) {
    return { ok: false, error: "You are not authorized to cancel this session." };
  }

  await prisma.mentorSlot.update({
    where: { id: slot.id },
    data: {
      studentId: null,
      status: "AVAILABLE",
    },
  });

  revalidatePath("/office-hours");
  revalidatePath("/mentor-slots");
  revalidatePath("/dashboard");
  return { ok: true };
}
