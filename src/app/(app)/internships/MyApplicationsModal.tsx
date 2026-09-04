"use client";

import { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  X,
  XCircle,
  Award,
  Zap,
  Video,
} from "lucide-react";
import { Badge, Card, EmptyState, type BadgeTone } from "@/components/ui";
import { calculateSkillMatch } from "@/lib/matchingEngine";
import { parseApplicationMessage, formatInterviewDateTime } from "@/lib/interview";

export interface SerializedApplication {
  id: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  message?: string | null;
  listing: {
    id: string;
    title: string;
    description: string;
    programType: string;
    skills?: string | null;
    duration?: string | null;
    mode?: string | null;
    company: {
      name: string;
      profile?: { companyName?: string | null; location?: string | null } | null;
    };
  };
}

const STAGES = [
  { key: "APPLIED", label: "Applied", icon: Clock },
  { key: "SHORTLISTED", label: "Shortlisted", icon: CheckCircle2 },
  { key: "INTERVIEW", label: "Interview", icon: Calendar },
  { key: "OFFERED", label: "Offered", icon: Award },
];

const STATUS_ORDER: Record<string, number> = {
  APPLIED: 0,
  PENDING: 0,
  SUBMITTED: 0,
  SHORTLISTED: 1,
  INTERVIEW: 2,
  OFFERED: 3,
  ACCEPTED: 3,
  APPROVED: 3,
  SELECTED: 3,
};

export function MyApplicationsModal({
  applications,
  mySkills = "",
}: {
  applications: SerializedApplication[];
  mySkills?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-xs transition-all cursor-pointer"
      >
        <Briefcase className="size-4" />
        <span>My Applications</span>
        {applications.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            {applications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    My Applied Opportunities
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {applications.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track your recruitment stages, interview milestones, and company responses.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content list */}
            {applications.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="You haven't applied to any roles yet"
                description="Browse available corporate internships and learning programs on this page and submit your profile."
              />
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const companyName =
                    app.listing.company.profile?.companyName || app.listing.company.name;
                  const normalizedStatus = String(app.status || "APPLIED").toUpperCase();
                  const isRejected = normalizedStatus === "REJECTED";
                  const currentIdx = STATUS_ORDER[normalizedStatus] ?? 0;

                  // Skill match
                  const match = calculateSkillMatch(mySkills, app.listing.skills ?? "");

                  return (
                    <div
                      key={app.id}
                      className="rounded-xl border border-border-muted bg-surface p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      {/* Top bar: Title + Company + Match */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {app.listing.programType.replaceAll("_", " ")}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="size-3" />
                              Applied: {new Date(app.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {app.listing.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="size-3.5 text-slate-400" />
                            {companyName}
                            {app.listing.company.profile?.location && (
                              <>
                                <span>•</span>
                                <MapPin className="size-3 text-slate-400" />
                                {app.listing.company.profile.location}
                              </>
                            )}
                          </p>
                        </div>

                        {/* Status & Match Badges */}
                        <div className="shrink-0 flex items-center gap-2 flex-wrap">
                          {normalizedStatus === "APPROVED" || normalizedStatus === "OFFERED" || normalizedStatus === "ACCEPTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/40 animate-pulse">
                              <Award className="size-3 text-emerald-600 dark:text-emerald-400" />
                              Offer Accepted
                            </span>
                          ) : normalizedStatus === "SHORTLISTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-500/40">
                              <CheckCircle2 className="size-3 text-indigo-600 dark:text-indigo-400" />
                              Shortlisted
                            </span>
                          ) : normalizedStatus === "INTERVIEW" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-500/40">
                              <Calendar className="size-3 text-amber-600 dark:text-amber-400" />
                              Interview
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-500/40">
                              <XCircle className="size-3 text-rose-600 dark:text-rose-400" />
                              Not Selected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-500/40">
                              <Clock className="size-3 text-blue-600 dark:text-blue-400" />
                              Applied
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Zap className="size-3 text-indigo-500" />
                            {match.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* 4-Step Recruitment Status Stepper */}
                      <div className="my-4 pt-2">
                        {isRejected ? (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                            <XCircle className="size-5 shrink-0 text-rose-500" />
                            <div className="text-xs">
                              <p className="font-bold">Application Not Selected</p>
                              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                                Thank you for your application. Keep strengthening your verified skills for upcoming cycles.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            {/* Track line */}
                            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
                            <div
                              className="absolute top-4 left-6 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                              style={{
                                width: `calc(${(currentIdx / 3) * 100}% - 24px)`,
                              }}
                            />

                            <div className="flex items-center justify-between relative z-10">
                              {STAGES.map((stage, idx) => {
                                const isDone = idx <= currentIdx;
                                const isCurrent = idx === currentIdx;
                                const Icon = stage.icon;

                                return (
                                  <div key={stage.key} className="flex flex-col items-center gap-1.5">
                                    <div
                                      className={`size-8 rounded-full flex items-center justify-center transition-all ${
                                        isCurrent
                                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950 shadow-md scale-110"
                                          : isDone
                                          ? "bg-emerald-500 text-white"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                                      }`}
                                    >
                                      <Icon className="size-4" />
                                    </div>
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        isCurrent
                                          ? "text-indigo-600 dark:text-indigo-400 font-bold"
                                          : isDone
                                          ? "text-slate-800 dark:text-slate-200"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {stage.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scheduled Interview Details Card */}
                      {(() => {
                        const parsed = parseApplicationMessage(app.message);
                        const interview = parsed.interview;
                        if (!interview) return null;

                        return (
                          <div className="my-3 rounded-xl border border-purple-200 bg-purple-50/80 p-3.5 text-xs dark:border-purple-900/60 dark:bg-purple-950/40 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-purple-950 dark:text-purple-200">
                              <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
                                Interview Scheduled: {formatInterviewDateTime(interview.date)}
                              </span>
                              <span className="rounded-md bg-purple-200/90 px-2.5 py-0.5 text-[11px] font-bold text-purple-900 dark:bg-purple-900 dark:text-purple-100">
                                {interview.mode}
                              </span>
                            </div>

                            {interview.link && (
                              <div className="flex items-center gap-1.5 text-xs text-purple-900 dark:text-purple-200">
                                <Video className="size-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                                <span className="font-semibold">Meeting URL / Venue:</span>
                                {interview.link.startsWith("http") ? (
                                  <a
                                    href={interview.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                                  >
                                    <span>Join Interview</span>
                                    <ExternalLink className="size-3" />
                                  </a>
                                ) : (
                                  <span className="font-medium">{interview.link}</span>
                                )}
                              </div>
                            )}

                            {interview.notes && (
                              <div className="rounded-lg bg-white/70 dark:bg-slate-900/50 p-2 text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">Instructions:</span> {interview.notes}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Required Skills pill row */}
                      {app.listing.skills && (
                        <div className="mt-3 pt-3 border-t border-border-muted/60 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[11px] text-slate-400 font-medium">Skills:</span>
                          {app.listing.skills.split(",").map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
