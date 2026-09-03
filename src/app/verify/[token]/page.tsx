import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateQrSvg } from "@/lib/qr";
import { Badge, type BadgeTone } from "@/components/ui";

const SIGN_TONE: Record<string, BadgeTone> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export default async function VerifyBadgePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proof = await prisma.proofOfWork.findUnique({
    where: { publicToken: token },
    include: {
      student: { select: { name: true, profile: { select: { department: true, rollNumber: true } } } },
      project: { select: { title: true, description: true, domain: true, projectType: true } },
      blockchainTx: true,
    },
  });

  if (!proof) notFound();

  const isDualAttested = proof.facultySignOff === "APPROVED" && proof.industrySignOff === "APPROVED";
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify/${token}`;
  const qrDataUrl = await generateQrSvg(verifyUrl);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-card-hover">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isDualAttested ? "Dual-Attested Verified Proof of Work" : "Proof of Work — Pending Attestation"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isDualAttested
              ? "This artifact has been verified by both faculty and industry partners."
              : "This artifact has not yet received both required sign-offs."}
          </p>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{proof.project.title}</h2>
            <Badge tone="indigo">{proof.project.projectType.replaceAll("_", " ")}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{proof.project.description}</p>
          {proof.project.domain && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Domain: {proof.project.domain}</p>}

          <div className="mt-4 border-t border-border-muted pt-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student</p>
            <p className="text-sm text-slate-900 dark:text-slate-100">{proof.student.name}</p>
            {proof.student.profile && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {proof.student.profile.department} — {proof.student.profile.rollNumber}
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Faculty Sign-off</p>
              <div className="mt-1.5 inline-flex">
                <Badge tone={SIGN_TONE[proof.facultySignOff] ?? "gray"}>{proof.facultySignOff}</Badge>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Industry Sign-off</p>
              <div className="mt-1.5 inline-flex">
                <Badge tone={SIGN_TONE[proof.industrySignOff] ?? "gray"}>{proof.industrySignOff}</Badge>
              </div>
            </div>
          </div>

          {proof.issuedAt && (
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Issued: {new Date(proof.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}

          <div className="mt-4 border-t border-border-muted pt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Verification ID</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{proof.publicToken}</p>
          </div>

          {proof.blockchainTx && (
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-left dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  ⛓️ Blockchain Proof (Block #{proof.blockchainTx.blockIndex})
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {proof.blockchainTx.consensusState} ({proof.blockchainTx.nodeSignatures} Nodes)
                </span>
              </div>
              <p className="mt-1.5 break-all font-mono text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Hash: </span>
                {proof.blockchainTx.blockHash}
              </p>
            </div>
          )}

          {qrDataUrl && (
            <div className="mt-4 flex flex-col items-center border-t border-border-muted pt-4">
              <img src={qrDataUrl} alt="Verified badge QR code" width={120} height={120} className="rounded-lg border border-border-muted bg-white p-1" />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Scan to verify authenticity</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          Verified via Skill Bridge — Academia–Industry Collaboration Portal
        </p>
      </div>
    </div>
  );
}
