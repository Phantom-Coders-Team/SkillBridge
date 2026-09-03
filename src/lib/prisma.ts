import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

function toAbsoluteSqliteUrl(url: string): string {
  if (!url.startsWith("file:")) return url;
  const filePart = url.slice("file:".length);
  if (path.isAbsolute(filePart)) return url;
  return `file:${path.resolve(process.cwd(), "prisma", filePart)}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: toAbsoluteSqliteUrl(databaseUrl),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
