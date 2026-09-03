"use client";

import { useActionState } from "react";
import { postChallenge } from "./actions";

export default function PostChallengeForm() {
  const [state, formAction, pending] = useActionState(postChallenge, null);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Challenge Title</label>
          <input id="title" name="title" required placeholder="e.g. GenAI Document Intelligence" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea id="description" name="description" required rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
        </div>
        <div>
          <label htmlFor="challengeType" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select id="challengeType" name="challengeType" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100">
            <option value="CAPSTONE">Capstone</option>
            <option value="R_AND_D">R&D</option>
            <option value="MICRO_CONSULTANCY">Micro-Consultancy</option>
          </select>
        </div>
        <div>
          <label htmlFor="domain" className="mb-1 block text-sm font-medium text-gray-700">Domain</label>
          <input id="domain" name="domain" placeholder="e.g. Generative AI" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="techStack" className="mb-1 block text-sm font-medium text-gray-700">Tech Stack</label>
          <input id="techStack" name="techStack" placeholder="e.g. Python, LangChain" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="stipend" className="mb-1 block text-sm font-medium text-gray-700">Stipend (₹)</label>
          <input id="stipend" name="stipend" type="number" min={0} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="deadline" className="mb-1 block text-sm font-medium text-gray-700">Deadline</label>
          <input id="deadline" name="deadline" type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="objectives" className="mb-1 block text-sm font-medium text-gray-700">Objectives</label>
          <textarea id="objectives" name="objectives" rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="rndOnly" name="rndOnly" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="rndOnly" className="text-sm text-gray-700">R&D only (requires Lab Unit to apply)</label>
        </div>
      </div>

      {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">Challenge posted successfully!</p>}

      <button type="submit" disabled={pending} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
        {pending ? "Posting..." : "Post Challenge"}
      </button>
    </form>
  );
}
