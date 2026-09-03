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
  if (user.role !== "FACULTY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { text?: string; title?: string; department?: string };
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

  if (body.title && body.department) {
    await prisma.syllabus.create({
      data: {
        title: body.title,
        department: body.department,
        topicsJson: JSON.stringify(result.topics),
        obsolescenceScore: result.gapPercent / 100,
        lastReviewedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true, result });
}
