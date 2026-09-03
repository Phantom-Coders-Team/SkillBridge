"use client";

import { useActionState } from "react";
import { submitGrading } from "./actions";

type Grading = {
  id: string;
  academicMarks: number | null;
  jobReadinessScore: number | null;
  facultyRemarks: string | null;
  industryRemarks: string | null;
  gradedByFacultyId: string | null;
  gradedByIndustryId: string | null;
  submittedAt: Date | null;
  challenge: { title: string };
  labUnit: { name: string };
};

export default function GradingCard({ grading, role }: { grading: Grading; role: string }) {
  const [state, formAction, pending] = useActionState(submitGrading, null);

  const canGradeFaculty = role === "FACULTY" && !grading.academicMarks;
  const canGradeIndustry = role === "INDUSTRY" && !grading.jobReadinessScore;
  const isComplete = grading.academicMarks !== null && grading.jobReadinessScore !== null;

  return (
    <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{grading.challenge.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Lab Unit: {grading.labUnit.name}</p>
        </div>
        {isComplete ? (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">Complete</span>
        ) : (
          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Faculty Academic</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">
            {grading.academicMarks !== null ? `${grading.academicMarks}/100` : "—"}
          </p>
          {grading.facultyRemarks && <p className="mt-1 text-xs text-blue-600 italic">{grading.facultyRemarks}</p>}
        </div>
        <div className="rounded-lg bg-purple-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600">Industry Job Readiness</p>
          <p className="mt-1 text-2xl font-bold text-purple-800">
            {grading.jobReadinessScore !== null ? `${grading.jobReadinessScore}/100` : "—"}
          </p>
          {grading.industryRemarks && <p className="mt-1 text-xs text-purple-600 italic">{grading.industryRemarks}</p>}
        </div>
      </div>

      {(canGradeFaculty || canGradeIndustry) && (
        <form action={formAction} className="mt-4 space-y-3 border-t pt-4">
          <input type="hidden" name="gradingId" value={grading.id} />
          {canGradeFaculty && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Academic Marks (0-100)</label>
                <input name="academicMarks" type="number" min={0} max={100} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                <textarea name="remarks" rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
              </div>
            </>
          )}
          {canGradeIndustry && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Job Readiness Score (0-100)</label>
                <input name="jobReadinessScore" type="number" min={0} max={100} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                <textarea name="remarks" rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-surface dark:border-slate-600 dark:text-slate-100" />
              </div>
            </>
          )}
          {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
          {state?.success && <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-600">Grading saved!</p>}
          <button type="submit" disabled={pending} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {pending ? "Saving..." : "Submit Grading"}
          </button>
        </form>
      )}
    </div>
  );
}
