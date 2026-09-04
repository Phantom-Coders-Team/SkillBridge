import { notFound, redirect } from "next/navigation";
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarClock,
  ClipboardList,
  Coins,
  FolderKanban,
  Handshake,
  Radar,
  Scale,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { DashboardContent, type DashboardData, type QuickLink, type Stat } from "./DashboardContent";

const QUICK_LINKS: Partial<Record<string, QuickLink[]>> = {
  STUDENT: [
    { label: "Challenge Marketplace", href: "/challenges", icon: Sparkles, desc: "Find capstones & R&D gigs" },
    { label: "Skill Radar", href: "/skills", icon: Radar, desc: "Check badge freshness" },
    { label: "Office Hours", href: "/office-hours", icon: CalendarClock, desc: "Book mentor time" },
  ],
  FACULTY: [
    { label: "Syllabus Audit", href: "/syllabus", icon: BookOpen, desc: "Review obsolescence" },
    { label: "R&D Lab Units", href: "/lab-units", icon: Target, desc: "Manage teams" },
    { label: "Proof of Work", href: "/proof-of-work", icon: Award, desc: "Pending sign-offs" },
  ],
  INDUSTRY: [
    { label: "Post Challenge", href: "/challenges", icon: Sparkles, desc: "List a new challenge" },
    { label: "Reverse Placement", href: "/reverse-placement", icon: Target, desc: "Pitch top students" },
    { label: "Proof of Work", href: "/proof-of-work", icon: Award, desc: "Review sign-offs" },
  ],
  INSTITUTIONS: [
    { label: "Placements", href: "/placements", icon: Briefcase, desc: "Track offers" },
    { label: "Skill Heatmap", href: "/heatmap", icon: Radar, desc: "Spot deficits" },
    { label: "Partners", href: "/partners", icon: Users, desc: "Industry directory" },
  ],
};

const ROLE_GUIDES: Partial<Record<string, { title: string; steps: string[] }>> = {
  STUDENT: {
    title: "Your fast-track to job readiness",
    steps: [
      "Take on a challenge or micro-consultancy to grow your proof of work.",
      "Get your work dual sign-offs by faculty and industry partners.",
      "Keep skill badges ACTIVE — run the re-certification diagnostic when they go stale.",
      "Respond quickly to job pitches — early engagement ranks higher on leaderboards.",
      "Spend skill tokens on office hours and code clinics to sharpen weak areas.",
    ],
  },
  FACULTY: {
    title: "Empower your students",
    steps: [
      "Clear pending proof-of-work sign-offs so students can verify their badges.",
      "Run a syllabus obsolescence audit and apply patch modules.",
      "Form lab units and apply them to open industry challenges.",
      "Fill dual-grading records to build credible job-readiness data.",
    ],
  },
  INDUSTRY: {
    title: "Find and grow top talent",
    steps: [
      "Post challenges to attract capstone and R&D teams.",
      "Open mentor slots — high engagement surfaces you to motivated students.",
      "Pitch unlocked candidates from the reverse-placement leaderboard.",
      "Approve proof of work so verified talent rises in the rankings.",
    ],
  },
  INSTITUTIONS: {
    title: "Drive placement outcomes",
    steps: [
      "Watch the skill heatmap to spot deficits early and steer interventions.",
      "Track every pitch as it moves from pitched → shortlisted → offered.",
      "Grow the partner network and keep company profiles fresh.",
      "Review analytics to shape the next placement cycle.",
    ],
  },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let stats: Stat[] = [];

  switch (user.role) {
    case "STUDENT": {
      const [projects, proofs, skills, ledger, pitches, slots] = await Promise.all([
        prisma.project.count({ where: { ownerId: user.id } }),
        prisma.proofOfWork.count({ where: { studentId: user.id } }),
        prisma.skillAssessment.count({ where: { studentId: user.id } }),
        prisma.tokenLedger.findFirst({ where: { studentId: user.id } }),
        prisma.jobPitch.count({ where: { studentId: user.id } }),
        prisma.mentorSlot.count({ where: { studentId: user.id } }),
      ]);
      stats = [
        { label: "My Projects", value: projects, icon: FolderKanban, tone: "indigo" },
        { label: "Proofs of Work", value: proofs, icon: Award, tone: "emerald" },
        { label: "Skills Verified", value: skills, icon: Radar, tone: "violet" },
        { label: "Token Balance", value: ledger?.balance ?? 0, icon: Coins, tone: "amber", sub: "spend on office hours" },
        { label: "Job Pitches", value: pitches, icon: Briefcase, tone: "blue" },
        { label: "Mentorship Sessions", value: slots, icon: Handshake, tone: "cyan" },
      ];
      break;
    }
    case "FACULTY": {
      const [projects, syllabi, assessments, proofs] = await Promise.all([
        prisma.project.count(),
        prisma.syllabus.count(),
        prisma.skillAssessment.count(),
        prisma.proofOfWork.count({ where: { facultySignOff: "PENDING" } }),
      ]);
      stats = [
        { label: "Active Projects", value: projects, icon: FolderKanban, tone: "indigo" },
        { label: "Syllabi Tracked", value: syllabi, icon: BookOpen, tone: "emerald" },
        { label: "Skill Assessments", value: assessments, icon: ClipboardList, tone: "violet" },
        { label: "Pending Sign-offs", value: proofs, icon: Scale, tone: "amber", sub: "needs your review" },
      ];
      break;
    }
    case "INDUSTRY": {
      const [slots, pitches, proofs] = await Promise.all([
        prisma.mentorSlot.count({ where: { industryId: user.id } }),
        prisma.jobPitch.count({ where: { industryId: user.id } }),
        prisma.proofOfWork.count({ where: { industrySignOff: "PENDING" } }),
      ]);
      stats = [
        { label: "Mentor Slots", value: slots, icon: CalendarClock, tone: "indigo" },
        { label: "Job Pitches", value: pitches, icon: Briefcase, tone: "blue" },
        { label: "Pending Sign-offs", value: proofs, icon: Scale, tone: "amber", sub: "needs your review" },
      ];
      break;
    }
    case "TPO":
    case "INSTITUTIONS": {
      const [users, projectsActive, pitchesOffered, syllabi] = await Promise.all([
        prisma.user.count(),
        prisma.project.count({ where: { status: "IN_PROGRESS" } }),
        prisma.jobPitch.count({ where: { status: "OFFERED" } }),
        prisma.syllabus.count(),
      ]);
      stats = [
        { label: "Registered Users", value: users, icon: Users, tone: "indigo" },
        { label: "Active Projects", value: projectsActive, icon: FolderKanban, tone: "emerald" },
        { label: "Offers Made", value: pitchesOffered, icon: Briefcase, tone: "amber" },
        { label: "Syllabi Analyzed", value: syllabi, icon: BookOpen, tone: "violet" },
      ];
      break;
    }
    default: {
      const users = await prisma.user.count();
      stats = [{ label: "Registered Users", value: users, icon: Users, tone: "indigo" }];
      break;
    }
  }

  const effectiveRole = (user.role === "TPO" ? "INSTITUTIONS" : user.role) as Role;

  const data: DashboardData = {
    name: user.name,
    roleLabel: ROLE_LABELS[effectiveRole] ?? "Institutions",
    dateLabel: new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()),
    stats,
    quickLinks: QUICK_LINKS[effectiveRole] ?? QUICK_LINKS.INSTITUTIONS ?? [],
    roleGuide: ROLE_GUIDES[effectiveRole] ?? ROLE_GUIDES.INSTITUTIONS ?? { title: "Getting started", steps: [] },
  };

  return <DashboardContent {...data} />;
}