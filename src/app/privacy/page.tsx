import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Database, FileCheck, CheckCircle2 } from "lucide-react";
import { SkillBridgeLogo, SkillBridgeWordmark } from "@/components/SkillBridgeLogo";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Data Privacy & Institutional Governance | SkillBridge",
  description: "SkillBridge security policies, NEP 2020 regulatory compliance, encrypted artifact vaults, and student privacy charter.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Ambient background glow */}
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
            <Lock className="size-3.5" /> Compliance &amp; Governance Charter
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Data Privacy &amp; Institutional Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: March 2026 · Compliant with National Education Policy (NEP) 2020, AICTE Guidelines, and Indian Digital Personal Data Protection (DPDP) Act.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-border-muted bg-surface/90 p-6 sm:p-8 backdrop-blur-md shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="size-5 text-indigo-600" /> 1. Data Sovereignty &amp; Ownership
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              All student academic artifacts, code pull requests, evaluations, and institutional metrics remain the sole intellectual property of the respective students and participating universities. SkillBridge acts as an encrypted federated facilitator and zero-knowledge verification ledger.
            </p>
          </section>

          <section className="space-y-3 border-t border-border-muted pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="size-5 text-indigo-600" /> 2. Encrypted Document Vault &amp; Access Controls
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Student resumes, certificates, and NDA-bound project repositories uploaded to the 4-Way Document Vault are secured with AES-256 at rest and TLS 1.3 in transit. Only explicitly authorized industry mentors and assigned institutional evaluators have access to candidates in active evaluation cohorts.
            </p>
          </section>

          <section className="space-y-3 border-t border-border-muted pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="size-5 text-indigo-600" /> 3. NEP 2020 &amp; AICTE Regulatory Alignment
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              SkillBridge strictly complies with AICTE internship credit transfer frameworks and the National Credit Framework (NCrF). Exportable accreditation dossiers provided to Training and Placement Officers (TPOs) strictly conform to NAAC, NBA, and NIRF regulatory reporting templates.
            </p>
          </section>

          <section className="space-y-3 border-t border-border-muted pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-indigo-600" /> 4. Two-Factor Authentication &amp; Audit Logs
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Every sensitive action—including grade approvals, placement offers, and stipend disbursement—maintains an immutable audit trail. Stakeholders can configure TOTP Two-Factor Authentication via Google Authenticator or Microsoft Authenticator under their security settings.
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
