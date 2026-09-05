"use client";

import { useState, useTransition } from "react";
import { Award, CheckCircle2, Star, Loader2, X } from "lucide-react";
import { updateApplicationStatus } from "./actions";

interface CompleteInternshipModalProps {
  appId: string;
  studentName: string;
}

export default function CompleteInternshipModal({
  appId,
  studentName,
}: CompleteInternshipModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [grade, setGrade] = useState("Outstanding (A+)");
  const [mentorFeedback, setMentorFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("appId", appId);
    formData.append("status", "COMPLETED");
    formData.append("rating", rating.toString());
    formData.append("grade", grade);
    formData.append(
      "mentorFeedback",
      mentorFeedback || "Successfully fulfilled all engineering milestones and project requirements with high diligence."
    );

    startTransition(async () => {
      const res = await updateApplicationStatus(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          window.location.reload();
        }, 1000);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-7 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-[11px] font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
        title="Complete internship and issue mentor feedback & completion record"
      >
        <Award className="size-3" />
        Complete & Issue Certificate
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Award className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Complete Internship & Issue Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluating candidate: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{studentName}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mentor Performance Rating
                </label>
                <div className="mt-1.5 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating ?? rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`size-6 ${
                            active
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Performance Grade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Internship Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Outstanding (A+)">Outstanding (A+) - Exceptional industry readiness</option>
                  <option value="Exceeds Expectations (A)">Exceeds Expectations (A) - Highly commendable work</option>
                  <option value="Meets Expectations (B+)">Meets Expectations (B+) - Solid deliverables</option>
                  <option value="Satisfactory (B)">Satisfactory (B) - Fulfilled minimum expectations</option>
                </select>
              </div>

              {/* Qualitative Mentor Feedback */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mentor Recommendation & Feedback
                </label>
                <textarea
                  value={mentorFeedback}
                  onChange={(e) => setMentorFeedback(e.target.value)}
                  placeholder="Provide qualitative feedback on candidate's technical contribution, agile teamwork, and work ethic..."
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-xl border border-border-muted bg-surface p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  💡 <strong>Digital Credential Notice:</strong> Completing this internship will automatically record a verified credential on the candidate&apos;s digital portfolio and boost their Placement Readiness Index (PRI).
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </p>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Internship record minted & verified successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-border-muted px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Award className="size-3.5" /> Submit & Mint Record
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
