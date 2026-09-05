"use client";

import { useState, useMemo } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  HelpCircle,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import GradingCard, { DualGradingItem } from "./GradingCard";
import NewGradingModal from "./NewGradingModal";

interface DualGradingClientProps {
  gradings: DualGradingItem[];
  role: string;
  userId: string;
  availableChallenges: Array<{
    id: string;
    title: string;
    domain: string | null;
    stipend: number | null;
    companyName?: string;
  }>;
  availableLabUnits: Array<{
    id: string;
    name: string;
    facultyName: string;
    memberCount: number;
  }>;
}

export default function DualGradingClient({
  gradings,
  role,
  userId,
  availableChallenges,
  availableLabUnits,
}: DualGradingClientProps) {
  const isStudent = role === "STUDENT";
  const isFaculty = role === "ACADEMICIAN" || role === "FACULTY";
  const isIndustry = role === "INDUSTRIES" || role === "INDUSTRY";
  const isInstitution = role === "INSTITUTION" || role === "INSTITUTIONS" || role === "TPO";

  // Filter items needing current user's review
  const needsReviewCount = useMemo(() => {
    return gradings.filter((g) => {
      if (isFaculty) return g.academicMarks === null;
      if (isIndustry) return g.jobReadinessScore === null;
      return g.academicMarks === null || g.jobReadinessScore === null;
    }).length;
  }, [gradings, isFaculty, isIndustry]);

  const completedCount = useMemo(() => {
    return gradings.filter((g) => g.academicMarks !== null && g.jobReadinessScore !== null).length;
  }, [gradings]);

  const mySquadCount = useMemo(() => {
    return gradings.filter((g) =>
      g.labUnit.members?.some((m) => m.student.id === userId),
    ).length;
  }, [gradings, userId]);

  const mySupervisedCount = useMemo(() => {
    return gradings.filter((g) => g.labUnit.facultyId === userId || g.gradedByFacultyId === userId).length;
  }, [gradings, userId]);

  const mySponsoredCount = useMemo(() => {
    return gradings.filter((g) => g.challenge.industry?.id === userId || g.gradedByIndustryId === userId).length;
  }, [gradings, userId]);

  // Set intelligent initial tab based on role
  const initialTab = isStudent
    ? mySquadCount > 0
      ? "mySquad"
      : "all"
    : needsReviewCount > 0
    ? "needsReview"
    : "all";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Filtered gradings based on active tab and search query
  const filteredGradings = useMemo(() => {
    return gradings.filter((g) => {
      // Tab filter
      if (activeTab === "mySquad") {
        if (!g.labUnit.members?.some((m) => m.student.id === userId)) return false;
      } else if (activeTab === "mySupervised") {
        if (g.labUnit.facultyId !== userId && g.gradedByFacultyId !== userId) return false;
      } else if (activeTab === "mySponsored") {
        if (g.challenge.industry?.id !== userId && g.gradedByIndustryId !== userId) return false;
      } else if (activeTab === "needsReview") {
        if (isFaculty && g.academicMarks !== null) return false;
        if (isIndustry && g.jobReadinessScore !== null) return false;
        if (!isFaculty && !isIndustry && g.academicMarks !== null && g.jobReadinessScore !== null) return false;
      } else if (activeTab === "completed") {
        if (g.academicMarks === null || g.jobReadinessScore === null) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = g.challenge.title.toLowerCase().includes(q);
        const matchDomain = g.challenge.domain?.toLowerCase().includes(q) ?? false;
        const matchLab = g.labUnit.name.toLowerCase().includes(q);
        const matchMember = g.labUnit.members?.some((m) => m.student.name.toLowerCase().includes(q)) ?? false;
        return matchTitle || matchDomain || matchLab || matchMember;
      }

      return true;
    });
  }, [gradings, activeTab, searchQuery, isFaculty, isIndustry, userId]);

  return (
    <div className="space-y-6">
      {/* Role-Specific Banner */}
      {showGuide && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/50 to-white p-5 shadow-xs dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-sm">
                <Scale className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isStudent
                      ? "Student Squad Joint Evaluation Console"
                      : isIndustry
                      ? "Corporate Job Readiness Evaluation Console"
                      : isFaculty
                      ? "Faculty Academic Rigor Evaluation Console"
                      : "Institutional Capstone Accreditation Oversight"}
                  </h3>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    NEP 2020 Aligned
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  {isStudent ? (
                    <>
                      Your capstone deliverables are evaluated simultaneously by your
                      <strong className="text-indigo-900 dark:text-indigo-200"> Faculty Advisor</strong> (academic rigor) and your
                      <strong className="text-purple-900 dark:text-purple-200"> Corporate Sponsor</strong> (production readiness).
                      Completed joint reviews contribute up to <span className="font-semibold text-emerald-700 dark:text-emerald-400">+150 points to your PRI score</span> and seal your tamper-proof Proof of Work!
                    </>
                  ) : isIndustry ? (
                    <>
                      Evaluate working codebases, test coverage, and scalability on challenges your organization sponsored.
                      Your <strong className="text-purple-900 dark:text-purple-200">Job Readiness Score (0–100)</strong> directly qualifies top-performing squads for fast-tracked Reverse Placement job pitches!
                    </>
                  ) : isFaculty ? (
                    <>
                      Assess algorithmic correctness, theoretical grounding, and documentation quality for your student Lab Units.
                      Your <strong className="text-indigo-900 dark:text-indigo-200">Academic Marks (0–100)</strong> combined with corporate ratings mint verifiable blockchain credentials.
                    </>
                  ) : (
                    <>
                      Monitor collaborative student-industry capstone evaluations across all engineering departments.
                      Joint-evaluated projects provide 100% auditable documentation for <span className="font-semibold text-emerald-700 dark:text-emerald-400">NAAC Criteria 1 & 2</span> and NBA accreditation.
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Tabs, Search, and Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/60">
          {/* For Student: My Squad Tab */}
          {isStudent && (
            <button
              onClick={() => setActiveTab("mySquad")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "mySquad"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles className="size-3.5" />
              My Squad Deliverables
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "mySquad" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
              }`}>
                {mySquadCount}
              </span>
            </button>
          )}

          {/* For Faculty: Needs My Review */}
          {(isFaculty || isIndustry) && (
            <button
              onClick={() => setActiveTab("needsReview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "needsReview"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="size-3.5" />
              {isFaculty ? "Needs Academic Review" : "Needs Corporate Review"}
              {needsReviewCount > 0 && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "needsReview" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                }`}>
                  {needsReviewCount}
                </span>
              )}
            </button>
          )}

          {/* For Faculty: My Supervised Labs */}
          {isFaculty && (
            <button
              onClick={() => setActiveTab("mySupervised")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "mySupervised"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              My Supervised Labs
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "mySupervised" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              }`}>
                {mySupervisedCount}
              </span>
            </button>
          )}

          {/* For Industry: Sponsored by Us */}
          {isIndustry && (
            <button
              onClick={() => setActiveTab("mySponsored")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "mySponsored"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Sponsored Challenges
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "mySponsored" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              }`}>
                {mySponsoredCount}
              </span>
            </button>
          )}

          {/* All Deliverables */}
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            All Deliverables
            <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {gradings.length}
            </span>
          </button>

          {/* Completed */}
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            Joint-Certified
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "completed" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
            }`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search Input & Modal Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenge, squad, or domain..."
              className="h-9 w-48 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:w-64"
            />
          </div>

          {(isFaculty || isIndustry || isInstitution) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Plus className="size-4" />
              <span>Initiate Joint Evaluation</span>
            </button>
          )}
        </div>
      </div>

      {/* Grading Cards Grid */}
      {filteredGradings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Scale className="size-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
            No matching joint evaluation records
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery
              ? `No records found matching "${searchQuery}". Try clearing your search query.`
              : activeTab === "needsReview"
              ? "All your assigned deliverables have been evaluated. Great job!"
              : activeTab === "mySquad"
              ? "No active project deliverables found for your student squad yet."
              : "No joint evaluation sessions initiated in this category yet."}
          </p>
          {(isFaculty || isIndustry) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <Plus className="size-3.5" />
              Initiate Joint Evaluation Session
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredGradings.map((g) => (
            <GradingCard
              key={g.id}
              grading={g}
              role={role}
              currentUserId={userId}
              availableChallenges={availableChallenges}
              availableLabUnits={availableLabUnits}
            />
          ))}
        </div>
      )}

      {/* New Grading Modal */}
      <NewGradingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        challenges={availableChallenges}
        labUnits={availableLabUnits}
      />
    </div>
  );
}
