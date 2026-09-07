import { NextResponse } from "next/server";
import { auditSyllabus } from "@/lib/syllabusAudit";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Allow authenticated users to audit syllabus content
  let body: { text?: string; title?: string; department?: string; syllabusId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length < 20) {
    return NextResponse.json(
      { error: "Please provide at least 20 characters of syllabus content." },
      { status: 400 }
    );
  }

  const result = await auditSyllabus(text);
  let savedSyllabusId = body.syllabusId;

  // If a specific syllabusId was provided, update its score
  if (body.syllabusId) {
    try {
      await prisma.syllabus.update({
        where: { id: body.syllabusId },
        data: {
          obsolescenceScore: result.gapPercent / 100,
          lastReviewedAt: new Date(),
        },
      });
    } catch {
      // Record may not exist; proceed
    }
  } else if (body.title && body.department) {
    // Check if matching course already exists or create new tracked record
    const existing = await prisma.syllabus.findFirst({
      where: {
        title: { equals: body.title, mode: "insensitive" },
        department: { equals: body.department, mode: "insensitive" },
      },
    });

    if (existing) {
      savedSyllabusId = existing.id;
      await prisma.syllabus.update({
        where: { id: existing.id },
        data: {
          obsolescenceScore: result.gapPercent / 100,
          lastReviewedAt: new Date(),
        },
      });
    } else {
      const created = await prisma.syllabus.create({
        data: {
          title: body.title,
          department: body.department,
          topicsJson: JSON.stringify(result.topics),
          obsolescenceScore: result.gapPercent / 100,
          lastReviewedAt: new Date(),
        },
      });
      savedSyllabusId = created.id;
    }
  }

  return NextResponse.json({ ok: true, result, syllabusId: savedSyllabusId });
}
