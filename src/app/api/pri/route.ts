import { NextResponse } from "next/server";
import { calculatePri } from "@/lib/pri";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    skillScore?: number;
    projectsCompleted?: number;
    proofOfWorkCount?: number;
    dualGradingScore?: number | null;
    tokenBalance?: number;
    challengeCompletions?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = calculatePri({
    skillScore: Number(body.skillScore ?? 0),
    projectsCompleted: Number(body.projectsCompleted ?? 0),
    proofOfWorkCount: Number(body.proofOfWorkCount ?? 0),
    dualGradingScore:
      body.dualGradingScore === null || body.dualGradingScore === undefined
        ? null
        : Number(body.dualGradingScore),
    tokenBalance: Number(body.tokenBalance ?? 0),
    challengeCompletions: Number(body.challengeCompletions ?? 0),
  });

  return NextResponse.json({ ok: true, result });
}
