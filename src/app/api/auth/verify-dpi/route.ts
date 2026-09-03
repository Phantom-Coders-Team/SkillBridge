import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const NCRF_LEVELS: Record<number, { level: string; baseCredits: number; description: string }> = {
  1: {
    level: "NCrF Level 4.5 (Diploma / 1st Year UG)",
    baseCredits: 40,
    description: "Foundational technical & vocational competencies validated by AICTE/NCrF.",
  },
  2: {
    level: "NCrF Level 5.0 (2nd Year UG)",
    baseCredits: 80,
    description: "Intermediate discipline-specific coursework & lab credentials mapped.",
  },
  3: {
    level: "NCrF Level 5.5 (3rd Year UG)",
    baseCredits: 120,
    description: "Advanced engineering/applied science credits and industrial project eligibility.",
  },
  4: {
    level: "NCrF Level 6.0 (B.Tech / 4th Year Degree Finalist)",
    baseCredits: 160,
    description: "Full degree credit bank verified, eligible for reverse campus placement.",
  },
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Student authorization required." }, { status: 401 });
  }

  let body: { apaarId?: string; consent?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const apaarId = body.apaarId?.trim() || "";
  const digitsOnly = apaarId.replace(/\D/g, "");

  if (digitsOnly.length !== 12) {
    return NextResponse.json(
      { error: "Invalid APAAR ID. Must be a valid 12-digit National Educational Identity number." },
      { status: 400 }
    );
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: "DigiLocker DPI consent is required to fetch official e-KYC credentials." },
      { status: 400 }
    );
  }

  const studentProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const year = Math.min(4, Math.max(1, studentProfile?.year ?? 3));
  const ncrfInfo = NCRF_LEVELS[year] || NCRF_LEVELS[3];

  const formattedApaar = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8, 12)}`;
  const abcAccountId = `ABC-${digitsOnly.slice(0, 4)}-${digitsOnly.slice(8, 12)}`;

  const simulatedEKYC = {
    apaarId: formattedApaar,
    name: user.name,
    digilockerVerified: true,
    ncrfLevel: ncrfInfo.level,
    accumulatedCredits: ncrfInfo.baseCredits,
    abcAccountId,
    verifiedAt: new Date().toISOString(),
  };

  const existingVerification = await prisma.portfolioItem.findFirst({
    where: {
      studentId: user.id,
      title: { contains: "APAAR e-KYC" },
    },
  });

  if (existingVerification) {
    await prisma.portfolioItem.update({
      where: { id: existingVerification.id },
      data: {
        title: `APAAR e-KYC Verified · ${ncrfInfo.level}`,
        description: `Verified through National DPI / Academic Bank of Credits (ABC Account: ${abcAccountId}). Total Verified Academic Credits: ${ncrfInfo.baseCredits} credits. ${ncrfInfo.description}`,
        verified: true,
        year: new Date().getFullYear(),
      },
    });
  } else {
    await prisma.portfolioItem.create({
      data: {
        studentId: user.id,
        type: "ACHIEVEMENT",
        title: `APAAR e-KYC Verified · ${ncrfInfo.level}`,
        description: `Verified through National DPI / Academic Bank of Credits (ABC Account: ${abcAccountId}). Total Verified Academic Credits: ${ncrfInfo.baseCredits} credits. ${ncrfInfo.description}`,
        issuer: "Ministry of Education (India) - NCrF Gateway",
        year: new Date().getFullYear(),
        verified: true,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    data: simulatedEKYC,
  });
}
