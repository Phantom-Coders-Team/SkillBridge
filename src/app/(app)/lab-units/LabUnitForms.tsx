"use client";

import { useActionState } from "react";
import { createLabUnit, applyToChallenge } from "./actions";

type Challenge = { id: string; title: string; challengeType: string; rndOnly: boolean; status: string };
type Student = { id: string; name: string };

export default function LabUnitForms({ challenges, students }: { challenges: Challenge[]; students: Student[] }) {
  const [createState, createAction, createPending] = useActionState(createLabUnit, null);
  const [applyState, applyAction, applyPending] = useActionState(applyToChallenge, null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form action={createAction} className="space-y-4 rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Create Lab Unit</h3>
        <div>
          <label htmlFor="lu-name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Name</label>
          <input id="lu-name" name="name" required placeholder="e.g. GenAI Research Lab" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
        </div>
        <div>
          <label htmlFor="lu-challenge" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Link to Challenge (optional)</label>
          <select id="lu-challenge" name="challengeId" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100">
            <option value="">None</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>{c.title} ({c.challengeType.replaceAll("_", " ")})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Add Students</label>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" name="studentIds" value={s.id} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-surface" />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        {createState?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{createState.error}</p>}
        {createState?.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">Lab unit created!</p>}
        <button type="submit" disabled={createPending} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {createPending ? "Creating..." : "Create Lab Unit"}
        </button>
      </form>

      <form action={applyAction} className="space-y-4 rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Apply to Challenge</h3>
        <div>
          <label htmlFor="app-labUnit" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Your Lab Unit</label>
          <input id="app-labUnit" name="labUnitId" required placeholder="Paste Lab Unit ID" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
        </div>
        <div>
          <label htmlFor="app-challenge" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Challenge</label>
          <select id="app-challenge" name="challengeId" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100">
            <option value="">Select a challenge</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="app-proposal" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Proposal</label>
          <textarea id="app-proposal" name="proposal" rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
        </div>
        {applyState?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{applyState.error}</p>}
        {applyState?.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">Application submitted!</p>}
        <button type="submit" disabled={applyPending} className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
          {applyPending ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
