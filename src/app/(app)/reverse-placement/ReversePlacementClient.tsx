"use client";

import { useState } from "react";
import { pitchTopCandidate } from "./actions";
import type { PriResult } from "@/lib/pri";

const PRI_THRESHOLD = 850;

interface Candidate {
  id: string;
  name: string;
  department: string | null;
  year: number | null;
  pri: PriResult;
}

export function ReversePlacementClient({
  candidates,
  viewerRole,
}: {
  candidates: Candidate[];
  viewerRole: "STUDENT" | "INDUSTRY" | "INSTITUTIONS" | "FACULTY";
}) {
  const isRecruiter = viewerRole === "INDUSTRY";
  const isStudent = viewerRole === "STUDENT";

  const [selected, setSelected] = useState<Candidate | null>(null);
  const [roleDetails, setRoleDetails] = useState("");
  const [stipend, setStipend] = useState(20000);
  const [pitching, setPitching] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submitPitch(candidate: Candidate) {
    setPitching(true);
    setMessage(null);
    const res = await pitchTopCandidate(candidate.id, roleDetails, stipend);
    setPitching(false);
    if (res.ok) {
      setMessage({ type: "ok", text: `Pitched ${candidate.name} successfully.` });
      setSelected(null);
      setRoleDetails("");
    } else {
      setMessage({ type: "err", text: res.error || "Pitch failed." });
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Placement Readiness Index</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              PRI is computed from skills, projects, proofs of work, dual grading, tokens and
              challenge participation.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              candidates.some((c) => c.pri.unlocked)
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {candidates.filter((c) => c.pri.unlocked).length}/{candidates.length} candidates unlocked
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Candidate</th>
                <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Department</th>
                <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">PRI Score</th>
                <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Breakdown</th>
                <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Reverse Placement</th>
                {isRecruiter && <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {isStudent ? "You" : c.name}
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                    {c.department || "—"}
                    {c.year ? ` / ${c.year}${yrSuffix(c.year)} Yr` : ""}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                        c.pri.unlocked ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {c.pri.score}
                      {c.pri.unlocked && <span title="Reverse placement unlocked">🔓</span>}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {Object.entries(c.pri.breakdown)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </td>
                  <td className="px-3 py-3">
                    {c.pri.unlocked ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        Unlocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Locked ({PRI_THRESHOLD - c.pri.score} pts left)
                      </span>
                    )}
                  </td>
                  {isRecruiter && (
                    <td className="px-3 py-3 text-right">
                      {c.pri.unlocked ? (
                        <button
                          onClick={() => setSelected(c)}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Pitch
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isStudent && (
          <p className="mt-4 rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            Unlock the Reverse Placement toggle by raising your PRI above {PRI_THRESHOLD}. Strengthen
            skills, complete projects, and earn proofs of work to boost your score.
          </p>
        )}
      </section>

      {selected && isRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reverse Pitch · {selected.name}</h3>
              <button onClick={() => setSelected(null)} className="rounded-md p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                <span className="text-lg">✕</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              PRI {selected.pri.score} — unlocked. Pitch this top candidate directly.
            </p>

            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Role / Job title</label>
            <input
              value={roleDetails}
              onChange={(e) => setRoleDetails(e.target.value)}
              placeholder="e.g. Backend Engineer (GenAI Track)"
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
            />

            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Monthly stipend: ₹{stipend.toLocaleString("en-IN")}
            </label>
            <input
              type="range"
              min={5000}
              max={100000}
              step={5000}
              value={stipend}
              onChange={(e) => setStipend(Number(e.target.value))}
              className="mt-2 w-full"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => submitPitch(selected)}
                disabled={pitching || !roleDetails.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {pitching ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Send Pitch"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function yrSuffix(y: number) {
  const m = y % 10;
  if (m === 1) return "st";
  if (m === 2) return "nd";
  if (m === 3) return "rd";
  return "th";
}
