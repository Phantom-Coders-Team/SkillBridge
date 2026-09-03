"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { addPortfolioItem, type ActionState } from "./actions";

const TYPES = ["CERTIFICATION", "PROJECT", "INTERNSHIP", "ACHIEVEMENT", "PUBLICATION", "VOLUNTEERING"];

export default function AddPortfolioForm() {
  const [state, action, pending] = useActionState(addPortfolioItem, null);

  return (
    <form action={action} className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Add portfolio item</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ptype" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Type</label>
          <select id="ptype" name="type"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pyear" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Year</label>
          <input id="pyear" name="year" type="number" placeholder="e.g. 2025"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
      </div>
      <div>
        <label htmlFor="ptitle" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
        <input id="ptitle" name="title" type="text" required placeholder="e.g. AWS Certified Cloud Practitioner"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>
      <div>
        <label htmlFor="pissuer" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Issuer / Organization</label>
        <input id="pissuer" name="issuer" type="text" placeholder="e.g. Amazon Web Services"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>
      <div>
        <label htmlFor="pdesc" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Description</label>
        <textarea id="pdesc" name="description" rows={2} placeholder="Brief details…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300">{state.error}</p>}
      {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">Item added.</p>}

      <button type="submit" disabled={pending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Add to portfolio
      </button>
    </form>
  );
}
