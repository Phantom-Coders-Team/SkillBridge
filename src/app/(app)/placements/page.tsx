import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { PlacementTrackerClient, type LivePitchRecord } from "./PlacementTrackerClient";

export default async function PlacementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pitches = await prisma.jobPitch.findMany({
    where: { status: { in: ["OFFERED", "ACCEPTED", "SHORTLISTED", "PITCHED"] } },
    include: {
      industry: { select: { name: true, profile: { select: { companyName: true } } } },
      student: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const livePitches: LivePitchRecord[] = pitches.map((p) => ({
    id: p.id,
    studentName: p.student.name,
    companyName: p.industry.profile?.companyName || p.industry.name || "Industry Partner",
    roleDetails: p.roleDetails,
    stipend: p.stipend,
    status: p.status,
  }));

  const corporatePartners = await prisma.user.findMany({
    where: { role: { in: ["INDUSTRY", "INDUSTRIES"] } },
    select: {
      id: true,
      name: true,
      profile: {
        select: {
          companyName: true,
          location: true,
          designation: true,
        },
      },
      challenges: {
        select: { id: true, title: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Placement Tracker"
        subtitle="Institutional campus recruitment records, yearly placement trends, company hiring statistics, and active offers."
      />

      <PlacementTrackerClient
        livePitches={livePitches}
        corporatePartners={corporatePartners.map((p) => ({
          id: p.id,
          name: p.name,
          companyName: p.profile?.companyName || p.name,
          location: p.profile?.location || null,
          challengesCount: p.challenges.length,
        }))}
      />
    </div>
  );
}