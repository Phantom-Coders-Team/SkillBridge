"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { postOpportunity, type ActionState } from "./actions";

const TYPES = [
  "INTERNSHIP",
  "APPRENTICESHIP",
  "ENTRY_JOB",
  "TRAINING",
  "CERTIFICATION",
  "WORKSHOP",
  "MENTORSHIP",
];

export default function PostOpportunityForm() {
  const [state, action, pending] = useActionState(postOpportunity, null);

  return (
    <form action={action} className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Post an opportunity</h3>

      <div>
        <label htmlFor="title" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
        <input id="title" name="title" type="text" required placeholder="e.g. Software Engineering Intern"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Description</label>
        <textarea id="description" name="description" rows={3} required placeholder="Describe the role or program…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="programType" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Type</label>
          <select id="programType" name="programType"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100">
            {TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="mode" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Mode</label>
          <input id="mode" name="mode" type="text" placeholder="Remote / On-site / Hybrid"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="duration" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Duration</label>
          <input id="duration" name="duration" type="text" placeholder="e.g. 6 months"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
        <div>
          <label htmlFor="skills" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Required skills</label>
          <input id="skills" name="skills" type="text" placeholder="e.g. React, Node.js"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input type="checkbox" name="certification" className="size-4 rounded border-slate-300" />
        Offers a certification
      </label>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">Posted successfully.</p>
      )}

      <button type="submit" disabled={pending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Publish
      </button>
    </form>
  );
}
