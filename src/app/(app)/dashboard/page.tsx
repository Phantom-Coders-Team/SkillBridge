import { redirect } from "next/navigation";
import { getCurrentUser, normalizeRole } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { DashboardContent, type DashboardViewProps } from "./DashboardContent";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const effectiveRole = normalizeRole(user.role);
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  switch (effectiveRole) {
    case "STUDENT": {
      const [
        projectsCount,
        proofsCount,
        skillsCount,
        ledger,
        pitchesCount,
        slotsCount,
        recentProofs,
        availableChallenges,
        activeCount,
        staleCount,
        expiredCount,
        applicationsCount,
        acceptedOffersCount,
        recentApplications,
      ] = await withRetry(() => Promise.all([
        prisma.project.count({ where: { ownerId: user.id } }),
        prisma.proofOfWork.count({ where: { studentId: user.id } }),
        prisma.skillAssessment.count({ where: { studentId: user.id } }),
        prisma.tokenLedger.findFirst({ where: { studentId: user.id } }),
        prisma.jobPitch.count({ where: { studentId: user.id } }),
        prisma.mentorSlot.count({ where: { studentId: user.id } }),
        prisma.proofOfWork.findMany({
          where: { studentId: user.id },
          include: {
            project: {
              select: { id: true, title: true, domain: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.industryChallenge.findMany({
          where: { status: "OPEN" },
          include: {
            industry: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
        prisma.skillAssessment.count({ where: { studentId: user.id, decayStatus: "ACTIVE" } }),
        prisma.skillAssessment.count({ where: { studentId: user.id, decayStatus: "STALE" } }),
        prisma.skillAssessment.count({ where: { studentId: user.id, decayStatus: "EXPIRED" } }),
        prisma.internshipApplication.count({ where: { studentId: user.id } }),
        prisma.internshipApplication.count({
          where: { studentId: user.id, status: { in: ["APPROVED", "OFFERED", "ACCEPTED"] } },
        }),
        prisma.internshipApplication.findMany({
          where: { studentId: user.id },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                programType: true,
                company: {
                  select: {
                    name: true,
                    profile: { select: { companyName: true } },
                  },
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 4,
        }),
      ]));

      const data: DashboardViewProps = {
        role: "STUDENT",
        name: user.name,
        dateLabel,
        stats: {
          projectsCount,
          proofsCount,
          skillsCount,
          tokenBalance: ledger?.balance ?? 0,
          pitchesCount,
          slotsCount,
          applicationsCount,
          acceptedOffersCount,
        },
        recentProofs,
        availableChallenges,
        recentApplications,
        skillBreakdown: {
          active: activeCount || 3,
          stale: staleCount || 1,
          expired: expiredCount || 0,
        },
      };

      return <DashboardContent {...data} />;
    }

    case "ACADEMICIAN":
    case "FACULTY": {
      const [
        pendingProofsCount,
        labUnitsCount,
        syllabiCount,
        dualGradingsCount,
        pendingProofs,
        topSyllabi,
        labUnits,
      ] = await Promise.all([
        prisma.proofOfWork.count({ where: { facultySignOff: "PENDING" } }),
        prisma.labUnit.count({
          where: {
            OR: [
              { facultyId: user.id },
              { status: { in: ["ACTIVE", "FORMING"] } },
            ],
          },
        }),
        prisma.syllabus.count(),
        prisma.dualGrading.count({ where: { academicMarks: null } }),
        prisma.proofOfWork.findMany({
          where: { facultySignOff: "PENDING" },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: { department: true, rollNumber: true },
                },
              },
            },
            project: {
              select: { id: true, title: true, domain: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.syllabus.findMany({
          select: {
            id: true,
            title: true,
            department: true,
            obsolescenceScore: true,
            reviewCount: true,
            topicsJson: true,
          },
          orderBy: { obsolescenceScore: "desc" },
          take: 4,
        }),
        prisma.labUnit.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            challenge: {
              select: { title: true },
            },
            members: {
              select: {
                student: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
      ]);

      const data: DashboardViewProps = {
        role: "ACADEMICIAN",
        name: user.name,
        dateLabel,
        stats: {
          pendingProofsCount,
          labUnitsCount,
          syllabiCount,
          dualGradingsCount,
        },
        pendingProofs,
        topSyllabi,
        labUnits,
      };

      return <DashboardContent {...data} />;
    }

    case "INDUSTRY":
    case "INDUSTRIES": {
      const [
        activeChallengesCount,
        pitchesCount,
        pendingProofsCount,
        mentorSlotsCount,
        myChallenges,
        topTalent,
        pendingProofs,
        upcomingSlots,
      ] = await Promise.all([
        prisma.industryChallenge.count({ where: { status: "OPEN" } }),
        prisma.jobPitch.count({ where: { industryId: user.id } }),
        prisma.proofOfWork.count({ where: { industrySignOff: "PENDING" } }),
        prisma.mentorSlot.count({ where: { industryId: user.id } }),
        prisma.industryChallenge.findMany({
          where: {
            OR: [
              { industryId: user.id },
              { status: "OPEN" },
            ],
          },
          select: {
            id: true,
            title: true,
            challengeType: true,
            domain: true,
            stipend: true,
            status: true,
            applications: { select: { id: true } },
            labUnits: { select: { id: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.user.findMany({
          where: { role: "STUDENT" },
          select: {
            id: true,
            name: true,
            profile: {
              select: { department: true, year: true, skills: true },
            },
            assessments: {
              select: { skillName: true, score: true },
              take: 3,
            },
            proofsOfWork: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.proofOfWork.findMany({
          where: { industrySignOff: "PENDING" },
          include: {
            student: {
              select: {
                name: true,
                profile: { select: { department: true } },
              },
            },
            project: {
              select: { title: true, domain: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.mentorSlot.findMany({
          where: { industryId: user.id },
          select: {
            id: true,
            timeSlot: true,
            topic: true,
            status: true,
            student: { select: { name: true } },
          },
          orderBy: { timeSlot: "asc" },
          take: 4,
        }),
      ]);

      const data: DashboardViewProps = {
        role: "INDUSTRY",
        name: user.name,
        dateLabel,
        stats: {
          activeChallengesCount,
          pitchesCount,
          pendingProofsCount,
          mentorSlotsCount,
        },
        myChallenges,
        topTalent,
        pendingProofs,
        upcomingSlots,
      };

      return <DashboardContent {...data} />;
    }

    case "INSTITUTION":
    case "INSTITUTIONS":
    case "TPO":
    default: {
      const [
        studentsCount,
        offersCount,
        partnersCount,
        syllabiCount,
        totalPitches,
        shortlistedCount,
        recentPitches,
        highRiskSyllabi,
        partnersList,
        benchmarks,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.jobPitch.count({ where: { status: "OFFERED" } }),
        prisma.user.count({ where: { role: { in: ["INDUSTRY", "INDUSTRIES"] } } }),
        prisma.syllabus.count(),
        prisma.jobPitch.count(),
        prisma.jobPitch.count({ where: { status: "SHORTLISTED" } }),
        prisma.jobPitch.findMany({
          select: {
            id: true,
            priScore: true,
            status: true,
            stipend: true,
            roleDetails: true,
            createdAt: true,
            student: {
              select: {
                name: true,
                profile: {
                  select: { department: true, rollNumber: true },
                },
              },
            },
            industry: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.syllabus.findMany({
          where: { obsolescenceScore: { gt: 0.25 } },
          select: {
            id: true,
            title: true,
            department: true,
            obsolescenceScore: true,
          },
          orderBy: { obsolescenceScore: "desc" },
          take: 4,
        }),
        prisma.user.findMany({
          where: { role: { in: ["INDUSTRY", "INDUSTRIES"] } },
          select: {
            id: true,
            name: true,
            profile: {
              select: { location: true, department: true },
            },
            challenges: { select: { id: true } },
          },
          take: 5,
        }),
        prisma.hiringBenchmark.findMany({
          select: {
            id: true,
            department: true,
            skillName: true,
            requiredScore: true,
          },
          take: 6,
          orderBy: { requiredScore: "desc" },
        }),
      ]);

      const data: DashboardViewProps = {
        role: "INSTITUTION",
        name: user.name,
        dateLabel,
        stats: {
          studentsCount,
          offersCount,
          partnersCount,
          syllabiCount,
          totalPitches,
          shortlistedCount,
        },
        recentPitches,
        highRiskSyllabi,
        partnersList,
        benchmarks,
      };

      return <DashboardContent {...data} />;
    }
  }
}