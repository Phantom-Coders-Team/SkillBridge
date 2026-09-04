import { PrismaClient } from "@prisma/client";

// If DATABASE_URL is not set directly, fallback to Vercel Postgres environment variables
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "";
}

const databaseUrl = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isConnectionError =
        err?.code === "P1001" ||
        err?.code === "P1008" ||
        err?.code === "P1017" ||
        err?.message?.includes("Can't reach database server") ||
        err?.message?.includes("ECONNRESET") ||
        err?.message?.includes("ETIMEDOUT");

      if (isConnectionError && attempt <= retries) {
        console.warn(`[Prisma] Connection retry attempt ${attempt}/${retries} after error: ${err.message}`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Query execution failed after maximum retries");
}

