"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, ChevronDown, ChevronUp, Calendar, Video, ExternalLink, Clock, CheckCircle2, Award, XCircle } from "lucide-react";
import ExportButton from "./ExportButton";
import ApplicationActions from "./ApplicationActions";
import MatchBadge from "./MatchBadge";
import { parseApplicationMessage, formatInterviewDateTime } from "@/lib/interview";

interface Applicant {
  id: string;
  status: string;
  message?: string | null;
  createdAt?: string | Date;
  student: {
    id: string;
    name: string;
    profile?: { department: string | null; rollNumber: string | null; skills?: string | null } | null;
  };
}

function StatusPill({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "APPROVED" || s === "ACCEPTED" || s === "OFFERED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
        <Award className="size-3 text-emerald-600 dark:text-emerald-400" />
        Approved
      </span>
    );
  }
  if (s === "INTERVIEW") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 animate-pulse">
        <Calendar className="size-3 text-purple-600 dark:text-purple-400" />
        Interview
      </span>
    );
  }
  if (s === "SHORTLISTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
        <CheckCircle2 className="size-3 text-indigo-600 dark:text-indigo-400" />
        Shortlisted
      </span>
    );
  }
  if (s === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
        <XCircle className="size-3 text-rose-600 dark:text-rose-400" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <Clock className="size-3 text-slate-500" />
      Applied
    </span>
  );
}

export default function ApplicantList({
  listingId,
  applicants,
  listingSkills = "",
  autoExpand = false,
}: {
  listingId: string;
  applicants: Applicant[];
  listingSkills?: string;
  autoExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState<boolean>(autoExpand);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 cursor-pointer"
        >
          <Users className="size-3.5 text-indigo-500" />
          <span>
            {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
          </span>
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
        <ExportButton
          href={`/api/exports/applications?listingId=${listingId}`}
          label="Export"
          variant="ghost"
          small
        />
      </div>

      {!expanded ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Click to view candidates, match scores, and interview schedules.
        </p>
      ) : (
        <div className="space-y-3 pt-1">
          {applicants.map((app) => {
            const parsed = parseApplicationMessage(app.message);
            const interview = parsed.interview;

            return (
              <div
                key={app.id}
                className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/60"
              >
                {/* 1. Header: Full Student Name, Match Badge, and Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/${app.student.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-sm"
                    >
                      {app.student.name}
                    </Link>
                    {listingSkills && app.student.profile?.skills && (
                      <MatchBadge skills={listingSkills} mySkills={app.student.profile.skills} />
                    )}
                  </div>
                  <StatusPill status={app.status} />
                </div>

                {/* 2. Subtitle: Department, Roll, Application Date */}
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{app.student.profile?.department ?? "Candidate"}</span>
                  {app.student.profile?.rollNumber && <span> · Roll: {app.student.profile.rollNumber}</span>}
                  {app.createdAt && (
                    <span className="text-slate-400 dark:text-slate-500">
                      {" "}· Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                {/* 3. Cover Letter note (if candidate provided one) */}
                {parsed.coverLetter && (
                  <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                    "{parsed.coverLetter}"
                  </p>
                )}

                {/* 4. Scheduled Interview Details Card */}
                {interview && (
                  <div className="mt-2.5 rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs dark:border-purple-900/60 dark:bg-purple-950/40 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-purple-950 dark:text-purple-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Schedule: {formatInterviewDateTime(interview.date)}</span>
                      </span>
                      <span className="rounded-md bg-purple-200/80 px-2 py-0.5 text-[10px] font-bold text-purple-900 dark:bg-purple-900 dark:text-purple-100">
                        {interview.mode}
                      </span>
                    </div>

                    {interview.link && (
                      <div className="flex items-center gap-1 text-[11px] text-purple-800 dark:text-purple-300">
                        <Video className="size-3 shrink-0" />
                        <span className="font-medium">Link/Venue:</span>
                        {interview.link.startsWith("http") ? (
                          <a
                            href={interview.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 font-bold underline hover:text-purple-950 dark:hover:text-purple-100 truncate max-w-xs"
                          >
                            <span>{interview.link}</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        ) : (
                          <span className="font-medium">{interview.link}</span>
                        )}
                      </div>
                    )}

                    {interview.notes && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-700 dark:text-slate-200">Instructions:</span> {interview.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Action Buttons (Full dedicated line) */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                  <ApplicationActions
                    appId={app.id}
                    currentStatus={app.status}
                    studentName={app.student.name}
                    existingInterview={interview}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
