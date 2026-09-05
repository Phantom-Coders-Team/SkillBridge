"use client";

import { useState, useTransition } from "react";
import {
  FlaskConical,
  X,
  Plus,
  Users2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { applyLabUnitToChallenge } from "./actions";

interface LabUnitOption {
  id: string;
  name: string;
  status: string;
  membersCount: number;
  hasApplied: boolean;
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
  department?: string | null;
}

export default function ApplyWithLabUnitModal({
  challengeId,
  challengeTitle,
  challengeType,
  companyName,
  stipend,
  myLabUnits = [],
  availableStudents = [],
  hasAlreadyApplied = false,
}: {
  challengeId: string;
  challengeTitle: string;
  challengeType: string;
  companyName: string;
  stipend?: number | null;
  myLabUnits: LabUnitOption[];
  availableStudents: StudentOption[];
  hasAlreadyApplied?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isNewUnit, setIsNewUnit] = useState(myLabUnits.length === 0);
  const [selectedLabUnitId, setSelectedLabUnitId] = useState<string>(
    myLabUnits.find((u) => !u.hasApplied)?.id || myLabUnits[0]?.id || ""
  );
  const [newUnitName, setNewUnitName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [proposal, setProposal] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const filteredStudents = availableStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("challengeId", challengeId);
    formData.append("isNewUnit", String(isNewUnit));
    formData.append("proposal", proposal);

    if (isNewUnit) {
      if (!newUnitName.trim()) {
        setStatusMessage({ text: "Please provide a name for your new Lab Unit.", isError: true });
        return;
      }
      formData.append("newUnitName", newUnitName.trim());
      selectedStudentIds.forEach((sid) => formData.append("studentIds", sid));
    } else {
      if (!selectedLabUnitId) {
        setStatusMessage({ text: "Please select an existing Lab Unit.", isError: true });
        return;
      }
      formData.append("labUnitId", selectedLabUnitId);
    }

    startTransition(async () => {
      const result = await applyLabUnitToChallenge(null, formData);
      if (result?.error) {
        setStatusMessage({ text: result.error, isError: true });
      } else if (result?.success) {
        setStatusMessage({ text: "Challenge application submitted successfully!", isError: false });
        setTimeout(() => {
          setIsOpen(false);
          setStatusMessage(null);
        }, 1200);
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
        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 active:scale-98 transition-all cursor-pointer"
      >
        <FlaskConical className="size-3.5" />
        <span>{hasAlreadyApplied ? "Applied (View / Reapply)" : "Apply with Lab Unit"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold">
                  <FlaskConical className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Apply with R&D Lab Unit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lead your student research team on this corporate problem statement.
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

            {/* Challenge Summary Banner */}
            <div className="mb-5 rounded-xl border border-border-muted bg-surface-muted/50 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {challengeType.replaceAll("_", " ")} · {companyName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {challengeTitle}
                  </h4>
                </div>
                {stipend && (
                  <span className="shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    ₹{stipend.toLocaleString("en-IN")} Grant
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Unit Mode Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Lab Unit Selection
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewUnit(false)}
                    disabled={myLabUnits.length === 0}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !isNewUnit
                        ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200"
                        : "border-border-muted bg-surface text-slate-600 hover:bg-surface-muted dark:text-slate-400 disabled:opacity-50"
                    }`}
                  >
                    <span className="text-xs font-bold">Use Existing Lab Unit</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {myLabUnits.length > 0
                        ? `${myLabUnits.length} unit(s) under your supervision`
                        : "No existing units created yet"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewUnit(true)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isNewUnit
                        ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200"
                        : "border-border-muted bg-surface text-slate-600 hover:bg-surface-muted dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold">+ Create New Lab Unit</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Spin up a new dedicated research unit
                    </span>
                  </button>
                </div>
              </div>

              {/* Existing Lab Unit Option */}
              {!isNewUnit ? (
                <div>
                  <label htmlFor="select-labunit" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Select Your Lab Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-labunit"
                    value={selectedLabUnitId}
                    onChange={(e) => setSelectedLabUnitId(e.target.value)}
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                  >
                    {myLabUnits.map((lu) => (
                      <option key={lu.id} value={lu.id}>
                        {lu.name} ({lu.membersCount} student{lu.membersCount !== 1 ? "s" : ""}) {lu.hasApplied ? "• Already Applied" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* New Lab Unit Fields */
                <div className="space-y-3 rounded-xl border border-border-muted bg-surface-muted/30 p-4">
                  <div>
                    <label htmlFor="new-labunit-name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      New Lab Unit Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="new-labunit-name"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="e.g. AI-Vision Research Cohort A"
                      className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Add Student Researchers ({selectedStudentIds.length} selected)
                      </label>
                      <span className="text-[11px] text-slate-400">Optional initially</span>
                    </div>

                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students by name or department..."
                      className="mb-2 w-full rounded-lg border border-border-muted bg-surface px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                    />

                    <div className="max-h-36 overflow-y-auto rounded-xl border border-border-muted bg-surface p-2 space-y-1">
                      {filteredStudents.length === 0 ? (
                        <p className="p-2 text-center text-xs text-slate-400">No students found matching search.</p>
                      ) : (
                        filteredStudents.map((s) => {
                          const isChecked = selectedStudentIds.includes(s.id);
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center justify-between rounded-lg p-2 text-xs transition-colors cursor-pointer ${
                                isChecked
                                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200"
                                  : "hover:bg-surface-muted text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleStudent(s.id)}
                                  className="size-3.5 rounded border-border-muted text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-medium">{s.name}</span>
                                {s.department && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({s.department})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{s.email}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Proposal Details */}
              <div>
                <label htmlFor="proposal-text" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Technical Proposal & Research Scope
                </label>
                <textarea
                  id="proposal-text"
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows={3}
                  placeholder="Outline your lab's technical approach, proposed milestone timeline, and student responsibilities..."
                  className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Status feedback */}
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

              {/* Actions */}
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
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Submit Proposal</span>
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
