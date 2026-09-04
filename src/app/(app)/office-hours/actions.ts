"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_HOUR_COST, CODE_CLINIC_COST } from "./costs";

export interface BookingResult {
  ok: boolean;
  error?: string;
  balance?: number;
}

export async function bookOfficeHour(
  slotId: string,
  variant: "OFFICE_HOUR" | "CODE_CLINIC"
): Promise<BookingResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { ok: false, error: "Only students can book mentorship slots." };
  }

  const cost = variant === "CODE_CLINIC" ? CODE_CLINIC_COST : OFFICE_HOUR_COST;

  const [slot, ledger] = await Promise.all([
    prisma.mentorSlot.findUnique({ where: { id: slotId } }),
    prisma.tokenLedger.findFirst({ where: { studentId: user.id } }),
  ]);

  if (!slot) {
    return { ok: false, error: "Mentor slot not found." };
  }
  if (slot.status !== "AVAILABLE") {
    return { ok: false, error: "This slot has already been booked." };
  }
  if (!ledger || ledger.balance < cost) {
    return { ok: false, error: `Insufficient tokens. ${variant === "CODE_CLINIC" ? "Code clinic" : "Office hour"} costs ${cost} tokens.` };
  }

  await prisma.$transaction([
    prisma.mentorSlot.update({
      where: { id: slot.id },
      data: { studentId: user.id, status: "BOOKED" },
    }),
    prisma.tokenLedger.update({
      where: { id: ledger.id },
      data: { balance: ledger.balance - cost },
    }),
    prisma.tokenTransaction.create({
      data: {
        ledgerId: ledger.id,
        amount: -cost,
        type: "DEBIT",
        reason:
          variant === "CODE_CLINIC"
            ? `Code clinic booking · ${slot.topic || "Industry mentor"}`
            : `Office hours booking · ${slot.topic || "Industry mentor"}`,
      },
    }),
  ]);

  revalidatePath("/office-hours");
  revalidatePath("/tokens");
  revalidatePath("/dashboard");
  return { ok: true, balance: ledger.balance - cost };
}

