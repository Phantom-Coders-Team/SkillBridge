"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  FileEdit,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { saveInterviewerScorecardAction } from "./actions";

export function InterviewerScorecardModal({
  applicationId,
  studentName,
  initialRating,
  initialNotes,
}: {
  applicationId: string;
  studentName: string;
  initialRating?: number | null;
  initialNotes?: string | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(initialRating || 4);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveInterviewerScorecardAction(applicationId, rating, notes);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setIsOpen(false);
          router.refresh();
        }, 800);
      } else {
        setError(res.error || "Failed to save scorecard.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-purple-300 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
        title="Interviewer Scorecard & Private Notes"
      >
        <Star className="size-3 text-amber-500 fill-amber-500" />
        <span>{initialRating ? `${initialRating}★ Notes` : "Scorecard"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Star className="size-4 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Interviewer Scorecard
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Scorecard saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Candidate Competency Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`size-6 ${
                            filled
                              ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {rating === 5
                      ? "5/5 - Exceptional"
                      : rating === 4
                      ? "4/5 - Strong Hire"
                      : rating === 3
                      ? "3/5 - Meets Expectations"
                      : rating === 2
                      ? "2/5 - Borderline"
                      : "1/5 - Unsatisfactory"}
                  </span>
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confidential Interviewer Notes & Decision Rationale
                </label>
                <textarea
                  rows={4}
                  placeholder="Record observations regarding problem-solving approach, technical fluency, communication, and recommendation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  🔒 Private to your company's recruitment team. Not visible to the applicant.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Sparkles className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Save Scorecard</span>
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
