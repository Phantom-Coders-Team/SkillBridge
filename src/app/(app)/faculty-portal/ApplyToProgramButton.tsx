"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { applyToProgram, type ActionState } from "./actions";

export default function ApplyToProgramButton({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(applyToProgram, null);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="listingId" value={listingId} />
      <textarea
        name="message"
        rows={2}
        placeholder="Tell them about your expertise…"
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />} Apply
      </button>
      {state?.success && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Application submitted!</p>}
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
