import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY") {
    return NextResponse.json({ error: "Only industry partners can export applications." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");

  const where = listingId
    ? { id: listingId, companyId: user.id }
    : { companyId: user.id };

  const listings = await prisma.learningProgram.findMany({
    where,
    include: {
      applications: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: { select: { department: true, rollNumber: true, skills: true, phone: true, location: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: Record<string, string | number>[] = [];

  for (const listing of listings) {
    for (const app of listing.applications) {
      rows.push({
        "Opportunity": listing.title,
        "Type": listing.programType.replaceAll("_", " "),
        "Student Name": app.student.name,
        "Email": app.student.email,
        "Roll Number": app.student.profile?.rollNumber ?? "",
        "Department": app.student.profile?.department ?? "",
        "Phone": app.student.profile?.phone ?? "",
        "Location": app.student.profile?.location ?? "",
        "Skills": app.student.profile?.skills ?? "",
        "Status": app.status.replaceAll("_", " "),
        "Applied On": app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-GB") : "",
      });
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No applications to export." }, { status: 404 });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 16 },
    { wch: 20 },
    { wch: 30 },
    { wch: 14 },
    { wch: 16 },
    { wch: 15 },
    { wch: 15 },
    { wch: 28 },
    { wch: 14 },
    { wch: 12 },
  ];

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = listingId && listings.length === 1
    ? `applications-${listings[0].title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.xlsx`
    : "all-applications.xlsx";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
