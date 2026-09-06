"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import type { DecayStatus } from "./actions";
import { simulateSkillDecayAction, syncSkillDecayStatusesAction } from "./actions";
import { SkillDiagnosticModal } from "./SkillDiagnosticModal";

export interface SkillEntry {
  id: string;
  skillName: string;
  score: number;
  decayStatus: DecayStatus;
  verifiedAt: string | null;
}

export type { DecayStatus };

export const STATUS_META: Record<
  DecayStatus,
  { label: string; badge: string; dot: string; note: string; dateRule: string }
> = {
  ACTIVE: {
    label: "Fresh",
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300",
    dot: "#10b981",
    note: "Verified through diagnostic assessment or work proof.",
    dateRule: "Tested ≤ 45 days ago • 100% proficiency retention",
  },
  STALE: {
    label: "Decaying",
    badge: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300",
    dot: "#f59e0b",
    note: "Decaying or unverified self-declaration; needs diagnostic.",
    dateRule: "Tested 46–90 days ago OR unverified self-declaration",
  },
  EXPIRED: {
    label: "Expired",
    badge: "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300",
    dot: "#ef4444",
    note: "Exceeded 90 days since last test — requires diagnostic renewal.",
    dateRule: "Exceeded 90 days (>90d) • Requires diagnostic renewal",
  },
  RECERTIFIED: {
    label: "Refreshed",
    badge: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300",
    dot: "#0284c7",
    note: "Refreshed and verified through recent diagnostic test.",
    dateRule: "Recertified via recent diagnostic assessment",
  },
};

/**
 * Computes the real-time decay status, realistic score degradation,
 * and time-to-expiry for any skill assessment.
 */
export function getComputedSkillStatus(
  declaredStatus: DecayStatus,
  verifiedAt: string | null,
  originalScore: number,
  simulatedDaysAhead: number = 0
): {
  status: DecayStatus;
  originalScore: number;
  effectiveScore: number;
  decayPercent: number;
  daysElapsed: number | null;
  daysRemaining: number | null;
  dateBadgeText: string;
  detailText: string;
  isExpired: boolean;
} {
  if (!verifiedAt) {
    // Unverified self-declaration
    const effectiveScore = Math.max(30, Math.round(originalScore * 0.85));
    const decayPercent = Math.round(((originalScore - effectiveScore) / originalScore) * 100);
    return {
      status: "STALE",
      originalScore,
      effectiveScore,
      decayPercent,
      daysElapsed: null,
      daysRemaining: null,
      dateBadgeText: "Unverified (Pending Diagnostic)",
      detailText: "Self-declared target; takes diagnostic assessment to benchmark and turn Fresh.",
      isExpired: false,
    };
  }

  const verifiedDate = new Date(verifiedAt);
  const now = new Date();
  const diffMs = now.getTime() - verifiedDate.getTime();
  const naturalDaysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const daysElapsed = naturalDaysElapsed + simulatedDaysAhead;
  const daysRemaining = Math.max(0, 90 - daysElapsed);

  // Rule 1: Exceeded 90 days (>90d) — EXPIRED
  if (daysElapsed > 90) {
    // Score degraded down towards baseline threshold
    const expiryFraction = Math.min(1, (daysElapsed - 90) / 90);
    const decayFactor = Math.max(0.4, 0.75 - 0.35 * expiryFraction);
    const effectiveScore = Math.max(25, Math.round(originalScore * decayFactor));
    const decayPercent = Math.round(((originalScore - effectiveScore) / originalScore) * 100);

    return {
      status: "EXPIRED",
      originalScore,
      effectiveScore,
      decayPercent,
      daysElapsed,
      daysRemaining: 0,
      dateBadgeText: `${daysElapsed}d ago (Expired)`,
      detailText: `Exceeded 90 days since test (${daysElapsed}d ago) — proficiency degraded by ${decayPercent}%. Requires diagnostic renewal.`,
      isExpired: true,
    };
  }

  // Rule 2: Decaying (46–90 days) or STALE declaration
  if (daysElapsed > 45 || declaredStatus === "STALE") {
    // Gradual decay of up to 25% over the 45-day stale window
    const staleFraction = Math.min(1, Math.max(0, (daysElapsed - 45) / 45));
    const decayFactor = 1.0 - 0.25 * staleFraction;
    const effectiveScore = Math.max(30, Math.round(originalScore * decayFactor));
    const decayPercent = Math.round(((originalScore - effectiveScore) / originalScore) * 100);

    return {
      status: "STALE",
      originalScore,
      effectiveScore,
      decayPercent,
      daysElapsed,
      daysRemaining,
      dateBadgeText: `${daysElapsed}d ago (Decaying)`,
      detailText: `Tested ${daysElapsed}d ago (${daysRemaining}d until expiry) — decayed by ${decayPercent}%. Take refresher diagnostic.`,
      isExpired: false,
    };
  }

  // Rule 3: Refreshed recently
  if (declaredStatus === "RECERTIFIED") {
    return {
      status: "RECERTIFIED",
      originalScore,
      effectiveScore: originalScore,
      decayPercent: 0,
      daysElapsed,
      daysRemaining,
      dateBadgeText: daysElapsed === 0 ? "Tested today (Refreshed)" : `${daysElapsed}d ago (Refreshed)`,
      detailText: `Refreshed and verified via recent diagnostic test (${daysRemaining}d until 90-day expiry). 100% retained.`,
      isExpired: false,
    };
  }

  // Rule 4: Active / Fresh (≤ 45 days)
  return {
    status: "ACTIVE",
    originalScore,
    effectiveScore: originalScore,
    decayPercent: 0,
    daysElapsed,
    daysRemaining,
    dateBadgeText: daysElapsed === 0 ? "Tested today (Fresh)" : `${daysElapsed}d ago (Fresh)`,
    detailText: `Verified through diagnostic assessment or work proof (${daysRemaining}d until 90-day expiry). 100% retained.`,
    isExpired: false,
  };
}

export function SkillDecayEngine({ initialSkills }: { initialSkills: SkillEntry[] }) {
  const router = useRouter();
  const [skills, setSkills] = useState(initialSkills);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sync state when parent server props update
  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  // Interactive Decay Horizon Simulator State (0 to 120 days)
  const [simulatedDays, setSimulatedDays] = useState<number>(0);

  // Radar View Controls
  const [radarFilter, setRadarFilter] = useState<"ALL" | "DECAYING" | "TOP">("ALL");
  const [showPeakOverlay, setShowPeakOverlay] = useState<boolean>(true);
  const [selectedRadarSkillId, setSelectedRadarSkillId] = useState<string | null>(null);

  // Diagnostic Modal State
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticSkills, setDiagnosticSkills] = useState<string[]>([]);

  // Action status toast
  const [syncPending, startSyncTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Dynamically resolve skill status and decay scores with simulation offset
  const resolvedSkills = useMemo(() => {
    return skills.map((s) => {
      const computed = getComputedSkillStatus(s.decayStatus, s.verifiedAt, s.score, simulatedDays);
      return {
        ...s,
        effectiveStatus: computed.status,
        originalScore: computed.originalScore,
        effectiveScore: computed.effectiveScore,
        decayPercent: computed.decayPercent,
        daysElapsed: computed.daysElapsed,
        daysRemaining: computed.daysRemaining,
        dateBadgeText: computed.dateBadgeText,
        detailText: computed.detailText,
        isExpired: computed.isExpired,
      };
    });
  }, [skills, simulatedDays]);

  // Radar chart items filtered & sorted
  const chartData = useMemo(() => {
    const sorted = [...resolvedSkills];
    if (radarFilter === "DECAYING") {
      sorted.sort((a, b) => {
        const order = { EXPIRED: 0, STALE: 1, ACTIVE: 2, RECERTIFIED: 3 };
        return order[a.effectiveStatus] - order[b.effectiveStatus];
      });
    } else if (radarFilter === "TOP") {
      sorted.sort((a, b) => b.effectiveScore - a.effectiveScore);
    } else {
      sorted.sort((a, b) => a.skillName.localeCompare(b.skillName));
    }
    return sorted.slice(0, 10);
  }, [resolvedSkills, radarFilter]);

  // Freshness count summaries
  const freshnessCounts = useMemo(() => {
    const counts: Record<DecayStatus, number> = {
      ACTIVE: 0,
      STALE: 0,
      EXPIRED: 0,
      RECERTIFIED: 0,
    };
    for (const s of resolvedSkills) {
      counts[s.effectiveStatus] = (counts[s.effectiveStatus] || 0) + 1;
    }
    return counts;
  }, [resolvedSkills]);

  const hazard = resolvedSkills.filter(
    (s) => s.effectiveStatus === "EXPIRED" || s.effectiveStatus === "STALE"
  );
  const expiredCount = resolvedSkills.filter((s) => s.effectiveStatus === "EXPIRED").length;
  const decayingCount = resolvedSkills.filter((s) => s.effectiveStatus === "STALE").length;
  const activeCount = freshnessCounts.ACTIVE + freshnessCounts.RECERTIFIED;

  function openDiagnosticForSkills(targetSkills: string[]) {
    if (targetSkills.length === 0) return;
    setDiagnosticSkills(targetSkills);
    setDiagnosticOpen(true);
  }

  function handleDiagnosticComplete(
    updated: { skillName: string; score: number; decayStatus: DecayStatus }[]
  ) {
    setSkills((prev) => {
      const map = new Map(updated.map((u) => [u.skillName.toLowerCase(), u]));
      const existingNames = new Set(prev.map((p) => p.skillName.toLowerCase()));

      const updatedExisting = prev.map((item) => {
        const up = map.get(item.skillName.toLowerCase());
        if (!up) return item;
        return {
          ...item,
          score: up.score,
          decayStatus: up.decayStatus,
          verifiedAt: new Date().toISOString(),
        };
      });

      const newEntries: SkillEntry[] = [];
      for (const u of updated) {
        if (!existingNames.has(u.skillName.toLowerCase())) {
          newEntries.push({
            id: `diag-${Date.now()}-${u.skillName}`,
            skillName: u.skillName,
            score: u.score,
            decayStatus: u.decayStatus,
            verifiedAt: new Date().toISOString(),
          });
        }
      }

      return [...updatedExisting, ...newEntries];
    });

    setActionMessage(`Diagnostic complete! Updated ${updated.length} skill badges.`);
    setTimeout(() => setActionMessage(null), 5000);
  }

  // Quick Action to test decay in DB
  function handleSimulateSkillDecayInDb(skillId: string, daysAgo: number) {
    startSyncTransition(async () => {
      const res = await simulateSkillDecayAction(skillId, daysAgo);
      if (res.ok) {
        setActionMessage(res.message);
        router.refresh();
      } else {
        setActionMessage(res.message || "Failed to update skill date.");
      }
      setTimeout(() => setActionMessage(null), 5000);
    });
  }

  // Sync decay from dates in DB
  function handleSyncDbDecay() {
    startSyncTransition(async () => {
      const res = await syncSkillDecayStatusesAction();
      if (res.ok) {
        setActionMessage("Skill decay statuses synchronized with live calendar dates.");
        router.refresh();
      } else {
        setActionMessage(res.message || "Failed to sync skill decay.");
      }
      setTimeout(() => setActionMessage(null), 5000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      {simulatedDays > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-700/60 dark:from-amber-950/40 dark:to-orange-950/30">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-200/70 dark:bg-amber-900">
              <Zap className="size-4 text-amber-800 dark:text-amber-300" />
            </span>
            <div>
              <p className="font-bold">
                Time-Decay Horizon Simulation Active (+{simulatedDays} days)
              </p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                Observing projected competency decay {simulatedDays} days in the future. Skills naturally degrade without regular commits or assessments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulatedDays(0)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset to Live Today</span>
          </button>
        </div>
      )}

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-medium text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
            {actionMessage}
          </span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Top Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Radar Card */}
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-muted pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Skill Proficiency Radar
                </h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {skills.length} tracked
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Visualizing peak benchmarked scores vs. current decayed proficiency
              </p>
            </div>

            {/* Radar Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  ["ALL", "All Skills"],
                  ["DECAYING", "Decaying First"],
                  ["TOP", "Top Scores"],
                ] as [typeof radarFilter, string][]
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRadarFilter(mode)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    radarFilter === mode
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Radar Chart Component */}
          <div className="mt-4">
            {chartData.length >= 3 ? (
              <div className="space-y-4">
                <RadarChart
                  data={chartData}
                  showPeakOverlay={showPeakOverlay}
                  selectedSkillId={selectedRadarSkillId}
                  onSelectSkill={(id) => {
                    setSelectedRadarSkillId(id);
                    setExpanded(id);
                  }}
                />

                {/* Radar Legend & Overlay Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-indigo-600" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Current Decayed Score
                      </span>
                    </div>
                    {showPeakOverlay && (
                      <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full border border-dashed border-indigo-400 bg-indigo-200/50" />
                        <span className="text-slate-500 dark:text-slate-400">
                          Peak Benchmarked Score
                        </span>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPeakOverlay}
                      onChange={(e) => setShowPeakOverlay(e.target.checked)}
                      className="size-3.5 rounded-sm accent-indigo-600"
                    />
                    <span>Show Peak Overlay</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  At least 3 skills are required to render the radar polygon.
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  You currently have {skills.length} skill{skills.length === 1 ? "" : "s"}. Select skills from the questionnaire below to initiate benchmark tests.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Time Horizon Simulator & Freshness Badges */}
        <div className="space-y-6">
          {/* Interactive Decay Horizon Simulator Card */}
          <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <Sliders className="size-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Skill Decay Horizon Simulator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Slide time forward to simulate competency decay
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-indigo-100/80 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                +{simulatedDays} Days
              </span>
            </div>

            {/* Slider */}
            <div className="mt-5 space-y-2">
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={simulatedDays}
                onChange={(e) => setSimulatedDays(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Today (0d)</span>
                <span>+45d (Decay Zone)</span>
                <span>+90d (Expiry Threshold)</span>
                <span>+120d</span>
              </div>
            </div>

            {/* Fast Presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSimulatedDays(0)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  simulatedDays === 0
                    ? "bg-indigo-600 text-white"
                    : "border border-border-muted bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Today (Live)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDays(30)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  simulatedDays === 30
                    ? "bg-indigo-600 text-white"
                    : "border border-border-muted bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDays(60)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  simulatedDays === 60
                    ? "bg-amber-600 text-white"
                    : "border border-border-muted bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                +60 Days (Decaying)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDays(95)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  simulatedDays === 95
                    ? "bg-rose-600 text-white"
                    : "border border-border-muted bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                +95 Days (Expired)
              </button>
            </div>
          </div>

          {/* Freshness Counts */}
          <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Badge Freshness Breakdown
              </h3>
              <button
                type="button"
                onClick={handleSyncDbDecay}
                disabled={syncPending}
                className="inline-flex items-center gap-1 rounded-lg border border-border-muted bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                title="Synchronize database decay statuses with system clock"
              >
                <RefreshCw className={`size-3 ${syncPending ? "animate-spin" : ""}`} />
                <span>Sync DB</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  ["ACTIVE", "Fresh"],
                  ["STALE", "Decaying"],
                  ["EXPIRED", "Expired"],
                  ["RECERTIFIED", "Refreshed"],
                ] as [DecayStatus, string][]
              ).map(([key]) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 rounded-xl border border-border-muted bg-slate-50/50 p-3 dark:bg-slate-800/30"
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_META[key].dot }}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {freshnessCounts[key]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {STATUS_META[key].label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Health Bar */}
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Healthy badges (Fresh + Refreshed)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeCount}/{skills.length}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${skills.length ? (activeCount / skills.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Hazard Alert */}
            {hazard.length > 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                    <span>{hazard.length} badge{hazard.length > 1 ? "s" : ""} require{hazard.length === 1 ? "s" : ""} attention</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      openDiagnosticForSkills(hazard.map((h) => h.skillName))
                    }
                    className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-amber-700 cursor-pointer"
                  >
                    Diagnose All
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-amber-800 dark:text-amber-300">
                  {expiredCount > 0 && `${expiredCount} expired badge(s) require renewal. `}
                  {decayingCount > 0 && `${decayingCount} badge(s) have decaying proficiency.`}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                ✓ All tracked skill badges are healthy and maintain 100% proficiency.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Verified Badges List & Legend */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Badges List */}
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between border-b border-border-muted pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Verified Skill Competencies &amp; Decay Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any badge to inspect decay history or launch diagnostic tests
              </p>
            </div>
            <button
              type="button"
              onClick={() => openDiagnosticForSkills(skills.map((s) => s.skillName))}
              disabled={skills.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              <span>Full Diagnostic</span>
            </button>
          </div>

          <ul className="mt-4 space-y-3">
            {resolvedSkills.map((s) => {
              const meta = STATUS_META[s.effectiveStatus] || STATUS_META.ACTIVE;
              const isOpen = expanded === s.id;

              return (
                <li
                  key={s.id}
                  className={`rounded-xl border transition-all ${
                    selectedRadarSkillId === s.id
                      ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 dark:bg-indigo-950/20"
                      : "border-border-muted bg-slate-50/40 dark:bg-slate-800/20"
                  }`}
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => {
                      setExpanded(isOpen ? null : s.id);
                      setSelectedRadarSkillId(s.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 font-mono text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                        {s.skillName.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {s.skillName}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.detailText}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {s.effectiveScore}%
                        </p>
                        {s.decayPercent > 0 && (
                          <span className="text-xs font-semibold text-rose-500 line-through">
                            {s.originalScore}%
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          s.effectiveStatus === "EXPIRED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : s.effectiveStatus === "STALE"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : s.effectiveStatus === "RECERTIFIED"
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {s.dateBadgeText}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border-muted bg-white/70 p-4 dark:bg-surface/80">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="space-y-1">
                          <p>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {s.verifiedAt
                                ? `Tested on ${new Date(s.verifiedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}`
                                : "Self-Declared (Unverified)"}
                            </span>
                            {s.daysElapsed !== null && (
                              <span className="ml-1 text-slate-500">
                                ({s.daysElapsed} days elapsed)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {meta.note}
                          </p>
                          <p className="mt-0.5">
                            Peak Benchmark: <span className="font-semibold">{s.originalScore}%</span> • Effective:{" "}
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {s.effectiveScore}%
                            </span>
                            {s.decayPercent > 0 && (
                              <span className="ml-1 text-rose-600">
                                (-{s.decayPercent}% decay)
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDiagnosticForSkills([s.skillName]);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform shadow-xs cursor-pointer"
                          >
                            <span>🎯</span> Retake Skill Diagnostic
                          </button>

                          {/* Quick Demo Decay Simulation Actions */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateSkillDecayInDb(s.id, 60);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 cursor-pointer"
                            title="Set verified date to 60 days ago to test Decaying status"
                          >
                            <Clock className="size-3 text-amber-600" />
                            <span>Simulate 60d Stale</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateSkillDecayInDb(s.id, 100);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200 cursor-pointer"
                            title="Set verified date to 100 days ago to test Expired status"
                          >
                            <AlertTriangle className="size-3 text-rose-600" />
                            <span>Simulate 100d Expire</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateSkillDecayInDb(s.id, 0);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 cursor-pointer"
                            title="Reset verification date to today"
                          >
                            <RotateCcw className="size-3 text-emerald-600" />
                            <span>Reset Today</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {resolvedSkills.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No skills on radar yet. Select skills in the questionnaire below to initiate diagnostic testing.
              </li>
            )}
          </ul>
        </div>

        {/* Freshness Legend & Rules */}
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Freshness Legend &amp; Objective Scoring Rules
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Competency badges decay with time to reflect market relevance and eliminate stale claims.
          </p>

          <div className="mt-4 space-y-3">
            <FreshnessRow status="ACTIVE" />
            <FreshnessRow status="STALE" />
            <FreshnessRow status="EXPIRED" />
            <FreshnessRow status="RECERTIFIED" />
          </div>

          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              How Objective Skill Diagnostic Works
            </p>
            <p className="mt-1 text-xs leading-relaxed text-indigo-800/90 dark:text-indigo-300/90">
              Unlike arbitrary self-ratings, SkillBridge uses objective domain assessments. Your score
              is calculated directly from your answers. Scoring 60%+ verifies your badge as Fresh or
              Refreshed and boosts your Placement Readiness Index (PRI).
            </p>
          </div>
        </div>
      </div>

      {/* Real Interactive Diagnostic Modal */}
      <SkillDiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        skillsToTest={diagnosticSkills}
        onComplete={handleDiagnosticComplete}
      />
    </div>
  );
}

function FreshnessRow({ status }: { status: DecayStatus }) {
  const meta = STATUS_META[status] || STATUS_META.ACTIVE;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-muted bg-slate-50/50 p-3 transition-colors dark:bg-slate-800/30">
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: meta.dot }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {meta.label}
          </p>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {meta.dateRule}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          {meta.note}
        </p>
      </div>
    </div>
  );
}

interface RadarChartItem {
  id: string;
  skillName: string;
  score: number;
  originalScore: number;
  effectiveScore: number;
  decayPercent: number;
  effectiveStatus: DecayStatus;
}

function RadarChart({
  data,
  showPeakOverlay,
  selectedSkillId,
  onSelectSkill,
}: {
  data: RadarChartItem[];
  showPeakOverlay: boolean;
  selectedSkillId: string | null;
  onSelectSkill?: (id: string) => void;
}) {
  const width = 380;
  const height = 340;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 105;
  const n = data.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointForScore = (i: number, score: number) => {
    const r = (Math.max(10, Math.min(100, score)) / 100) * maxRadius;
    const a = angleFor(i);
    return [centerX + r * Math.cos(a), centerY + r * Math.sin(a)] as const;
  };

  const pointForRadius = (i: number, r: number) => {
    const a = angleFor(i);
    return [centerX + r * Math.cos(a), centerY + r * Math.sin(a)] as const;
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points
  const decayedPolygonPoints = data
    .map((d, i) => pointForScore(i, d.effectiveScore).join(","))
    .join(" ");

  const peakPolygonPoints = data
    .map((d, i) => pointForScore(i, d.originalScore).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto w-full max-w-[400px] select-none"
    >
      <defs>
        <radialGradient id="radarDecayGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* Background Web Rings */}
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={data.map((_, i) => pointForRadius(i, maxRadius * lv).join(",")).join(" ")}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700/60"
          strokeWidth={lv === 1.0 ? 1.5 : 1}
          strokeDasharray={lv === 1.0 ? undefined : "3 3"}
        />
      ))}

      {/* Grid Percentage Labels */}
      {gridLevels.map((lv) => (
        <text
          key={`grid-lbl-${lv}`}
          x={centerX + 4}
          y={centerY - maxRadius * lv + 10}
          fontSize={8}
          className="fill-slate-400 font-mono"
        >
          {Math.round(lv * 100)}%
        </text>
      ))}

      {/* Radial Axis lines */}
      {data.map((_, i) => {
        const [x, y] = pointForRadius(i, maxRadius);
        return (
          <line
            key={`axis-${i}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700/60"
            strokeWidth={1}
          />
        );
      })}

      {/* Peak Benchmark Polygon Overlay (Dashed / Reference) */}
      {showPeakOverlay && (
        <polygon
          points={peakPolygonPoints}
          fill="none"
          stroke="#a5b4fc"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinejoin="round"
        />
      )}

      {/* Current Decayed Score Polygon (Filled) */}
      <polygon
        points={decayedPolygonPoints}
        fill="url(#radarDecayGradient)"
        stroke="#4f46e5"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* Vertices & Markers */}
      {data.map((d, i) => {
        const [x, y] = pointForScore(i, d.effectiveScore);
        const statusMeta = STATUS_META[d.effectiveStatus] || STATUS_META.ACTIVE;
        const isSelected = selectedSkillId === d.id;

        return (
          <g
            key={`dot-${d.id}`}
            className="cursor-pointer transition-transform hover:scale-125"
            onClick={() => onSelectSkill?.(d.id)}
          >
            {isSelected && (
              <circle
                cx={x}
                cy={y}
                r={8}
                fill="none"
                stroke="#6366f1"
                strokeWidth={2}
                className="animate-pulse"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 5 : 4}
              fill={statusMeta.dot}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Perimeter Labels with Smart Edge Alignment (Never Clipped) */}
      {data.map((d, i) => {
        const a = angleFor(i);
        const labelDist = maxRadius + 18;
        const xRaw = centerX + labelDist * Math.cos(a);
        const yRaw = centerY + labelDist * Math.sin(a);

        const cosVal = Math.cos(a);
        let anchor: "middle" | "start" | "end" = "middle";
        let xOffset = 0;

        if (cosVal > 0.25) {
          anchor = "start";
          xOffset = 4;
        } else if (cosVal < -0.25) {
          anchor = "end";
          xOffset = -4;
        }

        const isSelected = selectedSkillId === d.id;

        return (
          <g
            key={`lbl-${d.id}`}
            className="cursor-pointer"
            onClick={() => onSelectSkill?.(d.id)}
          >
            <text
              x={xRaw + xOffset}
              y={yRaw}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={`text-[10px] font-semibold transition-colors ${
                isSelected
                  ? "fill-indigo-600 font-bold"
                  : "fill-slate-700 dark:fill-slate-200 hover:fill-indigo-500"
              }`}
            >
              {truncate(d.skillName)}
            </text>
            <text
              x={xRaw + xOffset}
              y={yRaw + 10}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={8.5}
              fontWeight={700}
              fill={(STATUS_META[d.effectiveStatus] || STATUS_META.ACTIVE).dot}
            >
              {d.effectiveScore}%
              {d.decayPercent > 0 && ` (-${d.decayPercent}%)`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function truncate(s: string): string {
  return s.length > 13 ? s.slice(0, 12) + "…" : s;
}
