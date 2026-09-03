import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { Sparkles } from "lucide-react";
import { SyncClient } from "./SyncClient";

export default async function SyncPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "STUDENT") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-border-muted bg-surface p-8 text-center text-sm text-slate-500 shadow-card">
        The Skill & DPI Sync Center is designated for students to connect external code repositories and national e-KYC.
      </div>
    );
  }

  const [assessments, apaarItem] = await Promise.all([
    prisma.skillAssessment.findMany({
      where: { studentId: user.id },
      select: { skillName: true, score: true },
      orderBy: { score: "desc" },
      take: 20,
    }),
    prisma.portfolioItem.findFirst({
      where: { studentId: user.id, title: { contains: "APAAR" }, verified: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Sparkles}
        title="Sync Your Skills & DPI Verification"
        subtitle="Connect your GitHub repositories to auto-verify programming skills and link your 12-digit APAAR ID under the National Credit Framework (NCrF)."
      />

      <SyncClient
        existingSkills={assessments.map((a) => ({ skillName: a.skillName, score: a.score }))}
        apaarVerified={Boolean(apaarItem)}
      />
    </div>
  );
}
