"use client";

import { Trash2 } from "lucide-react";
import { removePortfolioItem } from "./actions";
import { useTransition } from "react";

export default function RemovePortfolioItem({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => { await removePortfolioItem(id); })}
      disabled={pending}
      aria-label="Remove item"
      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
