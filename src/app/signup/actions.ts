"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, normalizeRole } from "@/lib/auth";
import type { Role } from "@/lib/types";

export interface SignupState {
  error?: string;
}

const ALLOWED_ROLES: Role[] = [
  "STUDENT",
  "ACADEMICIAN",
  "INDUSTRY",
  "INSTITUTION",
  "INDUSTRIES",
  "INSTITUTIONS",
  "FACULTY",
  "TPO",
];

export async function signupAction(_prevState: SignupState | null, formData: FormData): Promise<SignupState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = normalizeRole(String(formData.get("role") || "STUDENT"));

  // Role-specific onboarding fields
  const collegeName = String(formData.get("collegeName") || "").trim() || null;
  const department = String(formData.get("department") || "").trim() || null;
  const yearInput = formData.get("year");
  const year = yearInput && !isNaN(Number(yearInput)) ? Number(yearInput) : null;
  const rollNumber = String(formData.get("rollNumber") || "").trim() || null;
  const skills = String(formData.get("skills") || "").trim() || null;
  const companyName = String(formData.get("companyName") || "").trim() || null;
  const designation = String(formData.get("designation") || "").trim() || null;
  const websiteUrl = String(formData.get("websiteUrl") || "").trim() || null;
  const institutionType = String(formData.get("institutionType") || "").trim() || null;
  const tpoName = String(formData.get("tpoName") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const state = String(formData.get("state") || "").trim() || null;

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return { error: "Invalid role selected." };
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  // Build profile based on role
  const profileData = {
    collegeName,
    department,
    year: role === "STUDENT" ? year : null,
    rollNumber: role === "STUDENT" ? rollNumber : null,
    skills,
    companyName: (role === "INDUSTRY" || role === "INDUSTRIES") ? companyName : null,
    designation,
    websiteUrl,
    institutionType: (role === "INSTITUTION" || role === "INSTITUTIONS") ? institutionType : null,
    tpoName: (role === "INSTITUTION" || role === "INSTITUTIONS") ? tpoName : null,
    location,
    city,
    state,
  };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      profile: {
        create: profileData,
      },
      ...(role === "STUDENT"
        ? {
            ledger: {
              create: {
                balance: 100,
                transactions: {
                  create: {
                    amount: 100,
                    type: "CREDIT",
                    reason: "Welcome onboarding skill tokens",
                  },
                },
              },
            },
          }
        : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  });

  redirect("/dashboard");
}
