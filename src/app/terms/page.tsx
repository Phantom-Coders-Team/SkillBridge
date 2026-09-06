import Link from "next/link";
import { ArrowLeft, Scale, CheckCircle2, ShieldCheck, Briefcase } from "lucide-react";
import { SkillBridgeLogo, SkillBridgeWordmark } from "@/components/SkillBridgeLogo";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Terms of Service & Collaboration Charter | SkillBridge",
  description: "SkillBridge terms of service, joint evaluation guidelines, intellectual property terms, and campus placement rules.",
};

export default function TermsOfServicePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[140px] dark:bg-indigo-600/25" />
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
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 sm:py-12 space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <Scale className="size-3.5" /> Collaboration Framework
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service &amp; Collaboration Charter
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Governing interactions across students, faculty mentors, corporate recruiters, and university administration.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-border-muted bg-surface/90 p-6 sm:p-8 backdrop-blur-md shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-indigo-600" /> 1. Dual-Attestation &amp; Academic Integrity
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Students certify that all submitted code commits, project artifacts, and assessments represent their original work. False claims, plagiarism, or artificial score inflation result in instant revocation of verified badges and disqualification from reverse placement pitching.
            </p>
          </section>

          <section className="space-y-3 border-t border-border-muted pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="size-5 text-indigo-600" /> 2. Industry Challenge Engagement &amp; Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Corporate sponsors posting R&amp;D challenges and capstones specify IP licensing terms up front. Unless explicitly designated under a corporate proprietary agreement, baseline student project code is open-sourced under permissive licenses (MIT/Apache-2.0) with mutual attribution.
            </p>
          </section>

          <section className="space-y-3 border-t border-border-muted pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="size-5 text-indigo-600" /> 3. Joint Evaluation Placements &amp; Offer Binding
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Placement offers extended via the Reverse Placement ATS Kanban board are logged in real-time. Once an offer is marked as Accepted by a candidate and confirmed by the Institution TPO, institutional placement rules and AICTE campus recruitment guidelines apply.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-border-muted">
        © {new Date().getFullYear()} Skill Bridge — Verifiable Academia-Industry Collaboration Platform.
      </footer>
    </div>
  );
}
