import { PrismaClient } from "../generated/client";
export * from "../generated/client";

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
    } catch (err: unknown) {
      attempt++;
      const prismaErr = err as { code?: string; message?: string } | undefined;
      const isConnectionError =
        prismaErr?.code === "P1001" ||
        prismaErr?.code === "P1008" ||
        prismaErr?.code === "P1017" ||
        Boolean(prismaErr?.message?.includes("Can't reach database server")) ||
        Boolean(prismaErr?.message?.includes("ECONNRESET")) ||
        Boolean(prismaErr?.message?.includes("ETIMEDOUT"));

      if (isConnectionError && attempt <= retries) {
        console.warn(`[Prisma] Connection retry attempt ${attempt}/${retries} after error: ${prismaErr?.message ?? String(err)}`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Query execution failed after maximum retries");
}

