"use client";

import { useActionState } from "react";
import { Check, X, Loader2, PlayCircle, Award, CheckCircle2 } from "lucide-react";
import { updateApplicationStatus } from "./actions";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import CompleteInternshipModal from "./CompleteInternshipModal";
import type { InterviewDetails, InternshipFeedback } from "@/lib/interview";

export default function ApplicationActions({
  appId,
  currentStatus,
  studentName = "Candidate",
  existingInterview,
  existingFeedback,
}: {
  appId: string;
  currentStatus: string;
  studentName?: string;
  existingInterview?: InterviewDetails;
  existingFeedback?: InternshipFeedback;
}) {
  const [state, action, pending] = useActionState(updateApplicationStatus, null);

  const isCompleted = currentStatus === "COMPLETED";
  const isApproved = currentStatus === "APPROVED";
  const isInProgress = currentStatus === "IN_PROGRESS";
  const isRejected = currentStatus === "REJECTED";
  const isInterview = currentStatus === "INTERVIEW";

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
        <Award className="size-3 text-indigo-600 dark:text-indigo-400" /> Completed & Verified
      </span>
    );
  }

  if (isRejected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
        <X className="size-3" /> Rejected
      </span>
    );
  }

  if (isApproved || isInProgress) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {isApproved && (
          <form action={action}>
            <input type="hidden" name="appId" value={appId} />
            <input type="hidden" name="status" value="IN_PROGRESS" />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-2 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer shadow-2xs"
              title="Mark as In Progress (Student actively working)"
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <PlayCircle className="size-3" />}
              Start Internship
            </button>
          </form>
        )}

        {isInProgress && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <PlayCircle className="size-3 animate-pulse" /> Active Work
          </span>
        )}

        <CompleteInternshipModal appId={appId} studentName={studentName} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Schedule or Reschedule Interview Modal */}
      <ScheduleInterviewModal
        appId={appId}
        studentName={studentName}
        existingInterview={existingInterview}
        isReschedule={isInterview}
      />

      {/* Approve button */}
      <form action={action}>
        <input type="hidden" name="appId" value={appId} />
        <input type="hidden" name="status" value="APPROVED" />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer shadow-2xs"
          title="Approve candidate and make offer"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Approve
        </button>
      </form>

      {/* Reject button */}
      <form action={action}>
        <input type="hidden" name="appId" value={appId} />
        <input type="hidden" name="status" value="REJECTED" />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-rose-600 px-2 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60 cursor-pointer shadow-2xs"
          title="Reject application"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
          Reject
        </button>
      </form>

      {state?.error && <p className="text-[11px] text-red-600 dark:text-red-400">{state.error}</p>}
    </div>
  );
}
