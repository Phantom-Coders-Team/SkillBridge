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
import { PageHeader } from "@/components/ui";
import type { PriResult } from "@/lib/pri";

export default async function ReversePlacementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Determine effective role
  const effectiveRole: "STUDENT" | "INDUSTRIES" | "INDUSTRY" | "INSTITUTIONS" | "ACADEMICIAN" | "FACULTY" =
    user.role === "TPO" || user.role === "INSTITUTION"
      ? "INSTITUTIONS"
      : user.role === "FACULTY"
      ? "ACADEMICIAN"
      : user.role === "INDUSTRY"
      ? "INDUSTRIES"
      : (user.role as "STUDENT" | "INDUSTRIES" | "INDUSTRY" | "INSTITUTIONS" | "ACADEMICIAN" | "FACULTY");

  const isStudent = user.role === "STUDENT";
  const isRecruiter = user.role === "INDUSTRIES" || user.role === "INDUSTRY";
  const isAcademician = user.role === "ACADEMICIAN" || user.role === "FACULTY";
  const isInstitution = user.role === "INSTITUTIONS" || user.role === "INSTITUTION" || user.role === "TPO";

  // Fetch candidates: Prioritize active students with assessments, projects, proofs, or pitches
  const [activeStudents, moreStudents, currentUserStudent, incomingPitchesRaw, sentPitchesRaw] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        profile: { isNot: null },
        OR: [
          { assessments: { some: {} } },
          { projects: { some: {} } },
          { proofsOfWork: { some: {} } },
          { studentPitches: { some: {} } },
        ],
      },
      include: { profile: true },
      take: 45,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        profile: { isNot: null },
      },
      include: { profile: true },
      take: 20,
      orderBy: { createdAt: "asc" },
    }),
    isStudent
      ? prisma.user.findUnique({
          where: { id: user.id },
          include: { profile: true },
        })
      : null,
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
      : isAcademician || isInstitution
      ? prisma.jobPitch.findMany({
          include: {
            industry: {
              select: {
                id: true,
                name: true,
                profile: { select: { companyName: true, location: true } },
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                profile: { select: { department: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
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

  // Combine and deduplicate candidates, ensuring the current student is included
  const candidateMap = new Map<string, typeof activeStudents[number]>();
  if (currentUserStudent) {
    candidateMap.set(currentUserStudent.id, currentUserStudent);
  }
  for (const s of activeStudents) {
    candidateMap.set(s.id, s);
  }
  for (const s of moreStudents) {
    if (!candidateMap.has(s.id) && candidateMap.size < 55) {
      candidateMap.set(s.id, s);
    }
  }

  const studentList = Array.from(candidateMap.values());

  const candidates: Candidate[] = await Promise.all(
    studentList.map(async (s) => {
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
    priScore: p.priScore > 1 ? Math.round(p.priScore) : Math.round(p.priScore * 1000),
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
    priScore: p.priScore > 1 ? Math.round(p.priScore) : Math.round(p.priScore * 1000),
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    student: {
      id: p.student.id,
      name: p.student.name,
      department: p.student.profile?.department || null,
    },
  }));

  // Fetch logged in user's profile for department info
  const userProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { department: true },
  });
  const userDepartment = userProfile?.department || "Computer Science";

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
        viewerRole={effectiveRole}
        currentUserId={user.id}
        currentUserName={user.name}
        userDepartment={userDepartment}
        incomingPitches={serializedIncomingPitches}
        sentPitches={serializedSentPitches}
      />
    </div>
  );
}