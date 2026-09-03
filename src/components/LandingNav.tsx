"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { SessionUser } from "@/lib/types";

export default function LandingNav({ user }: { user: SessionUser | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "border-slate-200/80 bg-white/75 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/75"
          : "border-transparent bg-white/50 dark:bg-slate-950/40"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <GraduationCap aria-hidden className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Skill Bridge</span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Academia × Industry</span>
          </span>
        </Link>
        {user ? (
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Go to Dashboard <ArrowRight aria-hidden className="size-4" />
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
