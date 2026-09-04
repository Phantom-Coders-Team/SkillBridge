import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Role, SessionUser } from "@/lib/types";

const JWT_SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0
    ? process.env.JWT_SECRET.trim()
    : "skillbridge-secret-key-2026-secure-token";
const SESSION_COOKIE = "aip_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

interface JwtPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function createSession(user: { id: string; name: string; email: string; role: Role }): Promise<void> {
  const normalizedRole = (user.role === "TPO" ? "INSTITUTIONS" : user.role) as Role;
  const token = signToken({
    sub: user.id,
    role: normalizedRole,
    name: user.name,
    email: user.email,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, isActive: true, profile: { select: { avatarUrl: true } } },
  });

  if (!user || !user.isActive) return null;

  const normalizedRole = (user.role === "TPO" ? "INSTITUTIONS" : user.role) as Role;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizedRole,
    avatarUrl: user.profile?.avatarUrl ?? null,
  };
});

export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  const effectiveAllowed = allowed.flatMap((r) =>
    r === "INSTITUTIONS" ? ["INSTITUTIONS", "TPO"] : [r]
  );
  if (!user || !effectiveAllowed.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
