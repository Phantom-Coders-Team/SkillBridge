import "dotenv/config";
import { defineConfig } from "prisma/config";

function getEnv(name: string): string | undefined {
  return process.env[name];
}

const databaseUrl =
  getEnv("DATABASE_URL") ??
  getEnv("POSTGRES_PRISMA_URL") ??
  getEnv("POSTGRES_URL") ??
  "postgresql://localhost:5432/skillbridge";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});