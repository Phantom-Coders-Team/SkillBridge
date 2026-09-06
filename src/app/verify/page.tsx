import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";
import { SkillBridgeLogo, SkillBridgeWordmark } from "@/components/SkillBridgeLogo";
import ThemeToggle from "@/components/ThemeToggle";

import VerifySearchForm from "./VerifySearchForm";

export const metadata = {
  title: "Public Credential Verification | SkillBridge",
  description: "Verify cryptographic, dual-attested Proof of Work credentials signed by university faculty and industry partners.",
};

export default async function PublicVerificationPortalPage() {
  const verifiedProofs = await prisma.proofOfWork.findMany({
    where: {
      facultySignOff: "APPROVED",
      industrySignOff: "APPROVED",
      publicToken: { not: null },
    },
    include: {
      student: { select: { name: true, profile: { select: { department: true, collegeName: true } } } },
      project: { select: { title: true, domain: true, projectType: true } },
      blockchainTx: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[140px] dark:bg-indigo-600/25" />
        <div className="absolute -bottom-48 -left-32 h-[420px] w-[520px] rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-600/20" />
      </div>

      {/* Header */}
      <header className="relative z-20 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 text-sm font-semibold transition-colors">
          <SkillBridgeLogo size="sm" className="group-hover:scale-105" />
          <SkillBridgeWordmark size="sm" showSubtitle={false} />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 sm:py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <ShieldCheck className="size-4" /> Cryptographic Verification Registry
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verify Student Credentials &amp; Proof of Work
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every verified milestone is dual-signed by an accredited academician and corporate engineering leader, permanently committed to the consortium ledger.
          </p>
        </div>

        {/* Token Search Box */}
        <div className="max-w-xl mx-auto rounded-3xl border border-border-muted bg-surface/90 p-4 sm:p-6 shadow-pop backdrop-blur-md">
          <VerifySearchForm />
        </div>

        {/* Recent Verifiable Credentials Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-muted pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="size-5 text-indigo-600 dark:text-indigo-400" />
              Live Verified Artifacts ({verifiedProofs.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Click any credential to inspect live QR code &amp; signatures</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedProofs.map((p) => (
              <Link
                key={p.id}
                href={`/verify/${p.publicToken}`}
                className="group rounded-2xl border border-border-muted bg-surface/80 p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md dark:bg-surface/90"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.project.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Candidate: <span className="font-semibold text-slate-700 dark:text-slate-200">{p.student.name}</span>
                      {p.student.profile?.department && ` · ${p.student.profile.department}`}
                    </p>
                  </div>
                  <Badge tone="emerald">Dual-Verified</Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-border-muted flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="truncate">Token: {p.publicToken}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Inspect Badge <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-border-muted">
        © {new Date().getFullYear()} Skill Bridge — Verifiable Academia-Industry Collaboration Platform.
      </footer>
    </div>
  );
}
