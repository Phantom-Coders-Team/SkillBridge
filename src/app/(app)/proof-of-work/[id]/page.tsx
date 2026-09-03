import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQrSvg } from "@/lib/qr";
import SignOffControls, { VerifiedBadge } from "./SignOffControls";

const SIGN_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default async function ProofDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const proof = await prisma.proofOfWork.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, email: true } },
      project: { select: { title: true, description: true, domain: true, techStack: true, projectType: true } },
    },
  });

  if (!proof) notFound();

  const isFacultyOrIndustry = user.role === "FACULTY" || user.role === "INDUSTRY";

  const verifyUrl = proof.publicToken
    ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify/${proof.publicToken}`
    : null;
  const qrDataUrl = verifyUrl ? await generateQrSvg(verifyUrl) : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Proof of Work Detail</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Project artifact with dual sign-off verification.</p>

      <div className="mt-6 rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{proof.project.title}</h2>
          <span className="text-xs font-medium text-indigo-600">{proof.project.projectType.replaceAll("_", " ")}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{proof.project.description}</p>
        {proof.project.domain && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Domain: {proof.project.domain}</p>}
        {proof.project.techStack && <p className="text-xs text-gray-500 dark:text-gray-400">Stack: {proof.project.techStack}</p>}

        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Proof Description</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{proof.description}</p>
          {proof.artifactUrl && (
            <a href={proof.artifactUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
              View artifact ↗
            </a>
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Student</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{proof.student.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{proof.student.email}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Faculty Sign-off</p>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${SIGN_BADGE[proof.facultySignOff]}`}>
              {proof.facultySignOff}
            </span>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Industry Sign-off</p>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${SIGN_BADGE[proof.industrySignOff]}`}>
              {proof.industrySignOff}
            </span>
          </div>
        </div>

        {proof.issuedAt && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Issued: {new Date(proof.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        {isFacultyOrIndustry && (
          <SignOffControls
            proofId={proof.id}
            facultySignOff={proof.facultySignOff}
            industrySignOff={proof.industrySignOff}
            role={user.role}
          />
        )}

        <VerifiedBadge
          publicToken={proof.publicToken}
          facultySignOff={proof.facultySignOff}
          industrySignOff={proof.industrySignOff}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  );
}
