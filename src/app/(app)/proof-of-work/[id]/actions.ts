"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function signOffProof(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["FACULTY", "INDUSTRY"]);

  const proofId = formData.get("proofId") as string | null;
  const action = formData.get("action") as string | null;
  if (!proofId || !action) return { error: "Invalid request." };

  const proof = await prisma.proofOfWork.findUnique({ where: { id: proofId } });
  if (!proof) return { error: "Proof not found." };

  const token = proof.publicToken ?? randomUUID().slice(0, 12);
  const issuedAt = proof.issuedAt ?? new Date();

  if (user.role === "FACULTY" && action === "faculty_sign") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { facultySignOff: "APPROVED", issuedAt, publicToken: token },
    });
  } else if (user.role === "INDUSTRY" && action === "industry_sign") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { industrySignOff: "APPROVED", issuedAt, publicToken: token },
    });
  } else if (user.role === "FACULTY" && action === "faculty_reject") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { facultySignOff: "REJECTED" },
    });
  } else if (user.role === "INDUSTRY" && action === "industry_reject") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { industrySignOff: "REJECTED" },
    });
  } else {
    return { error: "Invalid action for your role." };
  }

  revalidatePath(`/proof-of-work/${proofId}`);
  return { success: true };
}
