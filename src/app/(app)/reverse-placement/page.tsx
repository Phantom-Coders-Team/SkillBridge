import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStudentPri } from "./actions";
import {
  ReversePlacementClient,
  type Candidate,
  type IncomingPitch,
  type SentPitch,
} from "./ReversePlacementClient";
import { EmptyState, PageHeader } from "@/components/ui";
import type { PriResult } from "@/lib/pri";

export default async function ReversePlacementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "ACADEMICIAN" || user.role === "FACULTY") {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Trophy}
          title="Academician view unavailable"
          description="Reverse campus placement is available to students, institutions, and industry recruiters."
        />
      </div>
    );
  }

  const effectiveRole = user.role === "TPO" ? "INSTITUTIONS" : user.role;
  const isStudent = user.role === "STUDENT";
  const isRecruiter = user.role === "INDUSTRIES" || user.role === "INDUSTRY";

  const [students, incomingPitchesRaw, sentPitchesRaw] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", profile: { isNot: null } },
      include: { profile: true },
    }),
    isStudent
      ? prisma.jobPitch.findMany({
          where: { studentId: user.id },
          include: {
            industry: {
              select: {
                id: true,
                name: true,
                profile: { select: { companyName: true, location: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
    isRecruiter
      ? prisma.jobPitch.findMany({
          where: { industryId: user.id },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                profile: { select: { department: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const candidates: Candidate[] = await Promise.all(
    students.map(async (s) => {
      const pri: PriResult = await computeStudentPri(s.id);
      return {
        id: s.id,
        name: s.name,
        department: s.profile?.department || null,
        year: s.profile?.year || null,
        skills: s.profile?.skills || null,
        avatarUrl: s.profile?.avatarUrl || null,
        pri,
      };
    })
  );

  const sorted = [...candidates].sort((a, b) => b.pri.score - a.pri.score);

  const serializedIncomingPitches: IncomingPitch[] = incomingPitchesRaw.map((p) => ({
    id: p.id,
    roleDetails: p.roleDetails,
    stipend: p.stipend,
    priScore: p.priScore,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    industry: {
      id: p.industry.id,
      name: p.industry.name,
      companyName: p.industry.profile?.companyName || p.industry.name,
      location: p.industry.profile?.location || null,
    },
  }));

  const serializedSentPitches: SentPitch[] = sentPitchesRaw.map((p) => ({
    id: p.id,
    roleDetails: p.roleDetails,
    stipend: p.stipend,
    priScore: p.priScore,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    student: {
      id: p.student.id,
      name: p.student.name,
      department: p.student.profile?.department || null,
    },
  }));

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
      <ReversePlacementClient
        candidates={sorted}
        viewerRole={effectiveRole as any}
        currentUserId={user.id}
        incomingPitches={serializedIncomingPitches}
        sentPitches={serializedSentPitches}
      />
    </div>
  );
}