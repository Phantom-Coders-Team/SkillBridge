import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.proofOfWork.findMany({
    select: { id: true, publicToken: true, facultySignOff: true, industrySignOff: true },
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });