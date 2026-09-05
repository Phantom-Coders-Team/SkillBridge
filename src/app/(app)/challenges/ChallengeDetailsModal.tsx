"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Building2,
  Calendar,
  Layers,
  Code2,
  Award,
  Users2,
  Scale,
  ExternalLink,
  CheckCircle2,
  CheckCircle,
  FlaskConical,
  Send,
  FolderKanban,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui";
import ApplyWithLabUnitModal from "./ApplyWithLabUnitModal";
import StudentApplyModal from "./StudentApplyModal";

export interface ChallengeDetailProps {
  id: string;
  title: string;
  description: string;
  challengeType: string;
  domain?: string | null;
  techStack?: string | null;
  objectives?: string | null;
  stipend?: number | null;
  status: string;
  deadline?: string | null;
  rndOnly: boolean;
  industryId: string;
  companyName: string;
  recruiterName: string;
  applicationsCount: number;
  labUnitsCount: number;
  userRole: string;
  isOwner: boolean;
  // Academician specific data
  myLabUnits?: Array<{
    id: string;
    name: string;
    status: string;
    membersCount: number;
    hasApplied: boolean;
  }>;
  availableStudents?: Array<{
    id: string;
    name: string;
    email: string;
    department?: string | null;
  }>;
  hasFacultyApplied?: boolean;
  facultyLabUnitStatus?: string | null;
  // Student specific data
  myEnrolledLabUnits?: Array<{
    id: string;
    name: string;
    facultyName: string;
  }>;
  availableFaculty?: Array<{
    id: string;
    name: string;
    department?: string | null;
    email: string;
  }>;
  hasStudentApplied?: boolean;
  studentLabUnitName?: string | null;
  studentApplicationStatus?: string | null;
  onOpenMyChallenges?: () => void;
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

export default function ChallengeDetailsModal({
  challenge,
  isOpen,
  onClose,
}: {
  challenge: ChallengeDetailProps | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !challenge) return null;

  const stackItems = challenge.techStack
    ? challenge.techStack.split(",").map((s) => s.trim())
    : [];

  const objectiveItems = challenge.objectives
    ? challenge.objectives
        .split(/\r?\n|;/)
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  const isIndustry = challenge.userRole === "INDUSTRY" || challenge.userRole === "INDUSTRIES";
  const isAcademician = challenge.userRole === "ACADEMICIAN" || challenge.userRole === "FACULTY";
  const isStudent = challenge.userRole === "STUDENT" || challenge.userRole === "STUDENTS";
  const isInstitution = challenge.userRole === "INSTITUTION" || challenge.userRole === "INSTITUTIONS" || challenge.userRole === "TPO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border-muted pb-4 mb-5">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge tone={TYPE_TONE[challenge.challengeType] ?? "gray"}>
                {challenge.challengeType.replaceAll("_", " ")}
              </Badge>
              <Badge tone={STATUS_TONE[challenge.status] ?? "gray"}>
                {challenge.status.replaceAll("_", " ")}
              </Badge>
              {challenge.rndOnly && (
                <span className="rounded-lg bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                  R&D Only — Lab Unit Required
                </span>
              )}
              {challenge.isOwner && (
                <Badge tone="purple">Your Posted Challenge</Badge>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {challenge.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Building2 className="size-3.5 text-slate-400" />
                {challenge.companyName}
              </span>
              {challenge.stipend != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{challenge.stipend.toLocaleString("en-IN")} Grant / Stipend
                </span>
              )}
              {challenge.deadline && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 text-slate-400" />
                  Due {new Date(challenge.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5">
          {/* Problem Statement */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Problem Description & Background
            </h4>
            <div className="rounded-xl border border-border-muted bg-surface-muted/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {challenge.description}
            </div>
          </div>

          {/* Objectives / Milestones */}
          {objectiveItems.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Deliverables & Milestone Goals
              </h4>
              <div className="rounded-xl border border-border-muted bg-surface p-3 space-y-2">
                {objectiveItems.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenge.domain && (
              <div className="rounded-xl border border-border-muted bg-surface p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  <Layers className="size-3.5 text-indigo-500" />
                  <span>Domain Area</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {challenge.domain}
                </span>
              </div>
            )}

            {stackItems.length > 0 && (
              <div className="rounded-xl border border-border-muted bg-surface p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  <Code2 className="size-3.5 text-indigo-500" />
                  <span>Target Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stackItems.map((tech, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Participation Stats & Lab Unit Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-muted bg-surface-muted/40 p-4">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Users2 className="size-4 text-indigo-500" />
                {challenge.applicationsCount} Application{challenge.applicationsCount !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <FlaskConical className="size-4 text-purple-500" />
                {challenge.labUnitsCount} Active Team{challenge.labUnitsCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Quick cross-link for Joint Evaluation if challenge is active */}
            {(challenge.status === "ASSIGNED" || challenge.status === "IN_PROGRESS" || challenge.status === "COMPLETED") && (
              <Link
                href="/dual-grading"
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
              >
                <Scale className="size-3.5" />
                <span>View Joint Evaluation</span>
              </Link>
            )}
          </div>

          {/* Role-Specific State Messages & Banners */}
          {isAcademician && challenge.hasFacultyApplied && (
            <div className="flex items-center justify-between rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 p-3.5 text-xs">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <CheckCircle2 className="size-4 text-purple-600" />
                <span>
                  Your lab unit has submitted a proposal for this challenge. Status:{" "}
                  <strong>{challenge.facultyLabUnitStatus || "SUBMITTED"}</strong>
                </span>
              </div>
              <Link
                href="/dual-grading"
                className="font-semibold text-purple-700 dark:text-purple-300 hover:underline"
              >
                Grade in Joint Evaluation →
              </Link>
            </div>
          )}

          {isStudent && challenge.hasStudentApplied && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 p-3.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <CheckCircle2 className="size-4 text-indigo-600" />
                <span>
                  {challenge.studentLabUnitName
                    ? `Your team "${challenge.studentLabUnitName}" is participating.`
                    : "Your application is active."}{" "}
                  Status: <strong>{challenge.studentApplicationStatus || "SUBMITTED"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/proof-of-work"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Submit Proof of Work →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Industry owner view */}
            {isIndustry && challenge.isOwner && (
              <>
                <Link
                  href="/dual-grading"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-surface-muted transition-colors"
                >
                  <Scale className="size-3.5 text-indigo-500" />
                  <span>Joint Evaluation</span>
                </Link>
                {challenge.onOpenMyChallenges && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      challenge.onOpenMyChallenges?.();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <FolderKanban className="size-3.5" />
                    <span>Manage Challenge & Review Proposals</span>
                  </button>
                )}
              </>
            )}

            {/* Academician actions */}
            {isAcademician && (
              <ApplyWithLabUnitModal
                challengeId={challenge.id}
                challengeTitle={challenge.title}
                challengeType={challenge.challengeType}
                companyName={challenge.companyName}
                stipend={challenge.stipend}
                myLabUnits={challenge.myLabUnits || []}
                availableStudents={challenge.availableStudents || []}
                hasAlreadyApplied={challenge.hasFacultyApplied}
              />
            )}

            {/* Student actions */}
            {isStudent && (
              <StudentApplyModal
                challengeId={challenge.id}
                challengeTitle={challenge.title}
                challengeType={challenge.challengeType}
                companyName={challenge.companyName}
                stipend={challenge.stipend}
                rndOnly={challenge.rndOnly}
                myEnrolledLabUnits={challenge.myEnrolledLabUnits || []}
                availableFaculty={challenge.availableFaculty || []}
                hasAlreadyApplied={challenge.hasStudentApplied}
              />
            )}

            {/* Institution actions */}
            {isInstitution && (
              <Link
                href="/partners"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <Building2 className="size-3.5" />
                <span>View Corporate Partner</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
