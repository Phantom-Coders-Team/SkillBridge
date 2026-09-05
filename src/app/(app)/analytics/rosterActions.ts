"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface StudentRosterRecord {
  name: string;
  email: string;
  rollNumber?: string;
  department?: string;
  year?: number;
  skills?: string;
}

export async function importStudentRosterAction(records: StudentRosterRecord[]): Promise<{
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}> {
  const user = await requireRole(["INSTITUTION", "INSTITUTIONS", "ACADEMICIAN", "FACULTY", "TPO"]);

  if (!Array.isArray(records) || records.length === 0) {
    return { success: false, importedCount: 0, skippedCount: 0, errors: ["No records provided."] };
  }

  const errors: string[] = [];
  let importedCount = 0;
  let skippedCount = 0;

  // Default secure temporary hash for newly enrolled students
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Student@2026", salt);

  for (const row of records) {
    const email = row.email?.trim().toLowerCase();
    const name = row.name?.trim();

    if (!email || !name) {
      errors.push(`Row missing name or email: ${JSON.stringify(row)}`);
      skippedCount++;
      continue;
    }

    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        skippedCount++;
        continue;
      }

      await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: defaultPasswordHash,
          role: "STUDENT",
          profile: {
            create: {
              rollNumber: row.rollNumber?.trim() || null,
              department: row.department?.trim() || "Computer Science",
              year: Number(row.year) || 4,
              skills: row.skills?.trim() || "Full Stack Development, SQL, Git",
              collegeName: user.name || "University Institute of Technology",
            },
          },
        },
      });

      importedCount++;
    } catch (err) {
      console.error(`Error importing student ${email}:`, err);
      errors.push(`Failed to import ${email}`);
      skippedCount++;
    }
  }

  revalidatePath("/analytics");
  revalidatePath("/dashboard");
  return { success: true, importedCount, skippedCount, errors };
}
