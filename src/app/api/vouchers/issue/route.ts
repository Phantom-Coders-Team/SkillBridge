import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY") {
    return NextResponse.json({ error: "Only industry partners can issue e-RUPI upskilling vouchers." }, { status: 403 });
  }

  let body: { studentId?: string; amount?: number; purposeCode?: string; expiryMonths?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { studentId, amount = 5000, purposeCode = "EDTECH_CERTIFICATION", expiryMonths = 6 } = body;

  if (!studentId) {
    return NextResponse.json({ error: "Student beneficiary ID is required." }, { status: 400 });
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId, role: "STUDENT" },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const randomHash = crypto.randomBytes(4).toString("hex").toUpperCase();
  const voucherCode = `ERUPI-${purposeCode.slice(0, 4)}-${randomHash}`;

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

  const voucher = await prisma.erupiVoucher.create({
    data: {
      voucherCode,
      industryId: user.id,
      studentId: student.id,
      amount: Number(amount),
      purposeCode,
      status: "ACTIVE",
      expiryDate,
    },
  });

  return NextResponse.json({
    ok: true,
    voucher: {
      id: voucher.id,
      voucherCode: voucher.voucherCode,
      amount: voucher.amount,
      purposeCode: voucher.purposeCode,
      status: voucher.status,
      expiryDate: voucher.expiryDate,
      beneficiary: student.name,
    },
  });
}
