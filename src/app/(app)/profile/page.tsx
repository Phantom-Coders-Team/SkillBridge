import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/types";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, documents] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        bio: true,
        phone: true,
        location: true,
        department: true,
        year: true,
        rollNumber: true,
        skills: true,
        avatarUrl: true,
      },
    }),
    prisma.userDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true, dataUrl: true },
    }),
  ]);

  const data = {
    name: user.name,
    email: user.email,
    role: ROLE_LABELS[user.role],
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    department: profile?.department ?? "",
    year: profile?.year ?? null,
    rollNumber: profile?.rollNumber ?? "",
    skills: profile?.skills ?? "",
    avatarUrl: profile?.avatarUrl ?? null,
    documents: documents.map((d) => ({ id: d.id, name: d.name, type: d.type, dataUrl: d.dataUrl })),
  };

  return <ProfileClient profile={data} />;
}
