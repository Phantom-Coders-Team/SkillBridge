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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      profile: {
        create: {},
      },
      ...(role === "STUDENT"
        ? {
            ledger: {
              create: { balance: 0 },
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
