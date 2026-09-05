import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { PartnersClient } from "./PartnersClient";

export const metadata = {
  title: "Industry Corporate Partners | SkillBridge",
  description: "Accredited corporate collaborators engaged in R&D capstones, reverse recruitment, and academic co-innovation.",
};

export default async function PartnersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const partners = await withRetry(() =>
    prisma.user.findMany({
      where: { role: { in: ["INDUSTRIES", "INDUSTRY"] } },
      include: {
        profile: true,
        challenges: {
          select: {
            id: true,
            title: true,
            challengeType: true,
            domain: true,
            stipend: true,
            status: true,
          },
        },
        learningPrograms: {
          select: {
            id: true,
            title: true,
            programType: true,
            duration: true,
            mode: true,
          },
        },
        jobPitches: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  );

  return <PartnersClient partners={partners} currentUserRole={user.role} />;
}