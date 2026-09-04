import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStudentPri } from "./actions";
import { ReversePlacementClient } from "./ReversePlacementClient";
import { EmptyState, PageHeader } from "@/components/ui";
import type { PriResult } from "@/lib/pri";

export default async function ReversePlacementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "FACULTY") {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Trophy}
          title="Faculty view unavailable"
          description="Reverse campus placement is available to students, institutions, and industry recruiters."
        />
      </div>
    );
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT", profile: { isNot: null } },
    include: { profile: true },
  });

  const candidates = await Promise.all(
    students.map(async (s) => {
      const pri: PriResult = await computeStudentPri(s.id);
      return {
        id: s.id,
        name: s.name,
        department: s.profile?.department || null,
        year: s.profile?.year || null,
        pri,
      };
    })
  );

  const sorted = [...candidates].sort((a, b) => b.pri.score - a.pri.score);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Trophy}
        title="Reverse Campus Placement"
        subtitle={
          "When a candidate's Placement Readiness Index exceeds 850, reverse placement unlocks — " +
          "recruiters can pitch job and internship packages directly to top candidates."
        }
      />
      <ReversePlacementClient candidates={sorted} viewerRole={user.role as "STUDENT" | "INDUSTRY" | "INSTITUTIONS"} />
    </div>
  );
}