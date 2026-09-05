"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Send,
  UploadCloud,
  FileText,
  Star,
  Award,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  submitFacultyMilestoneAction,
  evaluateFacultyMilestoneAction,
} from "./actions";
import { FacultyCertificateModal } from "./FacultyCertificateModal";

const STAGES = [
  { key: "ENROLLED", label: "1. Enrolled" },
  { key: "WORKPLAN_SUBMITTED", label: "2. Workplan" },
  { key: "MIDTERM_REVIEW", label: "3. Midterm" },
  { key: "FINAL_PROJECT", label: "4. Final Delivery" },
  { key: "COMPLETED", label: "5. Certified" },
];

export function FacultyMilestoneTracker({
  application,
  isIndustryViewer = false,
}: {
  application: {
    id: string;
    status: string;
    milestoneStage: string;
    workplanUrl?: string | null;
    finalReportUrl?: string | null;
    mentorRating?: number | null;
    mentorFeedback?: string | null;
    completionCertificateHash?: string | null;
    createdAt: string | Date;
    faculty: { id: string; name: string; email: string };
    listing: {
      id: string;
      title: string;
      company: { name: string; profile?: { companyName?: string | null } | null };
    };
  };
  isIndustryViewer?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);

  // Faculty submission form states
  const [workplanUrl, setWorkplanUrl] = useState(application.workplanUrl || "");
  const [finalReportUrl, setFinalReportUrl] = useState(application.finalReportUrl || "");
  const [milestoneNotes, setMilestoneNotes] = useState("");
  const [targetStage, setTargetStage] = useState(
    application.milestoneStage === "ENROLLED"
      ? "WORKPLAN_SUBMITTED"
      : application.milestoneStage === "WORKPLAN_SUBMITTED"
      ? "MIDTERM_REVIEW"
      : "FINAL_PROJECT"
  );

  // Industry Evaluation states
  const [rating, setRating] = useState(application.mentorRating || 5);
  const [feedback, setFeedback] = useState(application.mentorFeedback || "");
  const [approveCompletion, setApproveCompletion] = useState(true);

  const currentIdx = STAGES.findIndex((s) => s.key === application.milestoneStage);

  const handleFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitFacultyMilestoneAction({
        applicationId: application.id,
        milestoneStage: targetStage,
        workplanUrl: workplanUrl || undefined,
        finalReportUrl: finalReportUrl || undefined,
        notes: milestoneNotes,
      });
      if (res.success) {
        setShowSubmitModal(false);
        router.refresh();
      }
    });
  };

  const handleMentorEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await evaluateFacultyMilestoneAction({
        applicationId: application.id,
        rating,
        feedback,
        approveCompletion,
      });
      if (res.success) {
        setShowEvaluateModal(false);
        router.refresh();
      }
    });
  };

  const companyDisplayName =
    application.listing.company.profile?.companyName || application.listing.company.name;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90 shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {application.listing.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {companyDisplayName} • Faculty: <strong className="text-slate-700 dark:text-slate-300">{application.faculty.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {application.completionCertificateHash ? (
            <FacultyCertificateModal
              certificateHash={application.completionCertificateHash}
              facultyName={application.faculty.name}
              programTitle={application.listing.title}
              companyName={companyDisplayName}
              mentorRating={application.mentorRating}
              mentorFeedback={application.mentorFeedback}
            />
          ) : (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
              {application.milestoneStage.replace(/_/g, " ")}
            </span>
          )}

          {!isIndustryViewer && application.milestoneStage !== "COMPLETED" && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 active:scale-95 transition-all shadow-2xs"
            >
              <Send className="size-3" />
              <span>Submit Milestone</span>
            </button>
          )}

          {isIndustryViewer && (
            <button
              onClick={() => setShowEvaluateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-2xs"
            >
              <Star className="size-3 fill-white" />
              <span>Evaluate & Certify</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {STAGES.map((s, idx) => {
          const isPassed = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={s.key} className="flex flex-col items-center text-center space-y-1">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isPassed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isCurrent
                    ? "bg-purple-600 text-white animate-pulse"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}
              >
                {isPassed ? <CheckCircle2 className="size-4" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-semibold line-clamp-1 ${
                  isPassed
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mentor Feedback Box if evaluated */}
      {application.mentorFeedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
            <span>Corporate Mentor Evaluation:</span>
            <span>{application.mentorRating}/5 Stars</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 italic">
            "{application.mentorFeedback}"
          </p>
        </div>
      )}

      {/* Faculty Submit Deliverables Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Submit Industrial Training Milestone
            </h4>
            <form onSubmit={handleFacultySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Phase
                </label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="WORKPLAN_SUBMITTED">Workplan & Pedagogy Objectives</option>
                  <option value="MIDTERM_REVIEW">Mid-Term Progress & Lab Units</option>
                  <option value="FINAL_PROJECT">Final Deliverables & Curriculum Modernization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workplan / Document Link (Google Drive / GitHub)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={workplanUrl}
                  onChange={(e) => setWorkplanUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Final Deliverable / Repository URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={finalReportUrl}
                  onChange={(e) => setFinalReportUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Progress Summary & Academic Takeaways
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key industry architectures observed and how they will be integrated into university curriculum..."
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  {isPending ? "Submitting..." : "Submit for Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentor Evaluation Modal */}
      {showEvaluateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Evaluate Faculty Industrial Training
            </h4>
            <form onSubmit={handleMentorEvaluate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Competency & Impact Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-lg"
                    >
                      <Star className={`size-6 ${rating >= star ? "fill-amber-500" : "text-slate-300"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mentor Pedagogical & Technical Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide structured remarks on faculty contribution, industry alignment, and curriculum recommendations..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="approve-completion"
                  checked={approveCompletion}
                  onChange={(e) => setApproveCompletion(e.target.checked)}
                  className="accent-emerald-600 size-4 cursor-pointer"
                />
                <label htmlFor="approve-completion" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Approve Completion & Issue Official Verifiable Certificate
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEvaluateModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {isPending ? "Recording..." : "Save & Certify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
