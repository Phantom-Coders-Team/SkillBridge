"use client";

import { useState, useTransition } from "react";
import {
  Send,
  X,
  Users2,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { applyStudentToChallenge } from "./actions";

interface StudentLabUnit {
  id: string;
  name: string;
  facultyName: string;
}

interface FacultyOption {
  id: string;
  name: string;
  department?: string | null;
  email: string;
}

export default function StudentApplyModal({
  challengeId,
  challengeTitle,
  challengeType,
  companyName,
  stipend,
  rndOnly,
  myEnrolledLabUnits = [],
  availableFaculty = [],
  hasAlreadyApplied = false,
}: {
  challengeId: string;
  challengeTitle: string;
  challengeType: string;
  companyName: string;
  stipend?: number | null;
  rndOnly: boolean;
  myEnrolledLabUnits: StudentLabUnit[];
  availableFaculty: FacultyOption[];
  hasAlreadyApplied?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [useExistingUnit, setUseExistingUnit] = useState(myEnrolledLabUnits.length > 0);
  const [selectedLabUnitId, setSelectedLabUnitId] = useState<string>(
    myEnrolledLabUnits[0]?.id || ""
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    availableFaculty[0]?.id || ""
  );
  const [proposal, setProposal] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("challengeId", challengeId);
    formData.append("proposal", proposal);

    if (useExistingUnit && selectedLabUnitId) {
      formData.append("labUnitId", selectedLabUnitId);
    } else {
      if (!selectedFacultyId) {
        setStatusMessage({
          text: "Please select a faculty mentor to guide your project team.",
          isError: true,
        });
        return;
      }
      formData.append("facultyId", selectedFacultyId);
    }

    startTransition(async () => {
      const result = await applyStudentToChallenge(null, formData);
      if (result?.error) {
        setStatusMessage({ text: result.error, isError: true });
      } else if (result?.success) {
        setStatusMessage({
          text: "Application submitted! Your faculty mentor and the sponsor will review your proposal.",
          isError: false,
        });
        setTimeout(() => {
          setIsOpen(false);
          setStatusMessage(null);
        }, 1300);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatusMessage(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
      >
        <Send className="size-3.5" />
        <span>{hasAlreadyApplied ? "Applied (View Status)" : "Apply to Challenge"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Send className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Apply to Industry Challenge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Submit your solution proposal to {companyName}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Challenge Info */}
            <div className="mb-4 rounded-xl border border-border-muted bg-surface-muted/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {challengeType.replaceAll("_", " ")}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {challengeTitle}
                  </h4>
                </div>
                {stipend && (
                  <span className="shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    ₹{stipend.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {rndOnly && (
                <p className="mt-2 text-[11px] text-violet-700 dark:text-violet-300 font-medium">
                  • This challenge requires an academic faculty mentor to sponsor your team.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Option: Lab Unit vs Faculty Nomination */}
              {myEnrolledLabUnits.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Application Route
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUseExistingUnit(true)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        useExistingUnit
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                          : "border-border-muted bg-surface text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Users2 className="size-4 mb-1" />
                      Apply via My Lab Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseExistingUnit(false)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        !useExistingUnit
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                          : "border-border-muted bg-surface text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <GraduationCap className="size-4 mb-1" />
                      Request Faculty Mentor
                    </button>
                  </div>
                </div>
              )}

              {useExistingUnit && myEnrolledLabUnits.length > 0 ? (
                <div>
                  <label htmlFor="student-labunit" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Select Your Lab Unit
                  </label>
                  <select
                    id="student-labunit"
                    value={selectedLabUnitId}
                    onChange={(e) => setSelectedLabUnitId(e.target.value)}
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {myEnrolledLabUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Lead: {u.facultyName})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label htmlFor="student-faculty" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Nominate Faculty Mentor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="student-faculty"
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {availableFaculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.department ? `(${f.department})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">
                    A notification and project unit request will be forwarded to this faculty mentor.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="student-proposal" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Your Proposed Solution & Team Experience <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="student-proposal"
                  required
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows={4}
                  placeholder="Describe your tech approach, tools you plan to use, and why you or your team are a great fit..."
                  className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {statusMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                    statusMessage.isError
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="size-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
