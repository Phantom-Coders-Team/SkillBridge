"use client";

import { useState } from "react";
import {
  Award,
  ShieldCheck,
  Printer,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Star,
} from "lucide-react";

export function FacultyCertificateModal({
  certificateHash,
  facultyName,
  programTitle,
  companyName,
  mentorRating,
  mentorFeedback,
  completedDate,
}: {
  certificateHash: string;
  facultyName: string;
  programTitle: string;
  companyName: string;
  mentorRating?: number | null;
  mentorFeedback?: string | null;
  completedDate?: string | Date;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = completedDate
    ? new Date(completedDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
      >
        <Award className="size-3.5" />
        <span>View Certificate</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl text-slate-900 border-4 border-emerald-600/30 dark:bg-slate-900 dark:text-slate-100 dark:border-emerald-500/30 print:m-0 print:p-6 print:border-none">
            {/* Close & Print Buttons */}
            <div className="flex items-center justify-end gap-2 print:hidden mb-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              >
                <Printer className="size-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Certificate Border & Header */}
            <div className="text-center space-y-4 border-2 border-emerald-500/40 rounded-2xl p-8 bg-gradient-to-b from-emerald-50/20 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/30">
              <div className="flex items-center justify-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                  <Award className="size-7" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                  National Skill Development & Academia-Industry Collaboration Framework
                </span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1 font-serif">
                  Certificate of Faculty Industrial Training
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Under AICTE NEP-2020 Faculty Development & Industry Sabbatical Guidelines
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-2">
                This credential is officially conferred to
              </p>

              <div className="py-1">
                <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 underline decoration-emerald-500/40 decoration-wavy">
                  {facultyName}
                </h3>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                in recognition of the successful completion of rigorous industry sabbatical milestones, collaborative curriculum modernization, and practical technology immersion in{" "}
                <strong className="font-bold text-slate-900 dark:text-slate-100">{programTitle}</strong>{" "}
                conducted by{" "}
                <strong className="font-bold text-emerald-600 dark:text-emerald-400">{companyName}</strong>.
              </p>

              {/* Mentor Feedback & Rating Pill */}
              {mentorRating && (
                <div className="mx-auto max-w-md rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-left dark:border-emerald-800 dark:bg-emerald-950/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">
                      Corporate Mentor Assessment:
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(mentorRating)].map((_, i) => (
                        <Star key={i} className="size-3 fill-amber-500" />
                      ))}
                      <span className="ml-1 text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {mentorRating}/5
                      </span>
                    </div>
                  </div>
                  {mentorFeedback && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{mentorFeedback}"
                    </p>
                  )}
                </div>
              )}

              {/* Signatures & Hash */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Building2 className="size-3.5" />
                    <span>{companyName}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Authorized Industry Division</p>
                  <p className="text-[10px] text-slate-400">Date Issued: {formattedDate}</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>HASH: {certificateHash}</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Cryptographically Validated
                  </p>
                  <p className="text-[9px] text-slate-400">SkillBridge Consortium Ledger</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
