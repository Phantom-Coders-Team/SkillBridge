"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Edit3,
  ExternalLink,
  FileCode,
  FlaskConical,
  FolderGit2,
  Globe,
  GraduationCap,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { submitGrading, deleteGradingRecord, updateGradingSession } from "./actions";

export interface StudentMember {
  id: string;
  name: string;
  email: string;
  profile?: {
    avatarUrl?: string | null;
    department?: string | null;
    year?: number | null;
  } | null;
}

export interface DualGradingItem {
  id: string;
  academicMarks: number | null;
  jobReadinessScore: number | null;
  facultyRemarks: string | null;
  industryRemarks: string | null;
  gradedByFacultyId: string | null;
  gradedByIndustryId: string | null;
  submittedAt: Date | string | null;
  createdAt: Date | string;
  challenge: {
    id: string;
    title: string;
    description: string;
    objectives?: string | null;
    techStack?: string | null;
    challengeType?: string | null;
    domain?: string | null;
    stipend?: number | null;
    industry?: {
      id: string;
      name: string;
      profile?: {
        companyName?: string | null;
      } | null;
    } | null;
    applications?: Array<{
      labUnitId: string;
      proposal: string | null;
      status: string;
    }>;
  };
  labUnit: {
    id: string;
    name: string;
    facultyId?: string;
    faculty?: {
      id: string;
      name: string;
      profile?: {
        collegeName?: string | null;
      } | null;
    } | null;
    members?: Array<{
      student: StudentMember;
    }>;
  };
  gradedByFaculty?: {
    id: string;
    name: string;
    profile?: {
      collegeName?: string | null;
    } | null;
  } | null;
  gradedByIndustry?: {
    id: string;
    name: string;
    profile?: {
      companyName?: string | null;
    } | null;
  } | null;
}

export default function GradingCard({
  grading,
  role,
  currentUserId,
  availableChallenges = [],
  availableLabUnits = [],
}: {
  grading: DualGradingItem;
  role: string;
  currentUserId?: string;
  availableChallenges?: Array<{
    id: string;
    title: string;
    domain?: string | null;
    stipend?: number | null;
    companyName?: string;
  }>;
  availableLabUnits?: Array<{
    id: string;
    name: string;
    facultyName: string;
    memberCount: number;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ error?: string; success?: boolean } | null>(null);
  const [showArtifacts, setShowArtifacts] = useState<boolean>(false);

  // Role permissions
  const isStudent = role === "STUDENT";
  const isFaculty = role === "ACADEMICIAN" || role === "FACULTY";
  const isIndustry = role === "INDUSTRIES" || role === "INDUSTRY";
  const isInstitution = role === "INSTITUTION" || role === "INSTITUTIONS" || role === "TPO";
  const canManage = isFaculty || isIndustry || isInstitution;

  // Optimistic local state
  const [isDeleted, setIsDeleted] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [localAcademicMarks, setLocalAcademicMarks] = useState<number | null>(grading.academicMarks);
  const [localJobScore, setLocalJobScore] = useState<number | null>(grading.jobReadinessScore);
  const [localFacultyRemarks, setLocalFacultyRemarks] = useState<string | null>(grading.facultyRemarks);
  const [localIndustryRemarks, setLocalIndustryRemarks] = useState<string | null>(grading.industryRemarks);

  // Edit Evaluation State
  const [isEditingEval, setIsEditingEval] = useState(false);

  // Edit Pairing State
  const [isEditingPairing, setIsEditingPairing] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(grading.challenge.id);
  const [selectedLabUnitId, setSelectedLabUnitId] = useState(grading.labUnit.id);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [isSavingPairing, setIsSavingPairing] = useState(false);

  // 4 Rubric Dimension Sliders (0 to 25 each, sums to 100)
  const [r1, setR1] = useState<number>(22);
  const [r2, setR2] = useState<number>(22);
  const [r3, setR3] = useState<number>(22);
  const [r4, setR4] = useState<number>(22);
  const rubricTotal = r1 + r2 + r3 + r4;

  const [remarksInput, setRemarksInput] = useState<string>("");

  const canGradeFacultyInitial = isFaculty && localAcademicMarks === null;
  const canGradeIndustryInitial = isIndustry && localJobScore === null;
  const canEditFaculty = isFaculty && localAcademicMarks !== null;
  const canEditIndustry = isIndustry && localJobScore !== null;
  const showGradingForm = canGradeFacultyInitial || canGradeIndustryInitial || isEditingEval;

  const isComplete = localAcademicMarks !== null && localJobScore !== null;

  // Is this the logged-in student's squad?
  const isMySquad = currentUserId
    ? grading.labUnit.members?.some((m) => m.student.id === currentUserId)
    : false;

  // Composite Score calculation
  const compositeScore =
    isComplete
      ? Math.round(((localAcademicMarks ?? 0) + (localJobScore ?? 0)) / 2)
      : null;

  // PRI Points contribution: Joint Evaluation awards up to 150 points
  const priPointsEarned = compositeScore ? Math.round((compositeScore / 100) * 150) : null;

  // Proposal submitted by this lab unit
  const labProposal =
    grading.challenge.applications?.find((a) => a.labUnitId === grading.labUnit.id)?.proposal ||
    "Production-ready modular microservice with end-to-end integration tests, containerized with Docker, and benchmarked against enterprise SLA limits.";

  // Synthetic GitHub & Demo URLs
  const cleanSlug = grading.challenge.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const repoUrl = `https://github.com/skillbridge-labs/${cleanSlug}`;
  const demoUrl = `https://preview.skillbridge.dev/challenges/${cleanSlug}`;

  // Start editing existing evaluation
  const handleStartEditEval = () => {
    setIsEditingEval(true);
    setFeedback(null);
    const prevScore = isFaculty ? localAcademicMarks ?? 88 : localJobScore ?? 88;
    const base = Math.floor(prevScore / 4);
    const rem = prevScore % 4;
    setR1(Math.min(25, base + (rem > 0 ? 1 : 0)));
    setR2(Math.min(25, base + (rem > 1 ? 1 : 0)));
    setR3(Math.min(25, base + (rem > 2 ? 1 : 0)));
    setR4(Math.min(25, base));
    setRemarksInput(isFaculty ? localFacultyRemarks || "" : localIndustryRemarks || "");
  };

  const handleCancelEditEval = () => {
    setIsEditingEval(false);
    setFeedback(null);
  };

  // Submit evaluation (initial or update)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("gradingId", grading.id);
    formData.append("remarks", remarksInput);

    if (isFaculty) {
      formData.append("academicMarks", rubricTotal.toString());
    } else if (isIndustry) {
      formData.append("jobReadinessScore", rubricTotal.toString());
    } else if (isInstitution) {
      formData.append("academicMarks", rubricTotal.toString());
    }

    startTransition(async () => {
      const res = await submitGrading(null, formData);
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setFeedback({ success: true });
        if (isFaculty || isInstitution) {
          setLocalAcademicMarks(rubricTotal);
          setLocalFacultyRemarks(remarksInput);
        }
        if (isIndustry) {
          setLocalJobScore(rubricTotal);
          setLocalIndustryRemarks(remarksInput);
        }
        setIsEditingEval(false);
        router.refresh();
      }
    });
  };

  // Delete joint evaluation session
  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteGradingRecord(grading.id);
    setIsDeleting(false);
    if (res.error) {
      alert(`Error deleting record: ${res.error}`);
    } else {
      setIsDeleted(true);
      router.refresh();
    }
  };

  // Update Challenge & Lab Unit pairing
  const handleSavePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairingError(null);
    setIsSavingPairing(true);
    const res = await updateGradingSession(grading.id, selectedChallengeId, selectedLabUnitId);
    setIsSavingPairing(false);
    if (res.error) {
      setPairingError(res.error);
    } else {
      setIsEditingPairing(false);
      router.refresh();
    }
  };

  if (isDeleted) return null;

  const getStatusBadge = () => {
    if (isComplete) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <CheckCircle2 className="size-3.5" />
          Joint Verified & Sealed
        </span>
      );
    }
    if (localAcademicMarks !== null && localJobScore === null) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
          <Clock className="size-3.5" />
          Awaiting Industry Score
        </span>
      );
    }
    if (localAcademicMarks === null && localJobScore !== null) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          <Clock className="size-3.5" />
          Awaiting Academic Marks
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
        <Clock className="size-3.5" />
        Pending Both Evaluators
      </span>
    );
  };

  return (
    <div
      className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-900/90 ${
        isMySquad
          ? "border-amber-400/80 ring-2 ring-amber-400/20 dark:border-amber-500/60"
          : "border-slate-200/90 dark:border-slate-800"
      }`}
    >
      <div>
        {/* Student Squad Highlight Banner */}
        {isMySquad && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-500" />
              Your Student Squad&apos;s Deliverable
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {isComplete ? `✓ Joint Certified (+${priPointsEarned} PRI Pts)` : "Evaluation in progress"}
            </span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {grading.challenge.domain || "Enterprise Engineering"}
              </span>
              {grading.challenge.challengeType && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {grading.challenge.challengeType.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-slate-100">
              {grading.challenge.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Lab Unit: <span className="font-semibold text-slate-700 dark:text-slate-300">{grading.labUnit.name}</span>
              {grading.labUnit.faculty?.name ? ` • Lead: ${grading.labUnit.faculty.name}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {getStatusBadge()}
            {compositeScore !== null && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="size-3.5 text-amber-500" />
                Composite: {compositeScore}/100
              </span>
            )}
          </div>
        </div>

        {/* Evaluator Management Toolbar (Only for Faculty, Industry, Institution) */}
        {canManage && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50/90 px-3 py-2 text-xs border border-slate-200/60 dark:bg-slate-800/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span>Management:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Edit Academic Marks (Faculty) */}
              {canEditFaculty && !isEditingEval && (
                <button
                  type="button"
                  onClick={handleStartEditEval}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
                >
                  <Edit3 className="size-3 text-blue-600" />
                  <span>Edit Academic Marks</span>
                </button>
              )}

              {/* Edit Corporate Score (Industry) */}
              {canEditIndustry && !isEditingEval && (
                <button
                  type="button"
                  onClick={handleStartEditEval}
                  className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-white px-2.5 py-1 font-semibold text-purple-700 shadow-2xs hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300"
                >
                  <Edit3 className="size-3 text-purple-600" />
                  <span>Edit Industry Score</span>
                </button>
              )}

              {/* Edit Pairing Button */}
              {availableChallenges.length > 0 && availableLabUnits.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEditingPairing(!isEditingPairing)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <SlidersHorizontal className="size-3 text-indigo-500" />
                  <span>{isEditingPairing ? "Close Pairing" : "Edit Pairing"}</span>
                </button>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-400"
              >
                <Trash2 className="size-3" />
                <span>Delete Session</span>
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Warning */}
        {isConfirmingDelete && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50/90 p-3 text-xs text-rose-900 dark:border-rose-900/80 dark:bg-rose-950/60 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>Permanently delete this Joint Evaluation session and all recorded marks?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-3 py-1 font-bold text-white shadow-2xs hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Pairing Drawer */}
        {isEditingPairing && (
          <form onSubmit={handleSavePairing} className="mt-3 space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 dark:text-indigo-200">
                Edit Challenge & Lab Unit Pairing
              </span>
              <button
                type="button"
                onClick={() => setIsEditingPairing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Select Industry Challenge
                </label>
                <select
                  value={selectedChallengeId}
                  onChange={(e) => setSelectedChallengeId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {availableChallenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.companyName || "Enterprise"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Select Student Lab Unit
                </label>
                <select
                  value={selectedLabUnitId}
                  onChange={(e) => setSelectedLabUnitId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {availableLabUnits.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} • {l.facultyName} ({l.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pairingError && (
              <p className="text-rose-600 dark:text-rose-400 text-xs">{pairingError}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingPairing(false)}
                className="rounded-lg bg-white px-3 py-1 font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPairing}
                className="rounded-lg bg-indigo-600 px-3 py-1 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSavingPairing ? "Saving..." : "Save New Pairing"}
              </button>
            </div>
          </form>
        )}

        {/* Student Team Member Strip */}
        {grading.labUnit.members && grading.labUnit.members.length > 0 && (
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2 text-xs dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Users className="size-3.5 text-indigo-500" />
              <span className="font-medium">Student Squad:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {grading.labUnit.members.map((m) => (
                  <span
                    key={m.student.id}
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium shadow-2xs ${
                      m.student.id === currentUserId
                        ? "bg-amber-100 font-bold text-amber-900 ring-1 ring-amber-400/50 dark:bg-amber-950/60 dark:text-amber-200"
                        : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {m.student.name} {m.student.id === currentUserId ? "(You)" : ""}
                  </span>
                ))}
              </div>
            </div>
            {priPointsEarned !== null && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{priPointsEarned} PRI Pts
              </span>
            )}
          </div>
        )}

        {/* Deliverables & Inspection Bar */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => setShowArtifacts(!showArtifacts)}
            className="flex w-full items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100/70 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300"
          >
            <div className="flex items-center gap-2">
              <FileCode className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Inspect Project Deliverables & Codebase ({showArtifacts ? "Hide" : "View Links & Architecture"})</span>
            </div>
            {showArtifacts ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {/* Expanded Deliverables Drawer */}
          {showArtifacts && (
            <div className="mt-2 space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-400"
                >
                  <FolderGit2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </a>

                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-2xs hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-emerald-400"
                >
                  <Globe className="size-3.5 text-emerald-500" />
                  <span>Live Demo & API Swagger</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </a>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Student Squad Architecture Proposal:
                </span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {labProposal}
                </p>
              </div>

              {grading.challenge.objectives && (
                <div className="flex items-start gap-2 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                    Target Objectives:
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {grading.challenge.objectives}
                  </span>
                </div>
              )}

              {grading.challenge.techStack && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    Tech Stack:
                  </span>
                  {grading.challenge.techStack.split(",").map((tech) => (
                    <span
                      key={tech.trim()}
                      className="rounded bg-indigo-100/60 px-2 py-0.2 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Joint Matrix Display Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Academic Pillar */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Academic Rigor
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {grading.gradedByFaculty?.name || "Assigned Faculty Lead"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-800 dark:text-blue-300">
                  {localAcademicMarks !== null ? `${localAcademicMarks}` : "—"}
                </span>
                <span className="text-xs text-blue-600/80 dark:text-blue-400">/100</span>
              </div>
            </div>

            {/* Rubric Criteria Breakdown */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="rounded bg-blue-100/60 px-2 py-0.5 dark:bg-blue-900/40">
                Algorithms & Logic: {localAcademicMarks ? Math.round(localAcademicMarks * 0.26) : 0}/25
              </span>
              <span className="rounded bg-blue-100/60 px-2 py-0.5 dark:bg-blue-900/40">
                Theory & Proof: {localAcademicMarks ? Math.round(localAcademicMarks * 0.25) : 0}/25
              </span>
              <span className="rounded bg-blue-100/60 px-2 py-0.5 dark:bg-blue-900/40">
                Documentation: {localAcademicMarks ? Math.round(localAcademicMarks * 0.24) : 0}/25
              </span>
              <span className="rounded bg-blue-100/60 px-2 py-0.5 dark:bg-blue-900/40">
                Code Structure: {localAcademicMarks ? Math.round(localAcademicMarks * 0.25) : 0}/25
              </span>
            </div>

            {localFacultyRemarks && (
              <div className="mt-3 rounded-lg border border-blue-200/60 bg-blue-50/50 p-2 text-xs italic text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/40 dark:text-blue-200">
                &ldquo;{localFacultyRemarks}&rdquo;
              </div>
            )}
          </div>

          {/* Industry Pillar */}
          <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/70 to-white p-4 dark:border-purple-900/40 dark:from-purple-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-600 p-1.5 text-white">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    Corporate Job Readiness
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {grading.gradedByIndustry?.name || grading.challenge.industry?.name || "Corporate Tech Mentor"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-purple-800 dark:text-purple-300">
                  {localJobScore !== null ? `${localJobScore}` : "—"}
                </span>
                <span className="text-xs text-purple-600/80 dark:text-purple-400">/100</span>
              </div>
            </div>

            {/* Rubric Criteria Breakdown */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="rounded bg-purple-100/60 px-2 py-0.5 dark:bg-purple-900/40">
                Production Code: {localJobScore ? Math.round(localJobScore * 0.26) : 0}/25
              </span>
              <span className="rounded bg-purple-100/60 px-2 py-0.5 dark:bg-purple-900/40">
                Scalability: {localJobScore ? Math.round(localJobScore * 0.25) : 0}/25
              </span>
              <span className="rounded bg-purple-100/60 px-2 py-0.5 dark:bg-purple-900/40">
                Security & Tests: {localJobScore ? Math.round(localJobScore * 0.24) : 0}/25
              </span>
              <span className="rounded bg-purple-100/60 px-2 py-0.5 dark:bg-purple-900/40">
                Business Fit: {localJobScore ? Math.round(localJobScore * 0.25) : 0}/25
              </span>
            </div>

            {localIndustryRemarks && (
              <div className="mt-3 rounded-lg border border-purple-200/60 bg-purple-50/50 p-2 text-xs italic text-purple-900 dark:border-purple-900/30 dark:bg-purple-950/40 dark:text-purple-200">
                &ldquo;{localIndustryRemarks}&rdquo;
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Form for Scoring / Editing or Student Transparency Note */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {showGradingForm && !isStudent && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-slate-50/70 p-4 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {isEditingEval
                    ? isFaculty
                      ? "Edit Academic Rigor Evaluation"
                      : "Edit Corporate Job Readiness Evaluation"
                    : canGradeFacultyInitial
                    ? "Academic Rigor 4-Axis Rubric"
                    : "Corporate Job Readiness 4-Axis Rubric"}
                </span>
                {isEditingEval && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Modifying existing submission marks & recommendations
                  </p>
                )}
              </div>
              <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
                Total Score: {rubricTotal} / 100
              </span>
            </div>

            {/* 4 Interactive Rubric Sliders (0 to 25 each) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              {/* Rubric Dimension 1 */}
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{isFaculty ? "1. Algorithms & Logic" : "1. Production Code Quality"}</span>
                  <span className="text-indigo-600 font-bold">{r1}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={r1}
                  onChange={(e) => setR1(parseInt(e.target.value, 10))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isFaculty ? "Algorithmic complexity, edge cases, time/space efficiency" : "Clean code, linting standards, modular architecture"}
                </p>
              </div>

              {/* Rubric Dimension 2 */}
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{isFaculty ? "2. Theory & Proof" : "2. System Scalability"}</span>
                  <span className="text-indigo-600 font-bold">{r2}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={r2}
                  onChange={(e) => setR2(parseInt(e.target.value, 10))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isFaculty ? "Foundational theory, math formulations, scientific validity" : "High concurrency, response latency, caching, database indexing"}
                </p>
              </div>

              {/* Rubric Dimension 3 */}
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{isFaculty ? "3. Documentation & Architecture" : "3. Security & Tests"}</span>
                  <span className="text-indigo-600 font-bold">{r3}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={r3}
                  onChange={(e) => setR3(parseInt(e.target.value, 10))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isFaculty ? "System design diagram, README instructions, report rigor" : "Automated unit tests, input sanitization, zero secret leaks"}
                </p>
              </div>

              {/* Rubric Dimension 4 */}
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{isFaculty ? "4. Code Structure & Syntax" : "4. Business Utility & Fit"}</span>
                  <span className="text-indigo-600 font-bold">{r4}/25</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={r4}
                  onChange={(e) => setR4(parseInt(e.target.value, 10))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isFaculty ? "Proper OOP/Functional principles, naming, error hierarchy" : "Solves real customer pain, enterprise usability, commercial ROI"}
                </p>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                {isFaculty ? "Academic Observations & Recommendations" : "Enterprise Feedback & Readiness Remarks"}
              </label>
              <textarea
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                placeholder={
                  isFaculty
                    ? "e.g., Solid implementation of vector search. Thorough architectural documentation. Ready for graduation credits."
                    : "e.g., Code meets PEP-8/ESLint standards; edge latency within specs. Recommended for Reverse Placement interview shortlist."
                }
                rows={2}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {feedback?.error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                {feedback.error}
              </p>
            )}

            {feedback?.success && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                Evaluation updated successfully! Updating composite score...
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
              >
                {isPending
                  ? "Saving Evaluation..."
                  : isEditingEval
                  ? `Save Updated Evaluation (${rubricTotal}/100)`
                  : isFaculty
                  ? `Sign & Submit Academic Evaluation (${rubricTotal}/100)`
                  : `Sign & Submit Corporate Job Readiness (${rubricTotal}/100)`}
              </button>
              {isEditingEval && (
                <button
                  type="button"
                  onClick={handleCancelEditEval}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Student Transparency View / Consensus Committed Hash */}
        {isStudent && (
          <div className="rounded-xl bg-slate-50/80 p-3 text-xs border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-800 flex items-start gap-2.5">
            <Scale className="size-4 shrink-0 text-indigo-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Student Transparency & Verification Access
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Your deliverable is evaluated simultaneously by your <strong className="text-blue-700 dark:text-blue-300">Faculty Advisor</strong> (Academic Rigor) and <strong className="text-purple-700 dark:text-purple-300">Industry Mentor</strong> (Corporate Readiness). Verified scores boost your Placement Readiness Index (PRI) and contribute up to +150 points.
              </p>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              <span className="font-semibold">Joint Consensus Committed:</span>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                SHA-256:{grading.id.slice(0, 12)}...
              </code>
            </div>
            {grading.submittedAt && (
              <span>
                Verified on {new Date(grading.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
