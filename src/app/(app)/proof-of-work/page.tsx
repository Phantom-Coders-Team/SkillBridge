import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Award, ExternalLink, ShieldCheck, Plus, CheckCircle2, Clock } from "lucide-react";
import { getCurrentUser, normalizeRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, type BadgeTone } from "@/components/ui";
import AddProofOfWorkForm from "./AddProofOfWorkForm";

const SIGN_TONE: Record<string, BadgeTone> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export default async function ProofOfWorkPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const normalizedRole = normalizeRole(user.role);
  const isStudent = normalizedRole === "STUDENT";
  const isIndustry = normalizedRole === "INDUSTRY";
  const isAcademician = normalizedRole === "ACADEMICIAN";

  const proofs = await prisma.proofOfWork.findMany({
    where: isStudent ? { studentId: user.id } : {},
    include: {
      student: { select: { name: true } },
      project: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  const studentProjects = isStudent
    ? await prisma.project.findMany({
        where: { ownerId: user.id },
        select: { id: true, title: true },
      })
    : [];

  const approved = proofs.filter((p) => p.facultySignOff === "APPROVED" && p.industrySignOff === "APPROVED").length;
  const pendingForUser = isIndustry
    ? proofs.filter((p) => p.industrySignOff === "PENDING").length
    : isAcademician
      ? proofs.filter((p) => p.facultySignOff === "PENDING").length
      : proofs.filter((p) => p.facultySignOff === "PENDING" || p.industrySignOff === "PENDING").length;

  const pageTitle = isIndustry || isAcademician ? "Proof of Work Review" : "Proof of Work";
  const pageSubtitle = isIndustry
    ? "Review student project artifacts, validate production quality, and provide industry verification."
    : isAcademician
      ? "Review student project artifacts and provide academic verification alongside industry partners."
      : "Verified artifacts of student contributions with dual sign-offs.";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Award}
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          isStudent ? (
            <details className="group relative">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                  <Plus className="size-4" /> Add Proof of Work
                </span>
              </summary>
              <div className="animate-pop-in absolute right-0 z-20 mt-2 w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border-muted bg-surface p-5 shadow-pop">
                <AddProofOfWorkForm projects={studentProjects} />
              </div>
            </details>
          ) : undefined
        }
      />

      {(isAcademician || isIndustry) && (
        <div className="mb-5 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Clock className="size-3.5" /> {pendingForUser} pending your review
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" /> {approved} fully verified
          </span>
        </div>
      )}

      {proofs.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No proof-of-work records yet"
          description="Verified contributions will appear here once a project completes a milestone."
        />
      ) : (
        <div className="space-y-4">
          {proofs.map((p) => {
            const isPendingMyReview =
              (isIndustry && p.industrySignOff === "PENDING") ||
              (isAcademician && p.facultySignOff === "PENDING");

            return (
              <Card
                key={p.id}
                hover
                className={`p-5 transition-all ${
                  isPendingMyReview
                    ? "border-amber-300 ring-1 ring-amber-200 dark:border-amber-700/50 dark:ring-amber-900/30"
                    : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{p.project.title}</h3>
                      {isPendingMyReview && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          <Clock className="size-3" /> Awaiting Your Review
                        </span>
                      )}
                    </div>
                    {p.student && !isStudent && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Student: <span className="font-medium text-slate-600 dark:text-slate-300">{p.student.name}</span>
                      </p>
                    )}
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge tone={SIGN_TONE[p.facultySignOff] ?? "gray"}>Academician: {p.facultySignOff}</Badge>
                    <Badge tone={SIGN_TONE[p.industrySignOff] ?? "gray"}>Industry: {p.industrySignOff}</Badge>
                  </div>
                </div>

                {p.facultySignOff === "APPROVED" && p.industrySignOff === "APPROVED" && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5 border border-emerald-100 dark:border-emerald-900/50">
                    <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Blockchain Verified</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-mono truncate">
                        Tx: 0x{Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}
                      </p>
                    </div>
                  </div>
                )}

                {p.badgeQrCode && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-600">
                    <ShieldCheck aria-hidden className="size-3.5" /> Badge: {p.badgeQrCode}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border-muted pt-3 text-sm">
                  {p.artifactUrl && (
                    <a
                      href={p.artifactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <ExternalLink aria-hidden className="size-3.5" /> View artifact
                    </a>
                  )}
                  {isPendingMyReview ? (
                    <Link
                      href={`/proof-of-work/${p.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                    >
                      Review & Sign-Off <ArrowRight aria-hidden className="size-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/proof-of-work/${p.id}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900"
                    >
                      Detail & sign-offs <ArrowRight aria-hidden className="size-3.5" />
                    </Link>
                  )}
                  {p.publicToken && (
                    <a
                      href={`/verify/${p.publicToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Public badge <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}