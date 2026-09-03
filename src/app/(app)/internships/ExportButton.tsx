"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export default function ExportButton({
  href,
  label,
  variant = "primary",
  small = false,
}: {
  href: string;
  label: string;
  variant?: "primary" | "outline" | "ghost";
  small?: boolean;
}) {
  const Icon = FileSpreadsheet;
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const frame = useRef<HTMLIFrameElement | null>(null);

  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-surface dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200",
  };

  function download() {
    setState("loading");
    if (!frame.current) {
      frame.current = document.createElement("iframe");
      frame.current.style.display = "none";
      document.body.appendChild(frame.current);
    }
    frame.current.src = href;
    setTimeout(() => setState("done"), 1500);
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={state === "loading"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-150 disabled:opacity-60",
        small ? "h-7 px-2 text-[11px]" : "h-10 px-3 text-sm",
        styles[variant],
      )}
    >
      {state === "loading" ? <Loader2 className={cn("animate-spin", small ? "size-3" : "size-4")} /> : <Icon aria-hidden className={small ? "size-3" : "size-4"} />}
      {state === "done" ? "Downloading…" : label}
    </button>
  );
}
