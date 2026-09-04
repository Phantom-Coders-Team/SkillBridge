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
        The GitHub Skill Sync Center is designated for students to connect external code repositories.
      </div>
    );
  }

  const assessments = await prisma.skillAssessment.findMany({
    where: { studentId: user.id },
    select: { skillName: true, score: true },
    orderBy: { score: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={Sparkles}
        title="Sync Your Skills with GitHub"
        subtitle="Connect your GitHub repositories to auto-verify programming skills, language footprints, and commit metrics into your live profile."
      />

      <SyncClient
        existingSkills={assessments.map((a) => ({ skillName: a.skillName, score: a.score }))}
      />
    </div>
  );
}
