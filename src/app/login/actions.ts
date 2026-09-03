"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  });

  redirect("/dashboard");
}

export async function plainLoginAction(formData: FormData): Promise<void> {
  await loginAction(null, formData);
}
