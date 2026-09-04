"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import ExportButton from "./ExportButton";
import ApplicationActions from "./ApplicationActions";
import MatchBadge from "./MatchBadge";

interface Applicant {
  id: string;
  status: string;
  student: {
    id: string;
    name: string;
    profile?: { department: string | null; rollNumber: string | null; skills?: string | null } | null;
  };
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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          <Users className="size-3.5" />
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
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
        <p className="text-[11px] text-slate-400 dark:text-slate-500">Student details minimized. Click to expand.</p>
      ) : (
        applicants.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2 dark:border-slate-700"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${app.student.id}`}
                  className="truncate text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {app.student.name}
                </Link>
                {listingSkills && app.student.profile?.skills && (
                  <MatchBadge skills={listingSkills} mySkills={app.student.profile.skills} />
                )}
              </div>
              <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                {app.student.profile?.department ?? "—"} · {app.student.profile?.rollNumber ?? ""}
              </p>
            </div>
            <ApplicationActions appId={app.id} currentStatus={app.status} />
          </div>
        ))
      )}
    </div>
  );
}
