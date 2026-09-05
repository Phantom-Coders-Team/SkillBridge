import { redirect } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Clock,
  FlaskConical,
  GraduationCap,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getCurrentUser, normalizeRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/ui";
import DualGradingClient from "./DualGradingClient";

export default async function DualGradingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const normalizedRole = normalizeRole(user.role);

  // Fetch dual grading records
  // For maximum utility during judging and real workflows, we fetch records
  // with full relational metadata: challenge, lab unit squad, and evaluators.
  const [gradings, challenges, labUnits] = await Promise.all([
    prisma.dualGrading.findMany({
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            description: true,
            objectives: true,
            techStack: true,
            challengeType: true,
            domain: true,
            stipend: true,
            industry: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
            applications: {
              select: {
                labUnitId: true,
                proposal: true,
                status: true,
              },
            },
          },
        },
        labUnit: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            faculty: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    collegeName: true,
                  },
                },
              },
            },
            members: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: {
                      select: {
                        avatarUrl: true,
                        department: true,
                        year: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        gradedByFaculty: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                collegeName: true,
              },
            },
          },
        },
        gradedByIndustry: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Available challenges for pairing in new grading sessions
    prisma.industryChallenge.findMany({
      select: {
        id: true,
        title: true,
        domain: true,
        stipend: true,
        industry: {
          select: {
            name: true,
            profile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Available lab units for pairing
    prisma.labUnit.findMany({
      select: {
        id: true,
        name: true,
        faculty: { select: { name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Aggregate KPI Statistics
  const totalCount = gradings.length;
  const completedCount = gradings.filter(
    (g) => g.academicMarks !== null && g.jobReadinessScore !== null,
  ).length;

  const academicScores = gradings
    .map((g) => g.academicMarks)
    .filter((s): s is number => s !== null);
  const avgAcademic =
    academicScores.length > 0
      ? Math.round(academicScores.reduce((a, b) => a + b, 0) / academicScores.length)
      : 0;

  const jobScores = gradings
    .map((g) => g.jobReadinessScore)
    .filter((s): s is number => s !== null);
  const avgJobReadiness =
    jobScores.length > 0
      ? Math.round(jobScores.reduce((a, b) => a + b, 0) / jobScores.length)
      : 0;

  // PRI Points Generated across student squads
  const totalPriPoints = gradings.reduce((acc, g) => {
    if (g.academicMarks !== null && g.jobReadinessScore !== null) {
      const avg = (g.academicMarks + g.jobReadinessScore) / 2;
      return acc + Math.round((avg / 100) * 150);
    }
    return acc;
  }, 0);

  const mappedChallenges = challenges.map((c) => ({
    id: c.id,
    title: c.title,
    domain: c.domain,
    stipend: c.stipend,
    companyName: c.industry?.profile?.companyName || c.industry?.name,
  }));

  const mappedLabUnits = labUnits.map((l) => ({
    id: l.id,
    name: l.name,
    facultyName: l.faculty.name,
    memberCount: l._count.members,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Header */}
      <PageHeader
        icon={Scale}
        title="Dual-Grading Matrix & Evaluation Console"
        subtitle="Simultaneous academic rigor & corporate job-readiness evaluation. Dual sign-offs feed student Placement Readiness Index (PRI) and verify cryptographic proof-of-work."
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Deliverables"
          value={totalCount}
          icon={FlaskConical}
          tone="indigo"
          sub={`${completedCount} dual-certified`}
        />
        <StatCard
          label="Avg Academic Rigor"
          value={avgAcademic > 0 ? `${avgAcademic}/100` : "—"}
          icon={GraduationCap}
          tone="blue"
          sub="Faculty evaluation"
        />
        <StatCard
          label="Avg Job Readiness"
          value={avgJobReadiness > 0 ? `${avgJobReadiness}/100` : "—"}
          icon={TrendingUp}
          tone="purple"
          sub="Corporate lead score"
        />
        <StatCard
          label="PRI Points Generated"
          value={`+${totalPriPoints} pts`}
          icon={Sparkles}
          tone="emerald"
          sub="Empowering student squads"
        />
      </div>

      {/* Main Interactive Matrix Client */}
      <DualGradingClient
        gradings={gradings}
        role={normalizedRole}
        userId={user.id}
        availableChallenges={mappedChallenges}
        availableLabUnits={mappedLabUnits}
      />
    </div>
  );
}
