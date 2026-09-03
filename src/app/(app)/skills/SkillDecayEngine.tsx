"use client";

import { useMemo, useState } from "react";
import { runReCertificationDiagnostic } from "./actions";
import type { DecayStatus } from "./actions";

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
  ACTIVE: { label: "Fresh", badge: "bg-green-100 text-green-800 ring-green-200", dot: "#16a34a" },
  STALE: { label: "Decaying", badge: "bg-yellow-100 text-yellow-800 ring-yellow-200", dot: "#ca8a04" },
  EXPIRED: { label: "Expired", badge: "bg-red-100 text-red-800 ring-red-200", dot: "#dc2626" },
  RECERTIFIED: { label: "Refreshed", badge: "bg-blue-100 text-blue-800 ring-blue-200", dot: "#2563eb" },
};

function hoursSince(date: string | null): number | null {
  if (!date) return null;
  return (Date.now() - new Date(date).getTime()) / 3600000;
}

export function SkillDecayEngine({ initialSkills }: { initialSkills: SkillEntry[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [modalOpen, setModalOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ message: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  async function startDiagnostic() {
    setRunning(true);
    setResult(null);
    const res = await runReCertificationDiagnostic();
    setRunning(false);
    setSkillData(res.skills.map((r) => ({
      ...r,
      verifiedAt: new Date().toISOString(),
    })));
    setResult({ message: res.message });
  }

  function setSkillData(next: SkillEntry[]) {
    setSkills((prev) => {
      const map = new Map(next.map((n) => [n.id, n]));
      return prev.map((p) => map.get(p.id) || p);
    });
  }

  const activeCount = freshnessCounts.ACTIVE + freshnessCounts.RECERTIFIED;

  return (
    <div className="space-y-6">
      {result && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{result.message}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Skill Proficiency Radar</h2>
              <p className="text-xs text-gray-400">Current verified scores (0–100)</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {skills.length} skills
            </span>
          </div>
          {chartData.length >= 3 ? (
            <RadarChart data={chartData} />
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">
              At least 3 skills are needed to render the radar chart.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
            <h3 className="text-base font-semibold text-gray-900">Badge Freshness</h3>
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
                  className="flex items-center gap-2 rounded-lg border p-3"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: STATUS_META[key].dot }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{freshnessCounts[key]}</p>
                    <p className="text-xs text-gray-500">{STATUS_META[key].label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Decay Status</h3>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <span className="text-sm">🗝️</span> Take Re-Certification Diagnostic
              </button>
            </div>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Healthy badges</span>
                <span>{activeCount}/{skills.length}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${skills.length ? (activeCount / skills.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            {hazard.length > 0 && (
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠️ {hazard.length} badge{hazard.length > 1 ? "s" : ""} are decaying or expired. Take
                the diagnostic to refresh them.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-gray-900">Skill Badges</h3>
          <ul className="mt-4 space-y-3">
            {skills.map((s) => {
              const meta = STATUS_META[s.decayStatus];
              const hrs = hoursSince(s.verifiedAt);
              const isOpen = expanded === s.id;
              return (
                <li key={s.id} className="rounded-lg border p-4">
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
                        {s.skillName.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{s.skillName}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">{s.score}%</p>
                      <p className="text-xs text-gray-400">
                        {hrs === null ? "no record" : hrs < 24 ? `${Math.round(hrs)}h ago` : `${Math.round(hrs / 24)}d ago`}
                      </p>
                    </div>
                  </div>
                  {isOpen && (
                    <p className="mt-3 border-t pt-2 text-xs text-gray-600">
                      Last verified{" "}
                      {s.verifiedAt
                        ? new Date(s.verifiedAt).toLocaleDateString()
                        : "not recorded"}
                      . Score {s.score}%. Status: <span className="font-medium">{meta.label}</span>.
                    </p>
                  )}
                </li>
              );
            })}
            {skills.length === 0 && (
              <li className="py-6 text-center text-sm text-gray-500">
                No verified skills yet.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-gray-900">Freshness Legend</h3>
          <div className="mt-4 space-y-3">
            <FreshnessRow status="ACTIVE" note="Verified recently, fully current." />
            <FreshnessRow status="STALE" note="Getting old, refresh recommended soon." />
            <FreshnessRow status="EXPIRED" note="Outdated — take the diagnostic to renew." />
            <FreshnessRow status="RECERTIFIED" note="Refreshed via re-certification diagnostic." />
          </div>

          <div className="mt-6 rounded-lg bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-800">How the decay engine works</p>
            <p className="mt-1 text-xs text-indigo-700">
              Each verified skill badge carries a freshness state. As time passes, ACTIVE badges
              decay into STALE and eventually EXPIRED. The re-certification diagnostic re-verifies
              your proficiency and refreshes the badge to RECERTIFIED.
            </p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Re-Certification Diagnostic</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              This diagnostic re-verifies your proficiency across {skills.length} skill badge
              {skills.length === 1 ? "" : "s"}. Passing the diagnostic refreshes{" "}
              {hazard.length} decaying/expired badge{hazard.length === 1 ? "" : "s"} to{" "}
              <span className="font-medium text-blue-700">Refreshed</span> and renews their freshness
              timestamp.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {hazard.length > 0 ? (
                hazard.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_META[s.decayStatus].dot }} />
                      {s.skillName}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">
                      {s.score}% → ~{Math.min(95, s.score + 7)}%
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No badges need refreshing right now.</li>
              )}
            </ul>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={startDiagnostic}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {running ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Running diagnostic...
                  </>
                ) : (
                  "Start Diagnostic"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FreshnessRow({ status, note }: { status: DecayStatus; note: string }) {
  const meta = STATUS_META[status];
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: meta.dot }} />
      <div>
        <p className="text-sm font-medium text-gray-800">{meta.label}</p>
        <p className="text-xs text-gray-500">{note}</p>
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: SkillEntry[] }) {
  const size = 280;
  const center = size / 2;
  const maxRadius = 110;
  const n = data.length;

  const angleFor = (i: number) => ((Math.PI * 2 * i) / n - Math.PI / 2);
  const point = (i: number, value: number) => {
    const r = (value / 100) * maxRadius;
    const a = angleFor(i);
    return [center + r * Math.cos(a), center + r * Math.sin(a)] as const;
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const polygonPoints = data
    .map((d, i) => point(i, d.score).join(","))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-sm">
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={data.map((_, i) => point(i, 100 * lv).join(",")).join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
      })}

      <polygon points={polygonPoints} fill="rgba(79,70,229,0.25)" stroke="#4f46e5" strokeWidth={2} strokeLinejoin="round" />

      {data.map((d, i) => {
        const [x, y] = point(i, d.score);
        const color = STATUS_META[d.decayStatus].dot;
        return <circle key={d.id} cx={x} cy={y} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />;
      })}

      {data.map((d, i) => {
        const [x, y] = point(i, 118);
        return (
          <text
            key={d.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-600"
            fontSize={8.5}
          >
            {truncate(d.skillName)}
          </text>
        );
      })}

      {data.map((d, i) => {
        const [x, y] = point(i, d.score);
        return (
          <text
            key={`v-${d.id}`}
            x={x}
            y={y - 8}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
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
