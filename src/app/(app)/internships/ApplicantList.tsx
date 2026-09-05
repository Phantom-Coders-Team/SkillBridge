"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  ChevronDown,
  ChevronUp,
  Calendar,
  Video,
  ExternalLink,
  Clock,
  CheckCircle2,
  Award,
  XCircle,
  FileText,
  Download,
  ScrollText,
  BadgeCheck,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  User,
} from "lucide-react";
import ExportButton from "./ExportButton";
import ApplicationActions from "./ApplicationActions";
import MatchBadge from "./MatchBadge";
import { parseApplicationMessage, formatInterviewDateTime } from "@/lib/interview";

export interface Applicant {
  id: string;
  status: string;
  message?: string | null;
  createdAt?: string | Date;
  student: {
    id: string;
    name: string;
    email?: string;
    profile?: {
      department?: string | null;
      rollNumber?: string | null;
      skills?: string | null;
      collegeName?: string | null;
      year?: number | null;
      phone?: string | null;
      bio?: string | null;
    } | null;
    documents?: Array<{
      id: string;
      name: string;
      type: string;
      createdAt?: Date | string;
    }>;
    assessments?: Array<{
      id: string;
      skillName: string;
      score: number;
    }>;
    portfolioItems?: Array<{
      id: string;
      title: string;
      type: string;
      verified: boolean;
    }>;
    proofsOfWork?: Array<{
      id: string;
      project?: { title: string } | null;
    }>;
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
          Click to view candidates, resumes, portfolios, and interview schedules.
        </p>
      ) : (
        <div className="space-y-3 pt-1">
          {applicants.map((app) => {
            const parsed = parseApplicationMessage(app.message);
            const interview = parsed.interview;

            // Identify student resume document
            const resumeDoc =
              app.student.documents?.find(
                (d) =>
                  d.type?.toLowerCase().includes("resume") ||
                  d.name?.toLowerCase().includes("resume") ||
                  d.type?.toLowerCase().includes("cv")
              ) || app.student.documents?.[0];

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/80"
              >
                {/* 1. Header: Full Student Name, Match Badge, Status Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/${app.student.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 transition-colors"
                    >
                      {app.student.name}
                    </Link>
                    {listingSkills && app.student.profile?.skills && (
                      <MatchBadge skills={listingSkills} mySkills={app.student.profile.skills} />
                    )}
                  </div>
                  <StatusPill status={app.status} />
                </div>

                {/* 2. Subtitle: College, Department, Year, Roll Number, Applied Date */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {app.student.profile?.collegeName && (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Building2 className="size-3 text-slate-400" />
                      {app.student.profile.collegeName}
                    </span>
                  )}
                  {app.student.profile?.department && (
                    <span>· {app.student.profile.department}</span>
                  )}
                  {app.student.profile?.year && (
                    <span>· Year {app.student.profile.year}</span>
                  )}
                  {app.student.profile?.rollNumber && (
                    <span>· Roll: {app.student.profile.rollNumber}</span>
                  )}
                  {app.createdAt && (
                    <span className="text-slate-400">
                      · Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                {/* 3. Direct Credential Access Bar (Resume + Digital Portfolio + Contact) */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {resumeDoc ? (
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={`/api/documents/${resumeDoc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-98 transition-all"
                          title="Open Resume in new tab"
                        >
                          <FileText className="size-3.5" />
                          <span>View Resume</span>
                          <ExternalLink className="size-2.5 opacity-80" />
                        </a>
                        <a
                          href={`/api/documents/${resumeDoc.id}?download=1`}
                          download
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors"
                          title="Download Resume PDF"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                        <FileText className="size-3" />
                        No resume attached
                      </span>
                    )}

                    <Link
                      href={`/portfolio/${app.student.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800/80 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition shadow-2xs"
                    >
                      <ScrollText className="size-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Digital Portfolio</span>
                      <ExternalLink className="size-2.5 opacity-70" />
                    </Link>

                    <Link
                      href={`/profile/${app.student.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 px-2 py-1 transition-colors"
                    >
                      <User className="size-3" />
                      <span>Full Profile</span>
                    </Link>
                  </div>

                  {/* Summary counts */}
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {app.student.proofsOfWork && app.student.proofsOfWork.length > 0 && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="size-3 text-emerald-600" />
                        {app.student.proofsOfWork.length} Proof{app.student.proofsOfWork.length !== 1 ? "s" : ""} of Work
                      </span>
                    )}
                    {app.student.portfolioItems && app.student.portfolioItems.length > 0 && (
                      <span className="inline-flex items-center gap-1 font-medium text-indigo-700 dark:text-indigo-300">
                        <Award className="size-3 text-indigo-600" />
                        {app.student.portfolioItems.length} Item{app.student.portfolioItems.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Verified Skill Assessment Scores (Direct eligibility proof) */}
                {app.student.assessments && app.student.assessments.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Verified Assessments:
                    </span>
                    {app.student.assessments.slice(0, 5).map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60"
                      >
                        <BadgeCheck className="size-2.5 text-emerald-600" />
                        {a.skillName} · {a.score}%
                      </span>
                    ))}
                  </div>
                )}

                {/* 5. Cover letter note (if candidate provided one) */}
                {parsed.coverLetter && (
                  <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800">
                    "{parsed.coverLetter}"
                  </p>
                )}

                {/* 6. Scheduled Interview Details Card */}
                {interview && (
                  <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs dark:border-purple-900/60 dark:bg-purple-950/40 space-y-2">
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

                    {/* Fast interviewer access bar */}
                    <div className="mt-2 pt-2 border-t border-purple-200/70 dark:border-purple-900/70 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200">
                        Candidate Credentials for Interview:
                      </span>
                      <div className="flex items-center gap-2">
                        {resumeDoc && (
                          <a
                            href={`/api/documents/${resumeDoc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                          >
                            <FileText className="size-3" />
                            <span>Resume</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                        <Link
                          href={`/portfolio/${app.student.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline"
                        >
                          <ScrollText className="size-3" />
                          <span>Digital Portfolio</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Action Buttons (Status transitions & Interview scheduler) */}
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
