import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import ChallengeMarketplaceClient, {
  type ChallengeItem,
  type LabUnitBrief,
  type StudentBrief,
  type StudentLabMembership,
  type FacultyBrief,
} from "./ChallengeMarketplaceClient";
import type { SerializedChallenge } from "./MyChallengesModal";

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isIndustry = user.role === "INDUSTRY";
  const isAcademician = user.role === "ACADEMICIAN";
  const isStudent = user.role === "STUDENT";
  const isInstitution = user.role === "INSTITUTION";

  // Parallel fetches for general and role-specific data
  const [
    challengesRaw,
    myChallengesRaw,
    academicianLabUnitsRaw,
    availableStudentsRaw,
    studentLabUnitsRaw,
    availableFacultyRaw,
    institutionStatsRaw,
  ] = await Promise.all([
    // 1. All industry challenges
    prisma.industryChallenge.findMany({
      include: {
        industry: {
          select: {
            name: true,
            profile: { select: { companyName: true } },
          },
        },
        _count: { select: { applications: true, labUnits: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // 2. Industry: challenges posted by this industry partner
    isIndustry
      ? prisma.industryChallenge.findMany({
          where: { industryId: user.id },
          include: {
            applications: {
              include: {
                labUnit: {
                  include: {
                    faculty: { select: { name: true, email: true } },
                    members: {
                      include: {
                        student: {
                          select: {
                            name: true,
                            email: true,
                            profile: { select: { department: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            _count: { select: { applications: true, labUnits: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],

    // 3. Academician: lab units supervised by this faculty
    isAcademician
      ? prisma.labUnit.findMany({
          where: { facultyId: user.id },
          include: {
            _count: { select: { members: true } },
            applications: { select: { challengeId: true, status: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],

    // 4. Academician: list of students to invite to lab units
    isAcademician
      ? prisma.user.findMany({
          where: { role: "STUDENT" },
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { department: true } },
          },
          orderBy: { name: "asc" },
        })
      : [],

    // 5. Student: lab units where this student is an active member
    isStudent
      ? prisma.labUnit.findMany({
          where: {
            members: {
              some: { studentId: user.id },
            },
          },
          include: {
            faculty: { select: { name: true } },
            applications: {
              select: {
                challengeId: true,
                status: true,
                proposal: true,
              },
            },
          },
        })
      : [],

    // 6. Student: available faculty mentors to sponsor team
    isStudent
      ? prisma.user.findMany({
          where: {
            OR: [{ role: "ACADEMICIAN" }, { role: "FACULTY" }],
          },
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { department: true } },
          },
          orderBy: { name: "asc" },
        })
      : [],

    // 7. Institution: college-wide metrics
    isInstitution
      ? Promise.all([
          prisma.user.count({ where: { OR: [{ role: "INDUSTRY" }, { role: "INDUSTRIES" }] } }),
          prisma.labUnit.count(),
          prisma.labUnitMember.count(),
        ])
      : null,
  ]);

  // Transform challenges for client
  const challenges: ChallengeItem[] = challengesRaw.map((c) => ({
    id: c.id,
    industryId: c.industryId,
    title: c.title,
    description: c.description,
    challengeType: c.challengeType,
    domain: c.domain,
    techStack: c.techStack,
    objectives: c.objectives,
    stipend: c.stipend,
    status: c.status,
    deadline: c.deadline ? c.deadline.toISOString() : null,
    rndOnly: c.rndOnly,
    createdAt: c.createdAt.toISOString(),
    industry: {
      name: c.industry.name,
      profile: c.industry.profile ? { companyName: c.industry.profile.companyName } : null,
    },
    _count: c._count,
  }));

  // Transform serialized my challenges for industry
  const serializedMyChallenges: SerializedChallenge[] = myChallengesRaw.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    challengeType: c.challengeType,
    domain: c.domain,
    techStack: c.techStack,
    objectives: c.objectives,
    stipend: c.stipend,
    status: c.status,
    deadline: c.deadline ? c.deadline.toISOString() : null,
    rndOnly: c.rndOnly,
    createdAt: c.createdAt.toISOString(),
    applications: c.applications.map((app) => ({
      id: app.id,
      proposal: app.proposal,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      labUnit: {
        id: app.labUnit.id,
        name: app.labUnit.name,
        faculty: app.labUnit.faculty
          ? { name: app.labUnit.faculty.name, email: app.labUnit.faculty.email }
          : null,
        members: app.labUnit.members.map((m) => ({
          student: {
            name: m.student.name,
            email: m.student.email,
            profile: m.student.profile ? { department: m.student.profile.department } : null,
          },
        })),
      },
    })),
    _count: c._count,
  }));

  // Transform academician lab units
  const academicianLabUnits: LabUnitBrief[] = academicianLabUnitsRaw.map((lu) => ({
    id: lu.id,
    name: lu.name,
    status: lu.status,
    membersCount: lu._count.members,
    hasApplied: lu.applications.length > 0,
    challengeId: lu.challengeId,
  }));

  // Transform available students
  const availableStudents: StudentBrief[] = availableStudentsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    department: s.profile?.department ?? null,
  }));

  // Transform student lab memberships
  const studentLabUnits: StudentLabMembership[] = studentLabUnitsRaw.map((slu) => ({
    id: slu.id,
    name: slu.name,
    facultyName: slu.faculty.name,
    challengeId: slu.challengeId,
    applications: slu.applications.map((app) => ({
      challengeId: app.challengeId,
      status: app.status,
      proposal: app.proposal,
    })),
  }));

  // Transform available faculty
  const availableFaculty: FacultyBrief[] = availableFacultyRaw.map((f) => ({
    id: f.id,
    name: f.name,
    email: f.email,
    department: f.profile?.department ?? null,
  }));

  // Institution stats
  const institutionStats = institutionStatsRaw
    ? {
        totalPartners: institutionStatsRaw[0],
        totalCollegeLabUnits: institutionStatsRaw[1],
        totalActiveStudents: institutionStatsRaw[2],
      }
    : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <PageHeader
        title="Challenge Marketplace"
        subtitle={
          isIndustry
            ? "Post real-world industry problem statements, review academic team proposals, and jointly grade student outcomes."
            : isAcademician
            ? "Connect student research lab units with industry capstones, R&D sprints, and funded corporate grants."
            : isStudent
            ? "Tackle real industry challenges, collaborate in faculty-guided lab units, and earn verified proof-of-work."
            : "Monitor corporate challenge sponsorships, department lab unit engagements, and campus research outcomes."
        }
        icon={Sparkles}
      />

      <ChallengeMarketplaceClient
        user={user}
        challenges={challenges}
        myChallengesRaw={serializedMyChallenges}
        academicianLabUnits={academicianLabUnits}
        availableStudents={availableStudents}
        studentLabUnits={studentLabUnits}
        availableFaculty={availableFaculty}
        institutionStats={institutionStats}
      />
    </div>
  );
}