"use client";

import { useMemo, useState } from "react";
import type { DecayStatus } from "./actions";
import { SkillDiagnosticModal } from "./SkillDiagnosticModal";

export interface SkillEntry {
  id: string;
  skillName: string;
  score: number;
  decayStatus: DecayStatus;
  verifiedAt: string | null;
}

const STATUS_META: Record<
  DecayStatus,
  { label: string; badge: string; dot: string }
> = {
  ACTIVE: { label: "Fresh", badge: "bg-green-100 text-green-800 ring-green-200 dark:bg-green-950/60 dark:text-green-300", dot: "#16a34a" },
  STALE: { label: "Decaying", badge: "bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300", dot: "#ca8a04" },
  EXPIRED: { label: "Expired", badge: "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/60 dark:text-red-300", dot: "#dc2626" },
  RECERTIFIED: { label: "Refreshed", badge: "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300", dot: "#2563eb" },
};

function hoursSince(date: string | null): number | null {
  if (!date) return null;
  return (Date.now() - new Date(date).getTime()) / 3600000;
}

export function SkillDecayEngine({ initialSkills }: { initialSkills: SkillEntry[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Real Diagnostic Modal State
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticSkills, setDiagnosticSkills] = useState<string[]>([]);

  const chartData = useMemo(() => {
    return [...skills]
      .sort((a, b) => a.skillName.localeCompare(b.skillName))
      .slice(0, 8);
  }, [skills]);

  const freshnessCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ACTIVE: 0,
      STALE: 0,
      EXPIRED: 0,
      RECERTIFIED: 0,
    };
    for (const s of skills) counts[s.decayStatus] = (counts[s.decayStatus] || 0) + 1;
    return counts;
  }, [skills]);

  const hazard = skills.filter((s) => s.decayStatus === "EXPIRED" || s.decayStatus === "STALE");

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
  }

  const activeCount = freshnessCounts.ACTIVE + freshnessCounts.RECERTIFIED;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Radar Card */}
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Skill Proficiency Radar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current verified scores based on diagnostic tests &amp; proofs
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {skills.length} skills
            </span>
          </div>

          <div className="mt-4">
            {chartData.length >= 3 ? (
              <RadarChart data={chartData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  At least 3 skills are needed to render the radar chart.
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Select skills from the questionnaire below and take the diagnostic test to benchmark them.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Badge Freshness & Re-Certification */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Badge Freshness
            </h3>
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
                    className="h-3 w-3 rounded-full"
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
          </div>

          <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Diagnostic &amp; Decay Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Earned scores degrade over 90 days if not re-evaluated
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openDiagnosticForSkills(
                    hazard.length > 0
                      ? hazard.map((h) => h.skillName)
                      : skills.map((s) => s.skillName)
                  )
                }
                disabled={skills.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                <span>🎯</span> Take Re-Certification Diagnostic
              </button>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Healthy badges</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeCount}/{skills.length}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${skills.length ? (activeCount / skills.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {hazard.length > 0 ? (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50/80 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <span>
                  ⚠️ {hazard.length} badge{hazard.length > 1 ? "s" : ""} need refreshing. Take the
                  diagnostic test to verify current proficiency.
                </span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                ✓ All verified skill badges are currently healthy and fresh.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Badges List */}
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verified Skill Badges
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click badge to diagnose on demand
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {skills.map((s) => {
              const meta = STATUS_META[s.decayStatus];
              const hrs = hoursSince(s.verifiedAt);
              const isOpen = expanded === s.id;

              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-border-muted bg-slate-50/40 transition-colors dark:bg-slate-800/20"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 font-mono text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                        {s.skillName.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {s.skillName}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {s.score}%
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {hrs === null
                          ? "unverified"
                          : hrs < 24
                          ? `${Math.round(hrs)}h ago`
                          : `${Math.round(hrs / 24)}d ago`}
                      </p>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border-muted bg-white/70 p-4 dark:bg-surface/80">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div>
                          <p>
                            Last verified:{" "}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {s.verifiedAt
                                ? new Date(s.verifiedAt).toLocaleDateString()
                                : "Awaiting diagnostic"}
                            </span>
                          </p>
                          <p className="mt-0.5">
                            Proficiency: <span className="font-semibold">{s.score}%</span> • Status:{" "}
                            <span className="font-semibold">{meta.label}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDiagnosticForSkills([s.skillName]);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform"
                        >
                          <span>🎯</span> Retake Skill Diagnostic
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {skills.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No skills on radar yet. Select skills in the questionnaire below to initiate diagnostic testing.
              </li>
            )}
          </ul>
        </div>

        {/* Freshness Legend & Rules */}
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Freshness Legend &amp; Objective Scoring
          </h3>
          <div className="mt-4 space-y-3">
            <FreshnessRow status="ACTIVE" note="Verified through diagnostic assessment or work proof." />
            <FreshnessRow status="STALE" note="Decaying or unverified self-declaration; needs diagnostic." />
            <FreshnessRow status="EXPIRED" note="Exceeded 90 days since last test — requires diagnostic renewal." />
            <FreshnessRow status="RECERTIFIED" note="Refreshed and verified through recent diagnostic test." />
          </div>

          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              How Objective Skill Diagnostic Works
            </p>
            <p className="mt-1 text-xs leading-relaxed text-indigo-800/90 dark:text-indigo-300/90">
              Unlike arbitrary self-ratings, SkillBridge uses objective domain assessments. Your score
              is calculated directly from your answers. Scoring 70%+ verifies your badge as Fresh or
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

function FreshnessRow({ status, note }: { status: DecayStatus; note: string }) {
  const meta = STATUS_META[status];
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: meta.dot }} />
      <div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{meta.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: SkillEntry[] }) {
  const size = 300;
  const center = size / 2;
  const maxRadius = 110;
  const n = data.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const r = (value / 100) * maxRadius;
    const a = angleFor(i);
    return [center + r * Math.cos(a), center + r * Math.sin(a)] as const;
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const polygonPoints = data.map((d, i) => point(i, d.score).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]">
      {/* Background Grid Circles */}
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={data.map((_, i) => point(i, 100 * lv).join(",")).join(" ")}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700/60"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {data.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700/60"
            strokeWidth={1}
          />
        );
      })}

      {/* Radar filled polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(99, 102, 241, 0.25)"
        stroke="#6366f1"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Dots */}
      {data.map((d, i) => {
        const [x, y] = point(i, d.score);
        const color = STATUS_META[d.decayStatus].dot;
        return (
          <circle
            key={d.id}
            cx={x}
            cy={y}
            r={4.5}
            fill={color}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const [x, y] = point(i, 118);
        return (
          <text
            key={d.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-600 text-[10px] font-semibold dark:fill-slate-300"
          >
            {truncate(d.skillName)}
          </text>
        );
      })}

      {/* Score Values */}
      {data.map((d, i) => {
        const [x, y] = point(i, d.score);
        return (
          <text
            key={`v-${d.id}`}
            x={x}
            y={y - 8}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill={STATUS_META[d.decayStatus].dot}
          >
            {d.score}
          </text>
        );
      })}
    </svg>
  );
}

function truncate(s: string): string {
  return s.length > 12 ? s.slice(0, 11) + "…" : s;
}
