"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

export default function VerifySearchForm() {
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = token.trim();
    if (cleanToken) {
      router.push(`/verify/${encodeURIComponent(cleanToken)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          name="token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Enter Token ID (e.g. a1b2c3-pow-001)..."
          className="h-11 w-full rounded-xl border border-border-muted bg-surface-subtle pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
      >
        Verify Badge <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
