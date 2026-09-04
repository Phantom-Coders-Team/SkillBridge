"use client";

import { useState, useTransition } from "react";
import {
  Trophy,
  Award,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Building2,
  Send,
  Loader2,
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
  BookOpen,
  FolderGit2,
  CalendarClock,
  Flame,
  Info,
  X,
  IndianRupee,
} from "lucide-react";
import { Badge, Card, EmptyState, type BadgeTone } from "@/components/ui";
import { pitchTopCandidate, respondToPitch } from "./actions";
import type { PriResult } from "@/lib/pri";

const PRI_THRESHOLD = 850;

export interface Candidate {
  id: string;
  name: string;
  department: string | null;
  year: number | null;
  skills?: string | null;
  avatarUrl?: string | null;
  pri: PriResult;
}

export interface IncomingPitch {
  id: string;
  roleDetails: string | null;
  stipend: number | null;
  priScore: number;
  status: string;
  createdAt: string;
  industry: {
    id: string;
    name: string;
    companyName?: string | null;
    location?: string | null;
  };
}

export interface SentPitch {
  id: string;
  roleDetails: string | null;
  stipend: number | null;
  priScore: number;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    department?: string | null;
  };
}

const PITCH_STATUS_TONE: Record<string, BadgeTone> = {
  PITCHED: "blue",
  SHORTLISTED: "purple",
  OFFERED: "amber",
  ACCEPTED: "green",
  REJECTED: "red",
};

export function ReversePlacementClient({
  candidates = [],
  viewerRole,
  currentUserId,
  incomingPitches = [],
  sentPitches = [],
}: {
  candidates: Candidate[];
  viewerRole: "STUDENT" | "INDUSTRIES" | "INDUSTRY" | "INSTITUTIONS" | "ACADEMICIAN" | "FACULTY";
  currentUserId: string;
  incomingPitches?: IncomingPitch[];
  sentPitches?: SentPitch[];
}) {
  const isRecruiter = viewerRole === "INDUSTRIES" || viewerRole === "INDUSTRY";
  const isStudent = viewerRole === "STUDENT";

  const [activeTab, setActiveTab] = useState<"LEADERBOARD" | "MY_PITCHES" | "INCOMING">("LEADERBOARD");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "LOCKED">("ALL");

  // Pitch Modal state
  const [selectedForPitch, setSelectedForPitch] = useState<Candidate | null>(null);
  const [roleDetails, setRoleDetails] = useState("");
  const [stipend, setStipend] = useState(35000);
  const [pitchMessage, setPitchMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Breakdown modal state
  const [breakdownCandidate, setBreakdownCandidate] = useState<Candidate | null>(null);

  // Student specific data
  const myCandidate = candidates.find((c) => c.id === currentUserId);
  const myScore = myCandidate?.pri.score ?? 0;
  const myUnlocked = myCandidate?.pri.unlocked ?? false;
  const pointsToUnlock = Math.max(0, PRI_THRESHOLD - myScore);

  // Departments list for filter
  const departments = Array.from(
    new Set(candidates.map((c) => c.department).filter(Boolean) as string[])
  );

  // Filtered candidates
  const filteredCandidates = candidates.filter((c) => {
    if (departmentFilter !== "ALL" && c.department !== departmentFilter) return false;
    if (statusFilter === "UNLOCKED" && !c.pri.unlocked) return false;
    if (statusFilter === "LOCKED" && c.pri.unlocked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDept = (c.department || "").toLowerCase().includes(q);
      const matchSkills = (c.skills || "").toLowerCase().includes(q);
      if (!matchName && !matchDept && !matchSkills) return false;
    }
    return true;
  });

  const totalUnlocked = candidates.filter((c) => c.pri.unlocked).length;
  const avgPriScore = candidates.length
    ? Math.round(candidates.reduce((sum, c) => sum + c.pri.score, 0) / candidates.length)
    : 0;

  const handlePitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForPitch) return;

    startTransition(async () => {
      setFeedback(null);
      const combinedRole = pitchMessage.trim()
        ? `${roleDetails.trim()} · Note: ${pitchMessage.trim()}`
        : roleDetails.trim();
      const res = await pitchTopCandidate(selectedForPitch.id, combinedRole, stipend);
      if (res.ok) {
        setFeedback({
          type: "ok",
          text: `🎉 Successfully sent direct pitch offer to ${selectedForPitch.name}!`,
        });
        setSelectedForPitch(null);
        setRoleDetails("");
        setPitchMessage("");
      } else {
        setFeedback({ type: "err", text: res.error || "Failed to submit pitch." });
      }
    });
  };

  const handlePitchResponse = (pitchId: string, status: "ACCEPTED" | "REJECTED") => {
    startTransition(async () => {
      setFeedback(null);
      const res = await respondToPitch(pitchId, status);
      if (res.ok) {
        setFeedback({
          type: "ok",
          text: status === "ACCEPTED" ? "🎉 Offer accepted! The company has been notified." : "Offer declined.",
        });
      } else {
        setFeedback({ type: "err", text: res.error || "Failed to update pitch status." });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in ${
            feedback.type === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "ok" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Cohort Overview Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
            <Trophy className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Tracked</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{candidates.length} Students</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
            <Unlock className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Unlocked (≥850)</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalUnlocked} ({Math.round((totalUnlocked / Math.max(1, candidates.length)) * 100)}%)
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Avg Cohort PRI</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{avgPriScore} / 1000</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
            <Send className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Direct Pitches</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {incomingPitches.length || sentPitches.length || "Active"}
            </p>
          </div>
        </Card>
      </div>

      {/* STUDENT HERO CARD: Personal PRI Tracker & Direct Offers */}
      {isStudent && (
        <Card className="overflow-hidden border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 via-surface to-surface p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  Your Placement Readiness Status
                </span>
                {myUnlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Unlock className="size-3" /> Reverse Placement Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Lock className="size-3" /> Locked ({pointsToUnlock} pts to unlock)
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {myUnlocked
                  ? "🎉 You're in the Reverse Placement Pool!"
                  : `You're ${pointsToUnlock} points away from unlocking Reverse Placement`}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {myUnlocked
                  ? "Top industry recruiters actively scout your verified profile. When recruiters pitch roles, they bypass traditional resume screening and offer packages directly."
                  : "Raise your PRI above 850 by taking skill quizzes, requesting dual sign-off on your project code, and participating in corporate challenge sprints."}
              </p>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Current PRI: {myScore}</span>
                  <span>Threshold: 850 pts</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      myUnlocked
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-indigo-500 to-violet-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.round((myScore / 850) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Component Breakdown Summary */}
            {myCandidate && (
              <div className="rounded-2xl border border-border-muted bg-surface p-4 shadow-xs min-w-[280px]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Score Breakdown (Total: {myScore}/1000)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                    <span className="text-slate-500">Skills:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{myCandidate.pri.breakdown.skills}/300</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                    <span className="text-slate-500">Projects:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{myCandidate.pri.breakdown.projects}/250</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                    <span className="text-slate-500">Proof of Work:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{myCandidate.pri.breakdown.proofOfWork}/150</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                    <span className="text-slate-500">Dual Grading:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{myCandidate.pri.breakdown.dualGrading}/150</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                    <span className="text-slate-500">Mentorship Sessions:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{(myCandidate.pri.breakdown.mentorship ?? myCandidate.pri.breakdown.tokens ?? 0)}/100</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted">
                    <span className="text-slate-500">Challenges:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{myCandidate.pri.breakdown.challenges}/50</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student's Incoming Direct Pitches */}
          {incomingPitches.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border-muted">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                <Briefcase className="size-4 text-indigo-600" />
                <span>Direct Corporate Pitches Extended to You ({incomingPitches.length})</span>
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {incomingPitches.map((pitch) => (
                  <div
                    key={pitch.id}
                    className="rounded-xl border border-border-muted bg-surface p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {pitch.industry.companyName || pitch.industry.name}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {pitch.roleDetails || "Software Engineering Role"}
                        </h5>
                      </div>
                      <Badge tone={PITCH_STATUS_TONE[pitch.status] ?? "gray"}>
                        {pitch.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {pitch.stipend != null && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{pitch.stipend.toLocaleString("en-IN")}/month
                        </span>
                      )}
                      <span>·</span>
                      <span>Pitched on {new Date(pitch.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>

                    {pitch.status === "PITCHED" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border-muted">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handlePitchResponse(pitch.id, "ACCEPTED")}
                          className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-all cursor-pointer text-center"
                        >
                          Accept Offer
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handlePitchResponse(pitch.id, "REJECTED")}
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recruiter Navigation Tabs */}
      {isRecruiter && sentPitches.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border-muted pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("LEADERBOARD")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "LEADERBOARD"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            Candidate Radar & Leaderboard ({candidates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("MY_PITCHES")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "MY_PITCHES"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            My Sent Pitches ({sentPitches.length})
          </button>
        </div>
      )}

      {/* RECRUITER SENT PITCHES VIEW */}
      {isRecruiter && activeTab === "MY_PITCHES" ? (
        <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Pitches Sent by Your Company
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track candidate responses to your direct recruitment packages.
            </p>
          </div>

          <div className="divide-y divide-border-muted">
            {sentPitches.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {p.student.name}
                    </span>
                    {p.student.department && (
                      <span className="text-xs text-slate-400">({p.student.department})</span>
                    )}
                    <Badge tone={PITCH_STATUS_TONE[p.status] ?? "gray"}>{p.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Role: <span className="font-semibold text-slate-700 dark:text-slate-300">{p.roleDetails}</span>
                    {p.stipend && (
                      <span className="ml-2 font-semibold text-emerald-600">
                        · ₹{p.stipend.toLocaleString("en-IN")}/mo
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* MAIN LEADERBOARD SECTION */
        <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          {/* Controls Bar: Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border-muted">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Placement Readiness Index Leaderboard
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by multi-factor PRI score: skills, projects, proofs of work, dual grading, mentorship and challenges.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate or skill..."
                  className="w-full rounded-xl border border-border-muted bg-surface py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Department filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-xl border border-border-muted bg-surface px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-border-muted bg-surface px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Scores</option>
                <option value="UNLOCKED">Unlocked Only (≥850)</option>
                <option value="LOCKED">Under 850</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-muted bg-slate-50/80 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400">Rank</th>
                  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400">Candidate</th>
                  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400">Department / Batch</th>
                  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400">PRI Score</th>
                  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400">Component Breakdown</th>
                  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400">Reverse Placement</th>
                  {isRecruiter && (
                    <th className="px-4 py-3 font-semibold text-xs text-right text-slate-500 dark:text-slate-400">
                      Direct Pitch
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={isRecruiter ? 7 : 6} className="px-4 py-8 text-center text-xs text-slate-500">
                      No candidates match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c, idx) => {
                    const isMe = c.id === currentUserId;
                    const rank = idx + 1;

                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isMe
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600 font-medium"
                            : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs">
                              🥇 1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs">
                              🥈 2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 pl-1">
                              #{rank}
                            </span>
                          )}
                        </td>

                        {/* Candidate Name (FIXED: accurately identify user vs others) */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold text-sm ${
                                isMe
                                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                                  : "text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {c.name}
                            </span>
                            {isMe && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white tracking-wider">
                                YOU
                              </span>
                            )}
                          </div>
                          {c.skills && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {c.skills}
                            </p>
                          )}
                        </td>

                        {/* Department & Year */}
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {c.department || "Engineering"}
                          {c.year ? ` · Year ${c.year}` : ""}
                        </td>

                        {/* PRI Score */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setBreakdownCandidate(c)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold cursor-pointer transition-all hover:scale-105"
                            style={{
                              backgroundColor: c.pri.unlocked
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(100, 116, 139, 0.12)",
                              color: c.pri.unlocked ? "#059669" : "#64748b",
                            }}
                          >
                            <span className="text-sm">{c.pri.score}</span>
                            <span className="text-[10px] font-medium text-slate-400">/1000</span>
                            {c.pri.unlocked && <Unlock className="size-3 text-emerald-600" />}
                          </button>
                        </td>

                        {/* Breakdown quick preview */}
                        <td className="px-4 py-3 text-xs">
                          <button
                            type="button"
                            onClick={() => setBreakdownCandidate(c)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <span>Inspect radar</span>
                            <ChevronRight className="size-3" />
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {c.pri.unlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30">
                              <Unlock className="size-3" /> Unlocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <Lock className="size-3 text-slate-400" />
                              {PRI_THRESHOLD - c.pri.score} pts left
                            </span>
                          )}
                        </td>

                        {/* Recruiter Pitch Action */}
                        {isRecruiter && (
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {c.pri.unlocked ? (
                              <button
                                type="button"
                                onClick={() => setSelectedForPitch(c)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
                              >
                                <Sparkles className="size-3.5" />
                                <span>Pitch Candidate</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400" title="Candidate must reach 850 PRI to unlock reverse pitch">
                                Locked
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* INSPECT RADAR / BREAKDOWN MODAL */}
      {breakdownCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setBreakdownCandidate(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{breakdownCandidate.name}</span>
                  {breakdownCandidate.id === currentUserId && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {breakdownCandidate.department || "Engineering"} · Placement Readiness Index Analysis
                </p>
              </div>
              <button
                onClick={() => setBreakdownCandidate(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Total Score Display */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
              <div>
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Composite PRI Score</p>
                <p className="text-3xl font-black text-indigo-900 dark:text-indigo-100">
                  {breakdownCandidate.pri.score} <span className="text-sm font-normal text-slate-400">/ 1000</span>
                </p>
              </div>
              <div>
                {breakdownCandidate.pri.unlocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                    <Unlock className="size-3.5" /> Reverse Placement Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Lock className="size-3.5" /> {PRI_THRESHOLD - breakdownCandidate.pri.score} pts to unlock
                  </span>
                )}
              </div>
            </div>

            {/* 6 Dimension Radar Breakdown */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Metric Breakdown
              </p>

              <div className="space-y-2 text-xs">
                {/* 1. Skills */}
                <div className="p-2.5 rounded-xl border border-border-muted bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Technical Skills Assessment</p>
                      <p className="text-[11px] text-slate-400">Calibrated quiz testing & decay freshness</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {breakdownCandidate.pri.breakdown.skills} / 300
                  </span>
                </div>

                {/* 2. Projects */}
                <div className="p-2.5 rounded-xl border border-border-muted bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="size-4 text-violet-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Production Projects Completed</p>
                      <p className="text-[11px] text-slate-400">End-to-end repository deliverables</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {breakdownCandidate.pri.breakdown.projects} / 250
                  </span>
                </div>

                {/* 3. Proof of Work */}
                <div className="p-2.5 rounded-xl border border-border-muted bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Cryptographic Proof of Work</p>
                      <p className="text-[11px] text-slate-400">Dual-attested faculty & industry artifacts</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {breakdownCandidate.pri.breakdown.proofOfWork} / 150
                  </span>
                </div>

                {/* 4. Dual Grading */}
                <div className="p-2.5 rounded-xl border border-border-muted bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-amber-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Academic & Industry Dual Grading</p>
                      <p className="text-[11px] text-slate-400">Standardized capstone rubrics</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {breakdownCandidate.pri.breakdown.dualGrading} / 150
                  </span>
                </div>

                {/* 5. Mentorship */}
                <div className="p-2.5 rounded-xl border border-border-muted bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">1:1 Industry Mentorship & Code Clinics</p>
                      <p className="text-[11px] text-slate-400">Technical consultations & live architecture reviews</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {(breakdownCandidate.pri.breakdown.mentorship ?? breakdownCandidate.pri.breakdown.tokens ?? 0)} / 100
                  </span>
                </div>

                {/* 6. Challenges */}
                <div className="p-2.5 rounded-xl border border-border-muted bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-rose-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Industry Challenge Sprints</p>
                      <p className="text-[11px] text-slate-400">Corporate problem statements & micro-consulting</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {breakdownCandidate.pri.breakdown.challenges} / 50
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setBreakdownCandidate(null)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECRUITER PITCH MODAL */}
      {selectedForPitch && isRecruiter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedForPitch(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="size-4 text-indigo-600" />
                  <span>Pitch Candidate · {selectedForPitch.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedForPitch.department} · Verified PRI {selectedForPitch.pri.score}
                </p>
              </div>
              <button
                onClick={() => setSelectedForPitch(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handlePitchSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Role / Opportunity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  value={roleDetails}
                  onChange={(e) => setRoleDetails(e.target.value)}
                  required
                  placeholder="e.g. Associate AI Engineer (Production Systems)"
                  className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Offered Monthly Stipend (₹)
                  </label>
                  <span className="text-sm font-extrabold text-emerald-600">
                    ₹{stipend.toLocaleString("en-IN")} / month
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={120000}
                  step={5000}
                  value={stipend}
                  onChange={(e) => setStipend(Number(e.target.value))}
                  className="w-full cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹10,000</span>
                  <span>₹50,000</span>
                  <span>₹1,20,000+</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Direct Pitch Message & Next Steps
                </label>
                <textarea
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  rows={3}
                  placeholder="We reviewed your verified Proof of Work and skill assessments. We'd love to fast-track you for this role..."
                  className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setSelectedForPitch(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !roleDetails.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Sending Pitch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>Send Direct Pitch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
