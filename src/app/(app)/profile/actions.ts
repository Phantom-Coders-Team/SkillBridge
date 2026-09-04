"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ProfileState {
  success?: boolean;
  error?: string;
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function updateProfileAction(_prevState: ProfileState | null, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const department = String(formData.get("department") || "").trim() || null;
  const collegeName = String(formData.get("collegeName") || "").trim() || null;
  const year = formData.get("year") ? Number(formData.get("year")) : null;
  const rollNumber = String(formData.get("rollNumber") || "").trim() || null;
  const skills = String(formData.get("skills") || "").trim() || null;
  const companyName = String(formData.get("companyName") || "").trim() || null;
  const designation = String(formData.get("designation") || "").trim() || null;

  const institutionType = String(formData.get("institutionType") || "").trim() || null;
  const establishedYear = formData.get("establishedYear") ? Number(formData.get("establishedYear")) : null;
  const websiteUrl = String(formData.get("websiteUrl") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const state = String(formData.get("state") || "").trim() || null;
  const pincode = String(formData.get("pincode") || "").trim() || null;
  const naacGrade = String(formData.get("naacGrade") || "").trim() || null;
  const nbaAccredited = formData.get("nbaAccredited") === "on";
  const aicteApproved = formData.get("aicteApproved") === "on";
  const principalName = String(formData.get("principalName") || "").trim() || null;
  const tpoName = String(formData.get("tpoName") || "").trim() || null;
  const tpoPhone = String(formData.get("tpoPhone") || "").trim() || null;
  const totalStudents = formData.get("totalStudents") ? Number(formData.get("totalStudents")) : null;
  const totalFaculty = formData.get("totalFaculty") ? Number(formData.get("totalFaculty")) : null;
  const departments = String(formData.get("departments") || "").trim() || null;

  const affiliatedUniversity = String(formData.get("affiliatedUniversity") || "").trim() || null;
  const coursesOffered = String(formData.get("coursesOffered") || "").trim() || null;
  const ugcRecognized = formData.get("ugcRecognized") === "on";
  const admissionContact = String(formData.get("admissionContact") || "").trim() || null;
  const admissionPhone = String(formData.get("admissionPhone") || "").trim() || null;
  const averagePlacementRate = formData.get("averagePlacementRate") ? Number(formData.get("averagePlacementRate")) : null;
  const highestPackage = String(formData.get("highestPackage") || "").trim() || null;
  const averagePackage = String(formData.get("averagePackage") || "").trim() || null;
  const facilities = String(formData.get("facilities") || "").trim() || null;
  const motto = String(formData.get("motto") || "").trim() || null;
  const vision = String(formData.get("vision") || "").trim() || null;

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  const avatar = formData.get("avatar") as File | null;
  let avatarUrl: string | null = null;
  let clearAvatar = false;

  if (avatar && avatar.size > 0) {
    if (avatar.size > 2 * 1024 * 1024) {
      return { error: "Image must be under 2 MB." };
    }
    if (!avatar.type.startsWith("image/")) {
      return { error: "Please upload a valid image file." };
    }
    avatarUrl = await fileToBase64(avatar);
  } else if (formData.get("avatar") === "") {
    clearAvatar = true;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      bio,
      phone,
      location,
      department,
      collegeName,
      year,
      rollNumber,
      skills,
      companyName,
      designation,
      institutionType,
      establishedYear,
      websiteUrl,
      address,
      city,
      state,
      pincode,
      naacGrade,
      nbaAccredited,
      aicteApproved,
      principalName,
      tpoName,
      tpoPhone,
      totalStudents,
      totalFaculty,
      departments,
      affiliatedUniversity,
      coursesOffered,
      ugcRecognized,
      admissionContact,
      admissionPhone,
      averagePlacementRate,
      highestPackage,
      averagePackage,
      facilities,
      motto,
      vision,
      ...(avatarUrl ? { avatarUrl } : clearAvatar ? { avatarUrl: null } : {}),
    },
    create: {
      userId: user.id,
      bio,
      phone,
      location,
      department,
      collegeName,
      year,
      rollNumber,
      skills,
      companyName,
      designation,
      institutionType,
      establishedYear,
      websiteUrl,
      address,
      city,
      state,
      pincode,
      naacGrade,
      nbaAccredited,
      aicteApproved,
      principalName,
      tpoName,
      tpoPhone,
      totalStudents,
      totalFaculty,
      departments,
      affiliatedUniversity,
      coursesOffered,
      ugcRecognized,
      admissionContact,
      admissionPhone,
      averagePlacementRate,
      highestPackage,
      averagePackage,
      facilities,
      motto,
      vision,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function uploadDocumentAction(
  _prev: ProfileState | null,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("file") as File | null;
  const type = String(formData.get("type") || "");

  if (!file || file.size === 0) return { error: "Please choose a file." };
  if (file.size > 4 * 1024 * 1024) return { error: "File must be under 4 MB." };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.userDocument.create({
    data: {
      userId: user.id,
      name: file.name,
      type: type || file.type || "document",
      dataUrl,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/portfolio");

  return { success: true };
}

export async function deleteDocumentAction(documentId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.userDocument.deleteMany({ where: { id: documentId, userId: user.id } });
  revalidatePath("/profile");
  revalidatePath("/portfolio");
}
