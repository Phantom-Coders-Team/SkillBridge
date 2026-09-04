import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, normalizeRole } from "@/lib/auth";

const DEMO_PERSONAS: Record<string, { email: string; name: string; role: "STUDENT" | "INDUSTRY" | "ACADEMICIAN" | "INSTITUTION" }> = {
  student: {
    email: "aarav.sharma@student.edu",
    name: "Aarav Sharma",
    role: "STUDENT",
  },
  industry: {
    email: "recruit@infosys.com",
    name: "Infosys",
    role: "INDUSTRY",
  },
  academician: {
    email: "rajesh.kumar@faculty.edu",
    name: "Dr. Rajesh Kumar",
    role: "ACADEMICIAN",
  },
  institution: {
    email: "tpo@university.edu",
    name: "Dr. Lakshmi Narayanan",
    role: "INSTITUTION",
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const personaKey = String(body.persona || "").toLowerCase();
    const target = DEMO_PERSONAS[personaKey];

    if (!target) {
      return NextResponse.json({ error: "Invalid persona requested" }, { status: 400 });
    }

    // Find existing user in database by exact email first
    let user = await prisma.user.findUnique({
      where: { email: target.email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: { contains: target.name, mode: "insensitive" } },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: target.role },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    // If user doesn't exist yet, create a default demo user
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: target.name,
          email: target.email,
          role: target.role,
          passwordHash: "$2a$10$dummyHashForDemoUsers1234567890abcdefghijklmno",
          isActive: true,
          profile: {
            create: {
              bio: `Demo ${target.role} user for SIH presentation.`,
              department: target.role === "STUDENT" || target.role === "ACADEMICIAN" ? "Computer Science" : undefined,
              companyName: target.role === "INDUSTRY" ? target.name : undefined,
            },
          },
          ...(target.role === "STUDENT"
            ? {
                ledger: {
                  create: {
                    balance: 150,
                    transactions: {
                      create: {
                        amount: 150,
                        type: "CREDIT",
                        reason: "Demo starter skill tokens",
                      },
                    },
                  },
                },
              }
            : {}),
        },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    const normalizedRole = normalizeRole(user.role);

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
      },
    });
  } catch (err: any) {
    console.error("Demo switch error:", err);
    return NextResponse.json({ error: err.message || "Failed to switch persona" }, { status: 500 });
  }
}
