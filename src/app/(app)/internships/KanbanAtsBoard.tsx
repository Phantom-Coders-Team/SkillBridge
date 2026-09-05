"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Inbox,
  Star,
  Video,
  Award,
  XCircle,
  Clock,
  ChevronRight,
  User,
  Building2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import MatchBadge from "./MatchBadge";
import { InterviewerScorecardModal } from "./InterviewerScorecardModal";
import { updateApplicationStatus } from "./actions";
import type { Applicant } from "./ApplicantList";

const PIPELINE_COLUMNS = [
  { key: "APPLIED", label: "New Applied", icon: Inbox, color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-300" },
  { key: "SHORTLISTED", label: "Shortlisted", icon: Star, color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-300" },
  { key: "INTERVIEW", label: "Interview", icon: Video, color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-300" },
  { key: "OFFERED", label: "Offered", icon: Award, color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-300" },
  { key: "REJECTED", label: "Rejected", icon: XCircle, color: "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400" },
];

export function KanbanAtsBoard({
  applicants,
  listingSkills,
}: {
  applicants: Applicant[];
  listingSkills?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const handleAdvanceStatus = (appId: string, newStatus: string) => {
    setActiveAppId(appId);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("applicationId", appId);
      fd.set("status", newStatus);
      await updateApplicationStatus(null, fd);
      setActiveAppId(null);
    });
  };

  const getNextStatus = (current: string) => {
    switch (current.toUpperCase()) {
      case "APPLIED":
        return { key: "SHORTLISTED", label: "Shortlist Candidate" };
      case "SHORTLISTED":
        return { key: "INTERVIEW", label: "Schedule Interview" };
      case "INTERVIEW":
        return { key: "OFFERED", label: "Extend Offer" };
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
      {PIPELINE_COLUMNS.map((col) => {
        const Icon = col.icon;
        const colApplicants = applicants.filter((a) => {
          const s = a.status.toUpperCase();
          if (col.key === "OFFERED") return s === "OFFERED" || s === "ACCEPTED" || s === "APPROVED";
          return s === col.key;
        });

        return (
          <div
            key={col.key}
            className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 p-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`flex size-6 items-center justify-center rounded-lg border ${col.color}`}>
                  <Icon className="size-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {col.label}
                </span>
              </div>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {colApplicants.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3 p-3 min-h-[300px]">
              {colApplicants.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-slate-400">
                  <p>No candidates in this stage</p>
                </div>
              ) : (
                colApplicants.map((app) => {
                  const student = app.student;
                  const nextAction = getNextStatus(app.status);
                  const isAdvancing = isPending && activeAppId === app.id;

                  return (
                    <div
                      key={app.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800 space-y-2.5 transition-all"
                    >
                      {/* Top info */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <Link
                            href={`/portfolio/${student.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-purple-600 dark:text-slate-100 dark:hover:text-purple-400 flex items-center gap-1"
                          >
                            <span>{student.name}</span>
                            <ExternalLink className="size-3 text-slate-400" />
                          </Link>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {student.profile?.department || "Student"} • Year {student.profile?.year || "4"}
                          </p>
                        </div>
                        {listingSkills && student.profile?.skills ? (
                          <MatchBadge
                            skills={listingSkills}
                            mySkills={student.profile.skills}
                          />
                        ) : null}
                      </div>

                      {/* Skills Preview */}
                      {student.profile?.skills && (
                        <div className="flex flex-wrap gap-1">
                          {student.profile.skills
                            .split(",")
                            .slice(0, 3)
                            .map((s, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
                              >
                                {s.trim()}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Scorecard & Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700/60">
                        <InterviewerScorecardModal
                          applicationId={app.id}
                          studentName={student.name}
                        />

                        {nextAction && (
                          <button
                            type="button"
                            disabled={isAdvancing}
                            onClick={() => handleAdvanceStatus(app.id, nextAction.key)}
                            className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            {isAdvancing ? (
                              <Sparkles className="size-3 animate-spin" />
                            ) : (
                              <>
                                <span>{nextAction.label.split(" ")[0]}</span>
                                <ChevronRight className="size-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
