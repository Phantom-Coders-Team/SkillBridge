"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import { signupAction } from "./actions";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/ThemeToggle";

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student", tone: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/40" },
  { value: "FACULTY", label: "Faculty", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40" },
  { value: "INDUSTRY", label: "Industry", tone: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/40" },
  { value: "TPO", label: "TPO", tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/40" },
];

const FEATURES = [
  "Skill tokens & verifiable proof of work",
  "Capstone and R&D challenge marketplace",
  "Dual-graded placements with live PRI scores",
  "Mentorship, office hours & sabbatical exchange",
];

function RoleParamSync({ onSelect }: { onSelect: (r: string) => void }) {
  const searchParams = useSearchParams();
  const r = searchParams.get("role")?.toUpperCase();
  useEffect(() => {
    if (r && ["STUDENT", "FACULTY", "INDUSTRY", "TPO"].includes(r)) {
      onSelect(r);
    }
  }, [r, onSelect]);
  return null;
}

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("STUDENT");

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background text-foreground transition-colors duration-200">
      <Suspense fallback={null}>
        <RoleParamSync onSelect={setSelectedRole} />
      </Suspense>
      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[140px] dark:bg-indigo-600/25" />
        <div className="absolute -bottom-48 -left-32 h-[420px] w-[520px] rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-600/20" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[480px] rounded-full bg-sky-500/15 blur-[120px] dark:bg-sky-500/15" />
      </div>

      {/* Top Bar with Home Link and Theme Toggle */}
      <header className="relative z-20 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <GraduationCap aria-hidden className="size-4.5" />
          </span>
          <span className="font-bold tracking-tight">Skill Bridge</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 mx-auto my-auto grid w-full max-w-5xl gap-10 px-4 py-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Brand / pitch panel */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-surface/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-surface/80 dark:text-indigo-300">
            <Sparkles className="size-3.5" /> Fast-Track Career Growth
          </div>

          <h1 className="mt-6 max-w-md text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white">
            Start building your future today.
          </h1>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-400 leading-relaxed">
            Create your account and join a community of students, faculty, industry partners, and
            placement officers working on real-world challenges.
          </p>

          <ul className="mt-8 space-y-3.5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <ArrowRight aria-hidden className="size-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="w-full">
          <div className="rounded-3xl border border-border-muted bg-surface/95 p-6 shadow-card backdrop-blur-md sm:p-8 dark:border-slate-800/80">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                  <GraduationCap aria-hidden className="size-5" />
                </span>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Skill Bridge</span>
              </div>
              <ThemeToggle />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join the platform and start collaborating today.</p>

            <form action={formAction} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full name
                </label>
                <div className="relative">
                  <User aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border border-border-muted bg-surface-subtle pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.edu"
                    className="h-11 w-full rounded-xl border border-border-muted bg-surface-subtle pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="h-11 w-full rounded-xl border border-border-muted bg-surface-subtle pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  I am joining as a…
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <label key={role.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={selectedRole === role.value}
                        onChange={() => setSelectedRole(role.value)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition-all active:scale-[0.98]",
                          selectedRole === role.value
                            ? `${role.tone} shadow-xs font-bold`
                            : "bg-surface-subtle text-slate-600 ring-border-muted hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/70 dark:hover:bg-slate-800",
                        )}
                      >
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {state?.error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300 border border-red-200 dark:border-red-500/30" role="alert">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {pending ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 Skill Bridge · Empowering verified academia-industry collaboration
      </footer>
    </div>
  );
}

