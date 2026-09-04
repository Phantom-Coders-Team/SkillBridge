"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteOpportunity } from "./actions";

export default function DeleteOpportunityButton({ listingId }: { listingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      setError(null);
      const res = await deleteOpportunity(listingId);
      if (res?.error) {
        setError(res.error);
        setConfirming(false);
      }
    });
  };

  if (confirming) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-2 text-xs dark:border-rose-900/60 dark:bg-rose-950/40">
        <div className="flex items-center gap-1 text-rose-700 dark:text-rose-300 font-medium">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Remove listing?</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="inline-flex h-6 items-center gap-1 rounded-lg bg-rose-600 px-2 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : null}
            Yes, Remove
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirming(false)}
            className="inline-flex h-6 items-center rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-surface dark:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center justify-end">
      {error && <span className="mr-2 text-[10px] text-rose-600">{error}</span>}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer"
        title="Remove this internship listing"
      >
        <Trash2 className="size-3" />
        <span>Remove Listing</span>
      </button>
    </div>
  );
}
