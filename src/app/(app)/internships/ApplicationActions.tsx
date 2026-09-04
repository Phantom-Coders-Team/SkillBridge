"use client";

import { useActionState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { updateApplicationStatus } from "./actions";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import type { InterviewDetails } from "@/lib/interview";

export default function ApplicationActions({
  appId,
  currentStatus,
  studentName = "Candidate",
  existingInterview,
}: {
  appId: string;
  currentStatus: string;
  studentName?: string;
  existingInterview?: InterviewDetails;
}) {
  const [state, action, pending] = useActionState(updateApplicationStatus, null);

  const isFinal = currentStatus === "APPROVED" || currentStatus === "REJECTED";
  const isInterview = currentStatus === "INTERVIEW";

  if (isFinal) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          currentStatus === "APPROVED"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
        }`}
      >
        {currentStatus === "APPROVED" ? (
          <><Check className="size-3" /> Approved & Offered</>
        ) : (
          <><X className="size-3" /> Rejected</>
        )}
      </span>
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
