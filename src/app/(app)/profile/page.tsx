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
        collegeName: true,
        year: true,
        rollNumber: true,
        skills: true,
        avatarUrl: true,
        institutionType: true,
        establishedYear: true,
        websiteUrl: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        naacGrade: true,
        nbaAccredited: true,
        aicteApproved: true,
        principalName: true,
        tpoName: true,
        tpoPhone: true,
        totalStudents: true,
        totalFaculty: true,
        departments: true,
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
    role: ROLE_LABELS[user.role] ?? user.role,
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    department: profile?.department ?? "",
    collegeName: profile?.collegeName ?? "",
    year: profile?.year ?? null,
    rollNumber: profile?.rollNumber ?? "",
    skills: profile?.skills ?? "",
    avatarUrl: profile?.avatarUrl ?? null,
    documents: documents.map((d) => ({ id: d.id, name: d.name, type: d.type, dataUrl: d.dataUrl })),
    institutionType: profile?.institutionType ?? "",
    establishedYear: profile?.establishedYear ?? null,
    websiteUrl: profile?.websiteUrl ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    pincode: profile?.pincode ?? "",
    naacGrade: profile?.naacGrade ?? "",
    nbaAccredited: profile?.nbaAccredited ?? false,
    aicteApproved: profile?.aicteApproved ?? false,
    principalName: profile?.principalName ?? "",
    tpoName: profile?.tpoName ?? "",
    tpoPhone: profile?.tpoPhone ?? "",
    totalStudents: profile?.totalStudents ?? null,
    totalFaculty: profile?.totalFaculty ?? null,
    departments: profile?.departments ?? "",
  };

  return <ProfileClient profile={data} />;
}
