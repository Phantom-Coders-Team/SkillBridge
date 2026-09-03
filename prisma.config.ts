import "dotenv/config";
import { defineConfig } from "prisma/config";

function getEnv(name: string): string | undefined {
  return process.env[name];
}

const databaseUrl = getEnv("DATABASE_URL") ?? "file:./dev.db";

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