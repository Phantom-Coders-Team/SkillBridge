"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function signOffProof(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole(["ACADEMICIAN", "FACULTY", "INDUSTRIES", "INDUSTRY"]);

  const proofId = formData.get("proofId") as string | null;
  const action = formData.get("action") as string | null;
  if (!proofId || !action) return { error: "Invalid request." };

  const proof = await prisma.proofOfWork.findUnique({ where: { id: proofId } });
  if (!proof) return { error: "Proof not found." };

  const token = proof.publicToken ?? randomUUID().slice(0, 12);
  const issuedAt = proof.issuedAt ?? new Date();

  const isAcademician = user.role === "ACADEMICIAN" || user.role === "FACULTY";
  const isIndustry = user.role === "INDUSTRIES" || user.role === "INDUSTRY";

  if (isAcademician && action === "faculty_sign") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { facultySignOff: "APPROVED", issuedAt, publicToken: token },
    });
  } else if (isIndustry && action === "industry_sign") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { industrySignOff: "APPROVED", issuedAt, publicToken: token },
    });
  } else if (isAcademician && action === "faculty_reject") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { facultySignOff: "REJECTED" },
    });
  } else if (isIndustry && action === "industry_reject") {
    await prisma.proofOfWork.update({
      where: { id: proofId },
      data: { industrySignOff: "REJECTED" },
    });
  } else {
    return { error: "Invalid action for your role." };
  }

  // If dual-attestation is now complete, mint verifiable blockchain block
  const updatedProof = await prisma.proofOfWork.findUnique({
    where: { id: proofId },
    include: { blockchainTx: true },
  });

  if (
    updatedProof &&
    updatedProof.facultySignOff === "APPROVED" &&
    updatedProof.industrySignOff === "APPROVED" &&
    !updatedProof.blockchainTx
  ) {
    const blockIndex = (await prisma.blockchainTransaction.count()) + 1;
    const prevTx = await prisma.blockchainTransaction.findFirst({
      orderBy: { blockIndex: "desc" },
    });
    const prevHash = prevTx?.blockHash ?? "0000000000000000000000000000000000000000000000000000000000000000";
    const crypto = await import("crypto");
    const dataToHash = `${blockIndex}-${proofId}-${updatedProof.publicToken}-${prevHash}-${Date.now()}`;
    const blockHash = "0x" + crypto.createHash("sha256").update(dataToHash).digest("hex");
    const merkleRoot = "0x" + crypto.createHash("sha256").update(`${updatedProof.id}-${updatedProof.studentId}`).digest("hex");

    await prisma.blockchainTransaction.create({
      data: {
        proofId: updatedProof.id,
        blockIndex,
        blockHash,
        prevHash,
        merkleRoot,
        consensusState: "COMMITTED",
        nodeSignatures: 4,
        validatorNodes: JSON.stringify([
          "node-primary-institution",
          "node-industry-partner",
          "node-aicte-gateway",
          "node-consortium-validator",
        ]),
      },
    });
  }

  // Credit tokens to student upon verified sign-off
  if (action === "faculty_sign" || action === "industry_sign") {
    let studentLedger = await prisma.tokenLedger.findFirst({
      where: { studentId: proof.studentId },
    });
    if (!studentLedger) {
      studentLedger = await prisma.tokenLedger.create({
        data: { studentId: proof.studentId, balance: 100 },
      });
    }

    const tokenAward = action === "faculty_sign" ? 25 : 35;
    await prisma.tokenLedger.update({
      where: { id: studentLedger.id },
      data: { balance: { increment: tokenAward } },
    });
    await prisma.tokenTransaction.create({
      data: {
        ledgerId: studentLedger.id,
        amount: tokenAward,
        type: "CREDIT",
        reason: `${action === "faculty_sign" ? "Academician Attestation" : "Industry Attestation"} · Proof #${proofId.slice(-6)}`,
      },
    });

    revalidatePath("/tokens");
    revalidatePath("/dashboard");
  }

  revalidatePath(`/proof-of-work/${proofId}`);
  revalidatePath(`/verify/${token}`);
  return { success: true };
}
