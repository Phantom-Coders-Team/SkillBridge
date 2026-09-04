"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function createMentorSlot(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INDUSTRY" && user.role !== "INDUSTRIES")) {
    return { ok: false, error: "Only industry partners can host mentorship slots." };
  }

  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const durationMins = parseInt((formData.get("durationMins") as string) || "30", 10);
  const topic = (formData.get("topic") as string) || "Technical Mentorship & Career Guidance";

  if (!dateStr || !timeStr) {
    return { ok: false, error: "Please select both date and time." };
  }

  const timeSlot = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(timeSlot.getTime())) {
    return { ok: false, error: "Invalid date/time provided." };
  }

  await prisma.mentorSlot.create({
    data: {
      industryId: user.id,
      timeSlot,
      durationMins,
      topic,
      status: "AVAILABLE",
    },
  });

  revalidatePath("/mentor-slots");
  revalidatePath("/office-hours");
  revalidatePath("/dashboard");
  return { ok: true };
}
