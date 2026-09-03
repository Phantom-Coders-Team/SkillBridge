"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, User } from "lucide-react";
import { signupAction } from "./actions";
import { cn } from "@/lib/cn";

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

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("STUDENT");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      {/* Ambient backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/40 blur-[140px]" />
        <div className="absolute -bottom-48 -left-32 h-[420px] w-[520px] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[480px] rounded-full bg-sky-500/20 blur-[120px]" />
      </div>

      <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Brand / pitch panel */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap aria-hidden className="size-6" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-white">Campus Bridge</span>
              <span className="block text-sm text-slate-400">Academia × Industry</span>
            </span>
          </div>

          <h1 className="mt-10 max-w-md text-4xl font-bold leading-[1.15] tracking-tight text-white">
            Start building your future today.
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Create your account and join a community of students, faculty, industry partners, and
            placement officers working on real problems.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                  <span aria-hidden className="size-1.5 rounded-full bg-indigo-400" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="w-full">
          <div className="rounded-3xl border border-white/10 bg-surface p-6 shadow-pop sm:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                <GraduationCap aria-hidden className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Campus Bridge</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join the platform and start collaborating.</p>

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
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
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
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
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
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  I am a…
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
                            ? role.tone
                            : "bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700",
                        )}
                      >
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {state?.error && (
                <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300" role="alert">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60"
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
      </div>
    </div>
  );
}
