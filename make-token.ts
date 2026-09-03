import "dotenv/config";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx make-token.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: "7d" },
  );

  console.log(`aip_session=${token}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });