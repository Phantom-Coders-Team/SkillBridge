"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { loginAction, plainLoginAction } from "./actions";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/ThemeToggle";

const DEMO_ACCOUNTS = [
  {
    role: "Students",
    email: "aarav.sharma@student.edu",
    tone: "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/40 dark:hover:bg-blue-500/25",
  },
  {
    role: "Academicians",
    email: "rajesh.kumar@faculty.edu",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40 dark:hover:bg-emerald-500/25",
  },
  {
    role: "Industries",
    email: "recruit@infosys.com",
    tone: "bg-purple-50 text-purple-700 ring-purple-200 hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/40 dark:hover:bg-purple-500/25",
  },
  {
    role: "Institutions",
    email: "tpo@university.edu",
    tone: "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/40 dark:hover:bg-amber-500/25",
  },
];

const FEATURES = [
  "Skill tokens & verifiable proof of work",
  "Capstone and R&D challenge marketplace",
  "Dual-graded placements with live PRI scores",
  "Mentorship, office hours & sabbatical exchange",
];

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background text-foreground transition-colors duration-200">
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
        {/* Brand & Pitch panel */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-surface/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-surface/80 dark:text-indigo-300">
            <Sparkles className="size-3.5" /> Unified Ecosystem Access
          </div>

          <h1 className="mt-6 max-w-md text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white">
            Where academia meets industry for real impact.
          </h1>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-400 leading-relaxed">
            One portal connecting students, academicians, industries, and institutions — from verified skill
            badges to signed placement offers.
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

          <div className="mt-10 flex items-center gap-8 border-t border-border-muted pt-6 text-slate-500 dark:text-slate-400">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">20+</p>
              <p className="text-xs">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">6</p>
              <p className="text-xs">Live Projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">120+</p>
              <p className="text-xs">Industry Partners</p>
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="w-full">
          <div className="rounded-3xl border border-border-muted bg-surface/90 p-6 shadow-pop backdrop-blur-md sm:p-8 dark:bg-surface/95">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                <GraduationCap aria-hidden className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Skill Bridge</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to continue to your workspace.</p>

            <form action={formAction} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.edu"
                    className="h-11 w-full rounded-xl border border-border-muted bg-surface-subtle pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-border-muted bg-surface-subtle pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
                  </button>
                </div>
              </div>

              {state?.error && (
                <p
                  className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300 font-medium"
                  role="alert"
                >
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Sign up
              </Link>
            </p>

            <div className="mt-6 border-t border-border-muted pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Demo Sign In — Password:{" "}
                <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-border-muted">
                  Password@123
                </code>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <form key={account.email} action={plainLoginAction}>
                    <input type="hidden" name="email" value={account.email} />
                    <input type="hidden" name="password" value="Password@123" />
                    <button
                      type="submit"
                      disabled={pending}
                      className={cn(
                        "w-full cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition-all active:scale-[0.98] disabled:opacity-60",
                        account.tone,
                      )}
                    >
                      {account.role}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Skill Bridge — Academia-Industry Collaboration Platform.
      </footer>
    </div>
  );
}