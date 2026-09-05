"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Square,
  Sparkles,
  Users,
  Star,
  Video,
  XCircle,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { bulkUpdateApplicationStatusAction } from "./actions";
import type { Applicant } from "./ApplicantList";

export function BulkShortlistBar({
  applicants,
  selectedIds,
  onToggleSelectAll,
  onClearSelection,
}: {
  applicants: Applicant[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBulkAction = (targetStatus: string) => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const res = await bulkUpdateApplicationStatusAction(selectedIds, targetStatus);
      if (res.success) {
        setSuccessMsg(`Successfully updated ${res.count || selectedIds.length} candidate(s) to ${targetStatus}!`);
        onClearSelection();
        setTimeout(() => {
          setSuccessMsg(null);
          router.refresh();
        }, 1500);
      }
    });
  };

  if (applicants.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
          >
            {selectedIds.length === applicants.length && applicants.length > 0 ? (
              <CheckSquare className="size-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <Square className="size-4 text-slate-400" />
            )}
            <span>
              {selectedIds.length > 0 ? `Selected (${selectedIds.length}/${applicants.length})` : "Select All Candidates"}
            </span>
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkAction("SHORTLISTED")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              {isPending ? (
                <Sparkles className="size-3.5 animate-spin" />
              ) : (
                <Star className="size-3.5" />
              )}
              <span>Bulk Shortlist</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkAction("INTERVIEW")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 disabled:opacity-50 transition-all"
            >
              <Video className="size-3.5" />
              <span>Bulk Invite to Interview</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkAction("REJECTED")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30 transition-all"
            >
              <XCircle className="size-3.5" />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
