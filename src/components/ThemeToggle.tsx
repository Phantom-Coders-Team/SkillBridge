"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  variant?: "button" | "segmented";
}

export default function ThemeToggle({ className, variant = "button" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60",
          className,
        )}
      >
        <div className="size-4 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={cn(
          "inline-flex items-center rounded-xl border border-slate-200/80 bg-slate-100/80 p-0.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-checked={!isDark}
          role="radio"
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
            !isDark
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
          )}
        >
          <Sun className="size-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-checked={isDark}
          role="radio"
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
            isDark
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
          )}
        >
          <Moon className="size-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      title={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      className={cn(
        "group relative flex size-9 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300 select-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
        "active:scale-95 active:duration-75",
        isDark
          ? "border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20"
          : "border-slate-200/90 bg-white/80 text-slate-700 hover:border-amber-400/60 hover:bg-amber-50/40 hover:text-slate-900 hover:shadow-md hover:shadow-amber-500/15",
        className,
      )}
    >
      {/* Background ambient glow pulse on hover */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xs",
          isDark ? "bg-indigo-500/10" : "bg-amber-500/10",
        )}
      />

      <div className="relative flex items-center justify-center">
        {isDark ? (
          <span className="flex items-center justify-center transition-transform duration-500 ease-out group-hover:-rotate-12">
            <Moon className="size-4 text-indigo-400 transition-colors group-hover:text-indigo-300" />
            <Sparkles className="absolute -top-1 -right-1 size-2 text-violet-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          </span>
        ) : (
          <span className="flex items-center justify-center transition-transform duration-500 ease-out group-hover:rotate-45">
            <Sun className="size-4 text-amber-500 transition-colors group-hover:text-amber-600" />
          </span>
        )}
      </div>
    </button>
  );
}
