"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function applyPatchModule(input: {
  syllabusId?: string;
  title: string;
  replaces: string;
  description: string;
  courseTitle?: string;
  department?: string;
}): Promise<{ ok: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") {
    return { ok: false, message: "Only faculty can apply industry patch modules." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const moduleLine = `[${today}] INDUSTRY PATCH MODULE: ${input.title} (replaces: ${input.replaces}) — ${input.description}`;

  if (input.syllabusId) {
    const existing = await prisma.syllabus.findUnique({
      where: { id: input.syllabusId },
    });
    if (!existing) {
      return { ok: false, message: "Syllabus record not found." };
    }
    let topics: string[] = [];
    try {
      topics = JSON.parse(existing.topicsJson);
    } catch {
      topics = [];
    }
    topics = topics.filter((t) => t.toLowerCase() !== input.replaces.toLowerCase());
    topics.unshift(moduleLine);

    await prisma.syllabus.update({
      where: { id: input.syllabusId },
      data: {
        topicsJson: JSON.stringify(topics),
        obsolescenceScore: Math.max(0, existing.obsolescenceScore - 0.15),
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
      },
    });
    revalidatePath("/syllabus");
    return {
      ok: true,
      message: `Applied "${input.title}" — outdated topic replaced and syllabus refreshed.`,
    };
  }

  await prisma.syllabus.create({
    data: {
      title: input.courseTitle || "Ad-Hoc Syllabus Audit",
      department: input.department || "General",
      topicsJson: JSON.stringify([moduleLine]),
      obsolescenceScore: 0.1,
      reviewCount: 1,
      lastReviewedAt: new Date(),
    },
  });
  revalidatePath("/syllabus");
  return {
    ok: true,
    message: `Applied "${input.title}" as a new patched syllabus record.`,
  };
}
