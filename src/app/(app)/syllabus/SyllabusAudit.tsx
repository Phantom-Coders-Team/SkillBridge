"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/syllabusAudit";
import { applyPatchModule } from "./actions";

interface Props {
  savedSyllabusId?: string;
}

export function SyllabusAudit({ savedSyllabusId }: Props) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      setText(content);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsText(file);
  }

  async function runAudit() {
    setError("");
    setNotice("");
    setToast("");
    if (text.trim().length < 20) {
      setError("Please paste or upload at least 20 characters of syllabus content.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/syllabus/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: title || undefined, department: department || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Audit failed.");
        return;
      }
      setResult(data.result);
      setToast("Audit complete.");
    } catch {
      setError("Could not reach the audit engine.");
    } finally {
      setLoading(false);
    }
  }

  async function patch(patchNonce: number) {
    if (!result) return;
    const patchModule = result.patches[patchNonce];
    if (!patchModule) return;
    setApplying(patchModule.id);
    const resp = await applyPatchModule({
      syllabusId: savedSyllabusId,
      title: patchModule.title,
      replaces: patchModule.replaces,
      description: patchModule.description,
      courseTitle: title || undefined,
      department: department || undefined,
    });
    setNotice(resp.message);
    setApplying(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            {result?.simulated === undefined ? "Simulated engine" : result.simulated ? "Simulated engine" : "Gemini engine"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Evaluates topic relevance against current tech trends.
          </span>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Course title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Web Services"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Department (optional)</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Syllabus modules / topics
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={"Paste your syllabus modules here, one topic per line...\n\nExample:\n- SOAP and WSDL web services\n- Multi-layer perceptron and backpropagation\n- Waterfall software development model\n- Sorting algorithms, bubble sort and selection sort"}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span>📄 Upload .txt / .md</span>
                <input type="file" accept=".txt,.md,.doc,.pdf" className="hidden" onChange={handleFile} />
              </label>
              {fileName && <span className="text-xs text-gray-500 dark:text-gray-400">Loaded: {fileName}</span>}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={runAudit}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Auditing against live trends...
              </>
            ) : (
              "Run Obsolescence Audit"
            )}
          </button>
        </div>
      </div>

      {toast && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{toast}</p>
      )}

      {result && <AuditReport result={result} onApply={patch} applying={applying} notice={notice} />}
    </div>
  );
}

function AuditReport({
  result,
  onApply,
  applying,
  notice,
}: {
  result: AuditResult;
  onApply: (i: number) => Promise<void>;
  applying: string | null;
  notice: string;
}) {
  const gapColor =
    result.gapPercent < 30 ? "text-green-600" : result.gapPercent < 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Report</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {result.simulated
            ? "Results generated by the local trend-pattern engine (no external AI call)."
            : "Results generated by the Gemini engine against live industry trends."}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Syllabus Gap</p>
            <p className={`text-3xl font-bold ${gapColor}`}>{result.gapPercent}%</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">below current industry standard</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Relevance</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{result.currentScore}%</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">After Applying Patches</p>
            <p className="text-3xl font-bold text-indigo-600">{result.projectedScore}%</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">+{result.improvement}% projected</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Alignment to current trends</span>
            <span>{100 - result.gapPercent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full rounded-full ${result.gapPercent < 30 ? "bg-green-500" : result.gapPercent < 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${100 - result.gapPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-base font-semibold text-red-700">
            Outdated / Obsolete Topics ({result.outdatedTopics.length})
          </h3>
          {result.outdatedTopics.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No severely outdated topics detected.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {result.outdatedTopics.map((o, i) => (
                <li key={i} className="rounded-lg border border-red-100 bg-red-50/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{o.topic}</p>
                      <p className="mt-1 text-xs text-gray-600">{o.reason}</p>
                      {o.replacement && (
                        <p className="mt-2 text-xs">
                          <span className="font-semibold text-indigo-700">Industry replacement: </span>
                          <span className="text-gray-700">{o.replacement}</span>
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                      {Math.round(o.gap * 100)}% gap
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const idx = result.patches.findIndex(
                        (p) => p.id === (o.patchModule || "").replace(/\s+/g, "-").toLowerCase()
                      );
                      if (idx >= 0) onApply(idx);
                    }}
                    disabled={applying !== null}
                    className="mt-3 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    ⚡ Apply Industry Patch Module
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-green-700">Aligned / Fresh Topics</h3>
          <ul className="mt-4 space-y-2">
            {result.freshTopics.slice(0, 20).map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-600">✓</span> {t.topic}
              </li>
            ))}
            {result.freshTopics.length === 0 && (
              <li className="text-sm text-gray-500">No fresh topics detected.</li>
            )}
          </ul>
        </div>
      </div>

      {result.patches.length > 0 && (
        <div className="rounded-2xl border border-border-muted bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-gray-900">
            Recommended Industry Patch Modules ({result.patches.length})
          </h3>
          <ul className="mt-4 space-y-3">
            {result.patches.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                <div>
                  <p className="font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    Replaces: <span className="text-red-600">{p.replaces}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{p.description}</p>
                </div>
                <button
                  onClick={() => onApply(i)}
                  disabled={applying !== null}
                  className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {applying === p.id ? "Applying..." : "⚡ Apply"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notice && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>
      )}
    </div>
  );
}
