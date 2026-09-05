"use client";

import { useState } from "react";
import { Share2, Check, ExternalLink } from "lucide-react";

export default function SharePortfolioButton({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/portfolio/${userId}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`/portfolio/${userId}`, "_blank");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-muted bg-surface px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer"
      title="Copy public portfolio link"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="size-3.5 text-indigo-500" />
          <span>Share Portfolio</span>
        </>
      )}
    </button>
  );
}
