"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Building2,
  Users2,
  Layers,
  Calendar,
  FlaskConical,
  Award,
  Scale,
  Plus,
  FolderKanban,
  CheckCircle2,
  Filter,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Badge, Card, EmptyState, type BadgeTone } from "@/components/ui";
import PostChallengeModal from "./PostChallengeModal";
import MyChallengesModal, { type SerializedChallenge } from "./MyChallengesModal";
import ChallengeDetailsModal, { type ChallengeDetailProps } from "./ChallengeDetailsModal";
import ApplyWithLabUnitModal from "./ApplyWithLabUnitModal";
import StudentApplyModal from "./StudentApplyModal";

export interface ChallengeItem {
  id: string;
  industryId: string;
  title: string;
  description: string;
  challengeType: string;
  domain: string | null;
  techStack: string | null;
  objectives: string | null;
  stipend: number | null;
  status: string;
  deadline: string | null;
  rndOnly: boolean;
  createdAt: string;
  industry: {
    name: string;
    profile: { companyName: string | null } | null;
  };
  _count: {
    applications: number;
    labUnits: number;
  };
}

export interface LabUnitBrief {
  id: string;
  name: string;
  status: string;
  membersCount: number;
  hasApplied: boolean;
  challengeId?: string | null;
}

export interface StudentBrief {
  id: string;
  name: string;
  email: string;
  department?: string | null;
}

export interface FacultyBrief {
  id: string;
  name: string;
  email: string;
  department?: string | null;
}

export interface StudentLabMembership {
  id: string;
  name: string;
  facultyName: string;
  challengeId?: string | null;
  applications: Array<{
    challengeId: string;
    status: string;
    proposal?: string | null;
  }>;
}

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  challenges: ChallengeItem[];
  myChallengesRaw?: SerializedChallenge[];
  academicianLabUnits?: LabUnitBrief[];
  availableStudents?: StudentBrief[];
  studentLabUnits?: StudentLabMembership[];
  availableFaculty?: FacultyBrief[];
  institutionStats?: {
    totalPartners: number;
    totalCollegeLabUnits: number;
    totalActiveStudents: number;
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

export default function ChallengeMarketplaceClient({
  user,
  challenges = [],
  myChallengesRaw = [],
  academicianLabUnits = [],
  availableStudents = [],
  studentLabUnits = [],
  availableFaculty = [],
  institutionStats,
}: Props) {
  const isIndustry = user.role === "INDUSTRIES" || user.role === "INDUSTRY";
  const isAcademician = user.role === "ACADEMICIAN" || user.role === "FACULTY";
  const isStudent = user.role === "STUDENT" || user.role === "STUDENTS";
  const isInstitution = user.role === "INSTITUTION" || user.role === "INSTITUTIONS" || user.role === "TPO";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [stipendOnly, setStipendOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "MY_ENGAGEMENTS">("ALL");

  // Selected challenge for details modal
  const [selectedChallengeDetail, setSelectedChallengeDetail] = useState<ChallengeDetailProps | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Extract distinct domains from challenges
  const distinctDomains = useMemo(() => {
    const domains = new Set<string>();
    challenges.forEach((c) => {
      if (c.domain) {
        c.domain.split(",").forEach((d) => domains.add(d.trim()));
      }
    });
    return Array.from(domains).slice(0, 8);
  }, [challenges]);

  // Determine user engagement per challenge
  const userEngagements = useMemo(() => {
    const set = new Set<string>();

    if (isIndustry) {
      challenges.forEach((c) => {
        if (c.industryId === user.id) set.add(c.id);
      });
    } else if (isAcademician) {
      academicianLabUnits.forEach((lu) => {
        if (lu.challengeId) set.add(lu.challengeId);
      });
      // Also add from myChallengesRaw or lab unit applications
    } else if (isStudent) {
      studentLabUnits.forEach((slu) => {
        if (slu.challengeId) set.add(slu.challengeId);
        slu.applications.forEach((app) => set.add(app.challengeId));
      });
    }

    return set;
  }, [challenges, academicianLabUnits, studentLabUnits, isIndustry, isAcademician, isStudent, user.id]);

  // Filtered challenges calculation
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Tab filter
      if (activeTab === "MY_ENGAGEMENTS" && !userEngagements.has(c.id)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = c.title.toLowerCase().includes(query);
        const descMatch = c.description.toLowerCase().includes(query);
        const domainMatch = c.domain?.toLowerCase().includes(query) ?? false;
        const stackMatch = c.techStack?.toLowerCase().includes(query) ?? false;
        const companyMatch =
          (c.industry.profile?.companyName || c.industry.name).toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !domainMatch && !stackMatch && !companyMatch) {
          return false;
        }
      }

      // Domain
      if (selectedDomain !== "ALL" && c.domain) {
        if (!c.domain.toLowerCase().includes(selectedDomain.toLowerCase())) {
          return false;
        }
      } else if (selectedDomain !== "ALL" && !c.domain) {
        return false;
      }

      // Type
      if (selectedType !== "ALL" && c.challengeType !== selectedType) {
        return false;
      }

      // Status
      if (selectedStatus !== "ALL" && c.status !== selectedStatus) {
        return false;
      }

      // Stipend
      if (stipendOnly && (!c.stipend || c.stipend <= 0)) {
        return false;
      }

      return true;
    });
  }, [
    challenges,
    activeTab,
    userEngagements,
    searchQuery,
    selectedDomain,
    selectedType,
    selectedStatus,
    stipendOnly,
  ]);

  const openChallengeDetails = (c: ChallengeItem) => {
    const isOwner = c.industryId === user.id;

    // Academician checks
    const hasFacultyApplied = academicianLabUnits.some(
      (lu) => lu.challengeId === c.id || lu.hasApplied
    );

    // Student checks
    const matchedStudentUnit = studentLabUnits.find(
      (slu) =>
        slu.challengeId === c.id ||
        slu.applications.some((app) => app.challengeId === c.id)
    );
    const matchedStudentApp = matchedStudentUnit?.applications.find(
      (app) => app.challengeId === c.id
    );

    setSelectedChallengeDetail({
      id: c.id,
      title: c.title,
      description: c.description,
      challengeType: c.challengeType,
      domain: c.domain,
      techStack: c.techStack,
      objectives: c.objectives,
      stipend: c.stipend,
      status: c.status,
      deadline: c.deadline,
      rndOnly: c.rndOnly,
      industryId: c.industryId,
      companyName: c.industry.profile?.companyName || c.industry.name,
      recruiterName: c.industry.name,
      applicationsCount: c._count.applications,
      labUnitsCount: c._count.labUnits,
      userRole: user.role,
      isOwner,
      myLabUnits: academicianLabUnits,
      availableStudents,
      hasFacultyApplied,
      facultyLabUnitStatus: hasFacultyApplied ? "SUBMITTED" : null,
      myEnrolledLabUnits: studentLabUnits.map((u) => ({
        id: u.id,
        name: u.name,
        facultyName: u.facultyName,
      })),
      availableFaculty,
      hasStudentApplied: !!matchedStudentUnit,
      studentLabUnitName: matchedStudentUnit?.name,
      studentApplicationStatus: matchedStudentApp?.status,
    });
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Role-Specific Metric Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Industry Perspective */}
        {isIndustry && (
          <>
            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  My Posted Challenges
                </span>
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {myChallengesRaw.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Active industry problem statements</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Proposals Received
                </span>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
                  <Users2 className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {myChallengesRaw.reduce((acc, c) => acc + (c.applications?.length || 0), 0)}
              </p>
              <p className="mt-1 text-xs text-slate-400">Academic & student team proposals</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Marketplace Live
                </span>
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2 text-purple-600 dark:text-purple-400">
                  <Layers className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {challenges.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Total challenges across all partners</p>
            </div>

            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Quick Actions
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage applications and score teams in Joint Evaluation.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <MyChallengesModal challenges={myChallengesRaw} />
                <PostChallengeModal />
              </div>
            </div>
          </>
        )}

        {/* Academician Perspective */}
        {isAcademician && (
          <>
            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Available Challenges
                </span>
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {challenges.filter((c) => c.status === "OPEN").length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Open for Lab Unit research proposals</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  My Lab Units
                </span>
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2 text-purple-600 dark:text-purple-400">
                  <FlaskConical className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {academicianLabUnits.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {academicianLabUnits.reduce((acc, u) => acc + u.membersCount, 0)} student researchers guided
              </p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Engaged Challenges
                </span>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {userEngagements.size}
              </p>
              <p className="mt-1 text-xs text-slate-400">Active industry collaborations</p>
            </div>

            <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Joint Evaluation
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Grade lab units jointly with industry partners.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/dual-grading"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <Scale className="size-3.5" />
                  <span>Open Joint Evaluation</span>
                </Link>
                <Link
                  href="/lab-units"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-muted bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-surface-muted transition-colors"
                >
                  <FlaskConical className="size-3.5" />
                  <span>Lab Units</span>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Student Perspective */}
        {isStudent && (
          <>
            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Industry Challenges
                </span>
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {challenges.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Live problem statements open for solutions</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  My Active Engagements
                </span>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
                  <Users2 className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {userEngagements.size}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Participating via {studentLabUnits.length} Lab Unit{studentLabUnits.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Stipends & Grants
                </span>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 p-2 text-amber-600 dark:text-amber-400">
                  <Award className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                ₹
                {challenges
                  .reduce((sum, c) => sum + (c.stipend || 0), 0)
                  .toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-400">Total grants offered across challenges</p>
            </div>

            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Showcase Your Work
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Submit proof-of-work and verify challenge milestones.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/proof-of-work"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <Award className="size-3.5" />
                  <span>Submit Proof of Work</span>
                </Link>
                <Link
                  href="/dual-grading"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-muted bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-surface-muted transition-colors"
                >
                  <Scale className="size-3.5" />
                  <span>Evaluations</span>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Institution Perspective */}
        {isInstitution && (
          <>
            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Corporate Challenges
                </span>
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {challenges.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Total problem statements across industry</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  College Lab Units
                </span>
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2 text-purple-600 dark:text-purple-400">
                  <FlaskConical className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {institutionStats?.totalCollegeLabUnits || 0}
              </p>
              <p className="mt-1 text-xs text-slate-400">Faculty-led student research units</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Students Participating
                </span>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
                  <Users2 className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {institutionStats?.totalActiveStudents || 0}
              </p>
              <p className="mt-1 text-xs text-slate-400">Enrolled in capstones & challenges</p>
            </div>

            <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Industry Partnerships
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connect with corporate recruiters and expand challenge sponsorships.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/partners"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <Building2 className="size-3.5" />
                  <span>Corporate Partners</span>
                </Link>
                <Link
                  href="/heatmap"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-muted bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-surface-muted transition-colors"
                >
                  <TrendingUp className="size-3.5" />
                  <span>Skill Heatmap</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Filter & Search Console */}
      <div className="rounded-2xl border border-border-muted bg-surface p-5 shadow-xs space-y-4">
        {/* Top bar: Tabs + Search input */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-surface text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              All Challenges ({challenges.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("MY_ENGAGEMENTS")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "MY_ENGAGEMENTS"
                  ? "bg-surface text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {isIndustry
                ? `My Postings (${userEngagements.size})`
                : isAcademician
                ? `My Lab Engagements (${userEngagements.size})`
                : isStudent
                ? `My Active Challenges (${userEngagements.size})`
                : `Active College Teams (${userEngagements.size})`}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges, tech stack, domain, company..."
              className="w-full rounded-xl border border-border-muted bg-surface pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-muted">
          {/* Challenge Type */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Type:
            </span>
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedType === "ALL"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("CAPSTONE")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedType === "CAPSTONE"
                  ? "bg-blue-600 text-white"
                  : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              Capstone
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("R_AND_D")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedType === "R_AND_D"
                  ? "bg-purple-600 text-white"
                  : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              R&D Sprint
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("MICRO_CONSULTANCY")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedType === "MICRO_CONSULTANCY"
                  ? "bg-orange-600 text-white"
                  : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              Micro-Consultancy
            </button>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-border-muted bg-surface px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Stipend toggle */}
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={stipendOnly}
              onChange={(e) => setStipendOnly(e.target.checked)}
              className="size-3.5 rounded border-border-muted text-emerald-600 focus:ring-emerald-500"
            />
            <span>Funded Grants Only</span>
          </label>
        </div>

        {/* Distinct domain quick-chips */}
        {distinctDomains.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-muted text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Domain:</span>
            <button
              type="button"
              onClick={() => setSelectedDomain("ALL")}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                selectedDomain === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              All Domains
            </button>
            {distinctDomains.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => setSelectedDomain(dom)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedDomain === dom
                    ? "bg-indigo-600 text-white"
                    : "bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No challenges found"
          description={
            activeTab === "MY_ENGAGEMENTS"
              ? "You don't have any active challenge engagements under this filter yet. Browse 'All Challenges' to explore and apply."
              : "No challenges match your selected filters. Try clearing your search or switching filter categories."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChallenges.map((c) => {
            const isOwner = c.industryId === user.id;
            const hasApplied = userEngagements.has(c.id);
            const companyName = c.industry.profile?.companyName || c.industry.name;

            return (
              <Card
                key={c.id}
                hover
                className="flex flex-col justify-between p-5 transition-all hover:border-indigo-300 dark:hover:border-indigo-800 group cursor-pointer"
                onClick={() => openChallengeDetails(c)}
              >
                <div>
                  {/* Card Header */}
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={TYPE_TONE[c.challengeType] ?? "gray"}>
                        {c.challengeType.replaceAll("_", " ")}
                      </Badge>
                      {isOwner && <Badge tone="purple">Your Post</Badge>}
                      {hasApplied && !isOwner && (
                        <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ Participating
                        </span>
                      )}
                    </div>
                    <Badge tone={STATUS_TONE[c.status] ?? "gray"}>
                      {c.status.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {c.description}
                  </p>

                  {/* Domain & Stack Meta */}
                  {(c.domain || c.techStack) && (
                    <div className="mt-3.5 space-y-1 text-xs">
                      {c.domain && (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <span className="text-[11px] font-semibold text-slate-400">Domain:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {c.domain}
                          </span>
                        </div>
                      )}
                      {c.techStack && (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <span className="text-[11px] font-semibold text-slate-400">Stack:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {c.techStack}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stipend & Deadline Meta */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {c.stipend !== null ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{c.stipend.toLocaleString("en-IN")} Grant
                      </span>
                    ) : (
                      <span className="text-slate-400">Unfunded / Mentorship</span>
                    )}
                    {c.deadline && (
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="size-3 text-slate-400" />
                        Due {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>

                  {c.rndOnly && (
                    <span className="mt-3 inline-block rounded-lg bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                      R&D Only — Lab Unit Required
                    </span>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-border-muted">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-3">
                    <span className="inline-flex items-center gap-1.5 truncate font-medium text-slate-600 dark:text-slate-400">
                      <Building2 className="size-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{companyName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0 font-medium">
                      <Users2 className="size-3.5 text-slate-400" />
                      {c._count.applications} team{c._count.applications !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openChallengeDetails(c)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="size-3" />
                    </button>

                    {/* Role fast action */}
                    {isAcademician && (
                      <ApplyWithLabUnitModal
                        challengeId={c.id}
                        challengeTitle={c.title}
                        challengeType={c.challengeType}
                        companyName={companyName}
                        stipend={c.stipend}
                        myLabUnits={academicianLabUnits}
                        availableStudents={availableStudents}
                        hasAlreadyApplied={hasApplied}
                      />
                    )}

                    {isStudent && (
                      <StudentApplyModal
                        challengeId={c.id}
                        challengeTitle={c.title}
                        challengeType={c.challengeType}
                        companyName={companyName}
                        stipend={c.stipend}
                        rndOnly={c.rndOnly}
                        myEnrolledLabUnits={studentLabUnits.map((u) => ({
                          id: u.id,
                          name: u.name,
                          facultyName: u.facultyName,
                        }))}
                        availableFaculty={availableFaculty}
                        hasAlreadyApplied={hasApplied}
                      />
                    )}

                    {isIndustry && isOwner && (
                      <button
                        type="button"
                        onClick={() => openChallengeDetails(c)}
                        className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <FolderKanban className="size-3" />
                        <span>Manage</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Interactive Detail Modal */}
      <ChallengeDetailsModal
        challenge={selectedChallengeDetail}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
