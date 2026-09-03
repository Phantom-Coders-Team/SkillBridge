"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { postFacultyProgram, type ActionState } from "./actions";

const TYPES = ["FACULTY_INTERNSHIP", "INDUSTRIAL_TRAINING", "FDP", "CONSULTANCY", "RESEARCH"];

export default function PostFacultyForm() {
  const [state, action, pending] = useActionState(postFacultyProgram, null);

  return (
    <form action={action} className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Post a faculty program</h3>
      <div>
        <label htmlFor="ftitle" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
        <input id="ftitle" name="title" type="text" required placeholder="e.g. GenAI Faculty Research Fellowship"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>
      <div>
        <label htmlFor="fdesc" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Description</label>
        <textarea id="fdesc" name="description" rows={3} required placeholder="Describe the program…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ftype" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Type</label>
          <select id="ftype" name="programType"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100">
            {TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fduration" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Duration</label>
          <input id="fduration" name="duration" type="text" placeholder="e.g. 8 weeks"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="fdomain" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Domain</label>
          <input id="fdomain" name="domain" type="text" placeholder="e.g. Machine Learning"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
        <div>
          <label htmlFor="flocation" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Location</label>
          <input id="flocation" name="location" type="text" placeholder="e.g. Bengaluru (Hybrid)"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
        </div>
      </div>
      <div>
        <label htmlFor="fcomp" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Compensation</label>
        <input id="fcomp" name="compensation" type="text" placeholder="e.g. Honorarium + travel"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100" />
      </div>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-300">{state.error}</p>}
      {state?.success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">Posted successfully.</p>}

      <button type="submit" disabled={pending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />} Publish
      </button>
    </form>
  );
}
