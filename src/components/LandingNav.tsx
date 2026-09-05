"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { SessionUser } from "@/lib/types";
import { SkillBridgeLogo, SkillBridgeWordmark } from "@/components/SkillBridgeLogo";

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
          ? "border-slate-200/80 bg-white/80 shadow-sm shadow-slate-900/5 dark:border-slate-800/90 dark:bg-slate-950/80"
          : "border-transparent bg-white/40 dark:bg-slate-950/40"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <SkillBridgeLogo size="md" className="group-hover:scale-105" />
          <SkillBridgeWordmark size="md" />
        </Link>

        {/* Section anchor links for quick navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#roles" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Portals
          </a>
          <a href="#lifecycle" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Lifecycle
          </a>
          <a href="#institutions" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Institutions
          </a>
          <a href="#capabilities" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            Capabilities
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] sm:h-10 sm:px-5 sm:text-sm"
            >
              Dashboard <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white sm:h-10 sm:px-4 sm:text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] sm:h-10 sm:px-5 sm:text-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
