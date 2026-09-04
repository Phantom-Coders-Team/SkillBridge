"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  X,
  Users2,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import { Badge, EmptyState, type BadgeTone } from "@/components/ui";
import { updateChallengeStatus, updateChallengeApplicationStatus } from "./actions";

export interface SerializedChallenge {
  id: string;
  title: string;
  description: string;
  challengeType: string;
  domain?: string | null;
  techStack?: string | null;
  objectives?: string | null;
  stipend?: number | null;
  status: string;
  deadline?: string | Date | null;
  rndOnly: boolean;
  createdAt: string | Date;
  applications: Array<{
    id: string;
    proposal?: string | null;
    status: string;
    createdAt: string | Date;
    labUnit: {
      id: string;
      name: string;
      faculty?: { name: string; email: string } | null;
      members: Array<{
        student: {
          name: string;
          email: string;
          profile?: { department?: string | null } | null;
        };
      }>;
    };
  }>;
  _count: {
    applications: number;
    labUnits: number;
  };
}

const TYPE_TONE: Record<string, BadgeTone> = {
  CAPSTONE: "blue",
  R_AND_D: "purple",
  MICRO_CONSULTANCY: "orange",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  OPEN: "green",
  ASSIGNED: "amber",
  IN_PROGRESS: "blue",
  COMPLETED: "emerald",
  CLOSED: "gray",
};

export default function MyChallengesModal({
  challenges = [],
  onOpenPostModal,
}: {
  challenges: SerializedChallenge[];
  onOpenPostModal?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED">("ALL");

  const toggleExpand = (id: string) => {
    setExpandedChallengeId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = (challengeId: string, newStatus: string) => {
    startTransition(async () => {
      await updateChallengeStatus(challengeId, newStatus);
    });
  };

  const handleApplicationStatus = (applicationId: string, newStatus: string) => {
    startTransition(async () => {
      await updateChallengeApplicationStatus(applicationId, newStatus);
    });
  };

  const filteredChallenges = challenges.filter((c) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "OPEN") return c.status === "OPEN";
    if (filterStatus === "IN_PROGRESS") return c.status === "IN_PROGRESS" || c.status === "ASSIGNED";
    if (filterStatus === "CLOSED") return c.status === "CLOSED" || c.status === "COMPLETED";
    return true;
  });

  const totalApplications = challenges.reduce((acc, c) => acc + (c.applications?.length || 0), 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-xs transition-all cursor-pointer"
      >
        <FolderKanban className="size-4" />
        <span>My Challenges</span>
        {challenges.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            {challenges.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  <FolderKanban className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      My Posted Challenges
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {challenges.length} Total
                    </span>
                    {totalApplications > 0 && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        {totalApplications} Applications
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage your company problem statements, track team applications, and update challenge statuses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenPostModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenPostModal();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>New Challenge</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            {challenges.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === "ALL"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  All ({challenges.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("OPEN")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === "OPEN"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  Open ({challenges.filter((c) => c.status === "OPEN").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("IN_PROGRESS")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === "IN_PROGRESS"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  In Progress ({challenges.filter((c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("CLOSED")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === "CLOSED"
                      ? "bg-slate-700 text-white shadow-xs"
                      : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  Completed / Closed ({challenges.filter((c) => c.status === "CLOSED" || c.status === "COMPLETED").length})
                </button>
                {isPending && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="size-3.5 animate-spin" /> Updating...
                  </span>
                )}
              </div>
            )}

            {/* List */}
            {challenges.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={Sparkles}
                  title="No challenges posted yet"
                  description="Your company hasn't posted any challenge or capstone project yet. Create your first challenge to connect with academic research teams."
                />
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No challenges match the selected filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChallenges.map((c) => {
                  const isExpanded = expandedChallengeId === c.id;
                  const appCount = c.applications?.length || 0;

                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs transition-all hover:border-border-default"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <Badge tone={TYPE_TONE[c.challengeType] ?? "gray"}>
                              {c.challengeType.replaceAll("_", " ")}
                            </Badge>
                            <Badge tone={STATUS_TONE[c.status] ?? "gray"}>
                              {c.status.replaceAll("_", " ")}
                            </Badge>
                            {c.rndOnly && (
                              <span className="rounded-lg bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                                R&D Only
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {c.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                            {c.description}
                          </p>

                          {/* Metadata row */}
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                            {c.domain && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <span className="text-slate-400">Domain:</span> {c.domain}
                              </span>
                            )}
                            {c.techStack && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <span className="text-slate-400">Stack:</span> {c.techStack}
                              </span>
                            )}
                            {c.stipend != null && (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                ₹{c.stipend.toLocaleString("en-IN")} Grant
                              </span>
                            )}
                            {c.deadline && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="size-3 text-slate-400" />
                                Due {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Manager Control */}
                        <div className="flex sm:flex-col items-end gap-2 shrink-0">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                            Challenge Status
                          </label>
                          <select
                            value={c.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            className="rounded-xl border border-border-muted bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                          >
                            <option value="OPEN">Open for Applications</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </div>
                      </div>

                      {/* Applications toggle footer */}
                      <div className="mt-4 pt-3 border-t border-border-muted flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                            <Users2 className="size-3.5 text-indigo-500" />
                            {appCount} Applicant Team{appCount !== 1 ? "s" : ""}
                          </span>
                          {c._count?.labUnits > 0 && (
                            <span className="text-slate-400">
                              · {c._count.labUnits} Active Lab Unit{c._count.labUnits !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {appCount > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Proposals" : `Review Proposals (${appCount})`}</span>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* Expanded Applications Section */}
                      {isExpanded && appCount > 0 && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-border-muted bg-surface-muted/40 p-4 rounded-xl">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Applicant Teams & Proposals
                          </h5>
                          {c.applications.map((app) => (
                            <div
                              key={app.id}
                              className="rounded-xl border border-border-muted bg-surface p-3.5 shadow-2xs space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                      {app.labUnit?.name || "Academic Lab Team"}
                                    </span>
                                    <Badge
                                      tone={
                                        app.status === "APPROVED" || app.status === "ACCEPTED"
                                          ? "green"
                                          : app.status === "REJECTED"
                                          ? "red"
                                          : "blue"
                                      }
                                    >
                                      {app.status}
                                    </Badge>
                                  </div>
                                  {app.labUnit?.faculty && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Faculty Mentor: {app.labUnit.faculty.name} ({app.labUnit.faculty.email})
                                    </p>
                                  )}
                                </div>

                                {/* Actions for proposal */}
                                <div className="flex items-center gap-1.5">
                                  {app.status !== "APPROVED" && app.status !== "ACCEPTED" && (
                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleApplicationStatus(app.id, "APPROVED")}
                                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                                    >
                                      <CheckCircle2 className="size-3" />
                                      <span>Accept</span>
                                    </button>
                                  )}
                                  {app.status !== "REJECTED" && (
                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleApplicationStatus(app.id, "REJECTED")}
                                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                    >
                                      <XCircle className="size-3" />
                                      <span>Decline</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Student Members */}
                              {app.labUnit?.members && app.labUnit.members.length > 0 && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    Student Researchers:{" "}
                                  </span>
                                  {app.labUnit.members.map((m, idx) => (
                                    <span key={idx}>
                                      {m.student.name}
                                      {m.student.profile?.department ? ` (${m.student.profile.department})` : ""}
                                      {idx < app.labUnit.members.length - 1 ? ", " : ""}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Proposal Note */}
                              {app.proposal && (
                                <div className="rounded-lg bg-surface-muted p-2.5 text-xs text-slate-600 dark:text-slate-300">
                                  <span className="font-semibold block mb-0.5 text-slate-700 dark:text-slate-200">
                                    Approach Proposal:
                                  </span>
                                  {app.proposal}
                                </div>
                              )}
                            </div>
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
