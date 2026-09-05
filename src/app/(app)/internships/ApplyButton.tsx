"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, FileText, CheckCircle2, AlertCircle, ExternalLink, Send } from "lucide-react";
import { applyToOpportunity, type ActionState } from "./actions";

interface ApplyButtonProps {
  listingId: string;
  studentResume?: { id: string; name: string } | null;
}

export default function ApplyButton({ listingId, studentResume }: ApplyButtonProps) {
  const [state, action, pending] = useActionState(applyToOpportunity, null);

  return (
    <form action={action} className="space-y-2.5">
      <input type="hidden" name="listingId" value={listingId} />

      {/* Resume & Portfolio Attachment Indicator */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Attached Profile Credentials:
          </span>
          <Link
            href="/portfolio"
            target="_blank"
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400 text-[11px]"
          >
            <span>My Portfolio</span>
            <ExternalLink className="size-2.5" />
          </Link>
        </div>

        {studentResume ? (
          <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg bg-white p-1.5 border border-indigo-100 dark:bg-slate-800 dark:border-indigo-900/50">
            <div className="flex items-center gap-1.5 min-w-0">
              <FileText className="size-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="truncate font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                {studentResume.name}
              </span>
            </div>
            <a
              href={`/api/documents/${studentResume.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Preview
            </a>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-1">
              <AlertCircle className="size-3 shrink-0" />
              <span>No resume attached yet</span>
            </div>
            <Link
              href="/portfolio"
              className="font-bold underline hover:text-amber-800 dark:hover:text-amber-300"
            >
              Upload
            </Link>
          </div>
        )}
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          Your verified skill scores, projects, and resume will be sent to the hiring team.
        </p>
      </div>

      <textarea
        name="message"
        rows={2}
        placeholder="Introduce yourself or pitch your fit to the hiring team…"
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-600 dark:bg-surface dark:text-slate-100"
      />

      <button
        type="submit"
        disabled={pending}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Submitting credentials...</span>
          </>
        ) : (
          <>
            <Send className="size-3.5" />
            <span>Apply with Portfolio & Resume</span>
          </>
        )}
      </button>

      {state?.success && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>Application & portfolio submitted successfully!</span>
        </div>
      )}
      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
