"use client";

import { useState, useTransition } from "react";
import { Sparkles, X, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { postChallenge } from "./actions";

export default function PostChallengeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatusMessage(null);
    startTransition(async () => {
      const result = await postChallenge(null, formData);
      if (result?.error) {
        setStatusMessage({ text: result.error, isError: true });
      } else if (result?.success) {
        setStatusMessage({ text: "Challenge posted successfully!", isError: false });
        form.reset();
        setTimeout(() => {
          setIsOpen(false);
          setStatusMessage(null);
        }, 900);
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
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
      >
        <Plus className="size-4 stroke-[2.5]" />
        <span>Post Challenge</span>
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
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Post Industry Challenge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create a capstone, R&D sprint, or micro-consultancy task for university teams.
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="modal-title" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Challenge Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="modal-title"
                    name="title"
                    required
                    placeholder="e.g. GenAI Document Intelligence & Entity Extraction"
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="modal-type" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Challenge Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="modal-type"
                    name="challengeType"
                    required
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="CAPSTONE">Capstone Project</option>
                    <option value="R_AND_D">R&D Sprint</option>
                    <option value="MICRO_CONSULTANCY">Micro-Consultancy</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-domain" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Domain
                  </label>
                  <input
                    id="modal-domain"
                    name="domain"
                    placeholder="e.g. Generative AI, Cloud, IoT"
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="modal-techStack" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Tech Stack
                  </label>
                  <input
                    id="modal-techStack"
                    name="techStack"
                    placeholder="e.g. Python, LangChain, FastAPI, Docker"
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="modal-stipend" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Stipend / Grant (₹)
                  </label>
                  <input
                    id="modal-stipend"
                    name="stipend"
                    type="number"
                    min={0}
                    placeholder="e.g. 25000"
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="modal-deadline" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Submission Deadline
                  </label>
                  <input
                    id="modal-deadline"
                    name="deadline"
                    type="date"
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="modal-description" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Problem Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="modal-description"
                    name="description"
                    required
                    rows={4}
                    placeholder="Describe the challenge scope, industry background, and technical objectives..."
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="modal-objectives" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Key Deliverables / Milestones
                  </label>
                  <textarea
                    id="modal-objectives"
                    name="objectives"
                    rows={2}
                    placeholder="e.g. Phase 1: Dataset & Pipeline, Phase 2: MVP model, Phase 3: Benchmarks report"
                    className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl border border-border-muted bg-surface-muted/50">
                  <input
                    id="modal-rndOnly"
                    name="rndOnly"
                    type="checkbox"
                    className="size-4 rounded border-border-muted text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="modal-rndOnly" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    R&D Only (Requires dedicated faculty-guided Academic Lab Unit to apply)
                  </label>
                </div>
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
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Post Challenge</span>
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
