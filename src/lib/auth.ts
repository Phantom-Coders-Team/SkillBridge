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
const PENDING_2FA_COOKIE = "aip_2fa_pending";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const PENDING_2FA_MAX_AGE = 60 * 10; // 10 minutes

interface JwtPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
}

interface Pending2faPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
  is2faPending: true;
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

export function sign2faPendingToken(payload: Omit<Pending2faPayload, "is2faPending">): string {
  return jwt.sign({ ...payload, is2faPending: true }, JWT_SECRET, { expiresIn: "10m" });
}

export function verify2faPendingToken(token: string): Pending2faPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Pending2faPayload;
    if (decoded && decoded.is2faPending) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export async function create2faPendingSession(user: { id: string; name: string; email: string; role: Role }): Promise<void> {
  const normalizedRole = normalizeRole(user.role);
  const token = sign2faPendingToken({
    sub: user.id,
    role: normalizedRole,
    name: user.name,
    email: user.email,
  });
  const cookieStore = await cookies();
  cookieStore.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PENDING_2FA_MAX_AGE,
    path: "/",
  });
}

export async function get2faPendingSession(): Promise<Pending2faPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  return verify2faPendingToken(token);
}

export async function destroy2faPendingSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_2FA_COOKIE);
}

export function normalizeRole(role: string): Role {
  const upper = String(role || "").trim().toUpperCase();
  if (upper === "FACULTY" || upper === "ACADEMICIANS" || upper === "ACADEMICIAN") return "ACADEMICIAN";
  if (upper === "INDUSTRIES" || upper === "INDUSTRY") return "INDUSTRY";
  if (upper === "TPO" || upper === "INSTITUTIONS" || upper === "INSTITUTION") return "INSTITUTION";
  if (upper === "STUDENTS" || upper === "STUDENT") return "STUDENT";
  return upper as Role;
}

export async function createSession(user: { id: string; name: string; email: string; role: Role }): Promise<void> {
  const normalizedRole = normalizeRole(user.role);
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
  // Clear pending 2FA session if any exists
  cookieStore.delete(PENDING_2FA_COOKIE);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(PENDING_2FA_COOKIE);
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

  const normalizedRole = normalizeRole(user.role);

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
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  const normalizedUserRole = normalizeRole(user.role);
  const normalizedAllowed = allowed.map(normalizeRole);
  if (!normalizedAllowed.includes(normalizedUserRole)) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

