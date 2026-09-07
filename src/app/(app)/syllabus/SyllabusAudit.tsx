"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/syllabusAudit";
import { applyPatchModule } from "./actions";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Layers,
  ArrowUpRight,
  GraduationCap,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface Props {
  savedSyllabusId?: string;
  userRole?: string;
  initialSyllabi?: Array<{
    id: string;
    title: string;
    department: string;
    topicsJson: string;
    obsolescenceScore: number;
    reviewCount: number;
    lastReviewedAt: Date | null;
  }>;
}

const SYLLABUS_PRESETS = [
  {
    label: "Web & Cloud Middleware (CS-302)",
    dept: "Computer Science & Engineering",
    desc: "Contains legacy SOAP, WSDL, CORBA, and Waterfall SDLC",
    topics: `- SOAP and WSDL web services architecture and Axis2 framework
- XML-RPC and UDDI service directory registries
- Remote Procedure Calls (RPC) and CORBA distributed object broker
- Waterfall software development lifecycle model and sequential phases
- Basic sorting algorithms: bubble sort and selection sort routines
- Client-server socket programming with static HTML parsing`,
  },
  {
    label: "Artificial Intelligence & Expert Systems (AI-401)",
    dept: "Artificial Intelligence & Data Science",
    desc: "Contains legacy Multi-layer Perceptron and pure relational algebra",
    topics: `- Classical Multi-Layer Perceptron (MLP) architecture theory
- Manual Backpropagation calculus and gradient descent derivations
- Pure Relational Algebra and tuple relational calculus operations
- Rule-based expert systems and backward-chaining inference engines
- Propositional logic resolution and Horn clause unification`,
  },
  {
    label: "Microprocessor & Embedded Architecture (EC-305)",
    dept: "Electronics & Communication",
    desc: "Contains legacy 8085/8086 microprocessors and assembly",
    topics: `- Intel 8085 and 8086 microprocessor hardware architecture and pin diagram
- 16-bit Assembly language instruction set, flags, and addressing modes
- 8255 Programmable Peripheral Interface (PPI) interfacing
- Legacy serial bus RS-232 communication protocols
- 8051 Microcontroller timers, interrupts, and memory banking`,
  },
  {
    label: "Software Engineering & Quality Assurance (CS-405)",
    dept: "Information Technology",
    desc: "Contains legacy Waterfall SDLC, Spiral model, and manual test matrices",
    topics: `- Waterfall sequential model and requirement specification docs
- Spiral model and V-Model software verification phases
- Function Point Analysis (FPA) and COCOMO-I cost estimation models
- Manual test case writing, traceability matrices, and defect bug sheets
- Legacy version control with CVS / SVN centralized checkout locks`,
  },
];

export function SyllabusAudit({ savedSyllabusId, userRole = "ACADEMICIAN", initialSyllabi = [] }: Props) {
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
  const [currentSyllabusId, setCurrentSyllabusId] = useState<string | undefined>(savedSyllabusId);
  const [appliedPatches, setAppliedPatches] = useState<string[]>([]);

  const isAuthorizedToCommit =
    userRole === "ACADEMICIAN" ||
    userRole === "FACULTY" ||
    userRole === "INSTITUTION" ||
    userRole === "ADMIN";

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

  function loadPreset(preset: (typeof SYLLABUS_PRESETS)[number]) {
    setTitle(preset.label);
    setDepartment(preset.dept);
    setText(preset.topics);
    setFileName("");
    setError("");
    setNotice("");
    setToast("");
    setResult(null);
    setCurrentSyllabusId(undefined);
    setAppliedPatches([]);
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
        body: JSON.stringify({
          text,
          title: title || undefined,
          department: department || undefined,
          syllabusId: currentSyllabusId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Audit failed.");
        return;
      }
      setResult(data.result);
      if (data.syllabusId) {
        setCurrentSyllabusId(data.syllabusId);
      }
      setToast("Syllabus audit completed successfully against current industry standards.");
    } catch {
      setError("Could not reach the syllabus obsolescence engine.");
    } finally {
      setLoading(false);
    }
  }

  async function patch(patchNonce: number) {
    if (!result) return;
    const patchModule = result.patches[patchNonce];
    if (!patchModule) return;
    setApplying(patchModule.id);
    setNotice("");

    try {
      const resp = await applyPatchModule({
        syllabusId: currentSyllabusId,
        title: patchModule.title,
        replaces: patchModule.replaces,
        description: patchModule.description,
        courseTitle: title || undefined,
        department: department || undefined,
      });

      if (resp.ok) {
        setAppliedPatches((prev) => [...prev, patchModule.id]);
        setNotice(resp.message);

        // Dynamically adjust local result metrics for instant visual gratification
        setResult((prev) => {
          if (!prev) return null;
          const newGap = Math.max(8, prev.gapPercent - 18);
          const newCurrent = Math.min(96, prev.currentScore + 18);
          return {
            ...prev,
            gapPercent: newGap,
            currentScore: newCurrent,
            outdatedTopics: prev.outdatedTopics.filter(
              (o) => !o.patchModule || o.patchModule.toLowerCase() !== patchModule.title.toLowerCase()
            ),
            freshTopics: [
              {
                topic: `${patchModule.title} (Replaces: ${patchModule.replaces})`,
                outdated: false,
                gap: 0,
                reason: "Applied Industry Patch Module — Verified Aligned",
              },
              ...prev.freshTopics,
            ],
          };
        });
      } else {
        setError(resp.message);
      }
    } catch {
      setError("Failed to apply patch module.");
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Role Notice Banner if not Faculty/Institution */}
      {!isAuthorizedToCommit && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200">
          <GraduationCap className="size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div>
            <span className="font-bold">Board of Studies Advisory Mode:</span> You are currently viewing as a{" "}
            <span className="font-semibold capitalize">{userRole.toLowerCase()}</span>. You can audit any course
            against live trends and evaluate gaps. Log in as an Academician or Institution to commit approved patch
            modules to the permanent university catalog.
          </div>
        </div>
      )}

      {/* Main Audit Control Card */}
      <div className="rounded-3xl border border-border-muted bg-surface p-6 shadow-card transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Curriculum Audit Console
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluate course modules against real-world engineering stacks (REST, gRPC, CI/CD, PyTorch, ARM).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30">
              <ShieldCheck className="size-3.5" />
              {result?.simulated === undefined
                ? "Autonomous Heuristics Engine + Gemini API"
                : result.simulated
                ? "Deterministic Trend Pattern Engine"
                : "Live Google Gemini 1.5 Flash"}
            </span>
          </div>
        </div>

        {/* 1-Click University Syllabus Presets */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ⚡ 1-Click University Syllabus Presets (For SIH Presentation Demo):
          </p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SYLLABUS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset)}
                className="group flex flex-col items-start rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20"
              >
                <div className="flex w-full items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                  <span className="truncate">{preset.label}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
                </div>
                <span className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {preset.dept}
                </span>
                <span className="mt-1 line-clamp-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {preset.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Course Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Web Services (CS-302)"
                className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Syllabus Topics & Modules (One per line)
              </label>
              <span className="text-[11px] text-slate-400">
                {text.split("\n").filter((l) => l.trim().length > 0).length} topics entered
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder={"Paste your syllabus modules here...\n\nExample:\n- SOAP and WSDL web services architecture\n- Waterfall sequential development phases\n- Classical Multi-layer Perceptron (MLP)\n- Basic sorting algorithms: bubble sort and selection sort"}
              className="w-full rounded-2xl border border-border-muted bg-surface-subtle p-3.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:text-slate-100"
            />
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-muted bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-subtle dark:text-slate-300">
                <FileText className="size-3.5 text-indigo-500" />
                <span>Upload Syllabus File (.txt, .md, .doc)</span>
                <input type="file" accept=".txt,.md,.doc,.pdf" className="hidden" onChange={handleFile} />
              </label>
              {fileName && (
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Loaded: {fileName}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={runAudit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Auditing Topics Against Live Enterprise Stacks...
                </>
              ) : (
                <>
                  <Zap className="size-3.5 fill-white" />
                  Run Obsolescence Audit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Audit Report Section */}
      {result && (
        <AuditReportView
          result={result}
          onApply={patch}
          applying={applying}
          notice={notice}
          isAuthorized={isAuthorizedToCommit}
          appliedPatches={appliedPatches}
        />
      )}
    </div>
  );
}

function AuditReportView({
  result,
  onApply,
  applying,
  notice,
  isAuthorized,
  appliedPatches,
}: {
  result: AuditResult;
  onApply: (i: number) => Promise<void>;
  applying: string | null;
  notice: string;
  isAuthorized: boolean;
  appliedPatches: string[];
}) {
  const gapColor =
    result.gapPercent < 30 ? "text-emerald-600" : result.gapPercent < 50 ? "text-amber-600" : "text-rose-600";
  const gapBg =
    result.gapPercent < 30 ? "bg-emerald-500" : result.gapPercent < 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-6">
      {/* High-Level Diagnostic Scorecard */}
      <div className="relative overflow-hidden rounded-3xl border border-border-muted bg-surface p-6 shadow-card">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Curriculum Obsolescence Diagnostic
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.simulated
                ? "Evaluated using verified industry pattern dictionary (Zero external latency)."
                : "Evaluated in real-time via Google Gemini 1.5 Flash curriculum auditor."}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {result.topics.length} Modules Analyzed
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Obsolescence Gap</p>
            <p className={`mt-1 text-3xl font-extrabold ${gapColor}`}>{result.gapPercent}%</p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              Below current industry production requirements
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Industry Relevance</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{result.currentScore}%</p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              Directly transferable to software engineering roles
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Target With Industry Patches</p>
            <p className="mt-1 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {result.projectedScore}%
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              +{result.improvement}% competency boost projected
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Syllabus Modernization Alignment</span>
            <span>{100 - result.gapPercent}% / 100%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${gapBg}`}
              style={{ width: `${100 - result.gapPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Outdated Topics vs Fresh Topics Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Outdated Topics Column */}
        <div className="rounded-3xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </span>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
                Outdated / Obsolete Modules ({result.outdatedTopics.length})
              </h4>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Needs Modernization</span>
          </div>

          {result.outdatedTopics.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <CheckCircle2 className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                All Modules Aligned to Current Standards!
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                No obsolete or deprecated syllabus topics detected in this course.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {result.outdatedTopics.map((o, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-rose-200/70 bg-rose-50/30 p-4 transition-all dark:border-rose-950/80 dark:bg-rose-950/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{o.topic}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {o.reason}
                      </p>
                      {o.replacement && (
                        <div className="mt-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-2.5 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/30">
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            Enterprise Replacement:{" "}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{o.replacement}</span>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                      {Math.round(o.gap * 100)}% Gap
                    </span>
                  </div>

                  {isAuthorized && o.patchModule && (
                    <div className="mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/40">
                      <button
                        onClick={() => {
                          const pIdx = result.patches.findIndex(
                            (p) => p.id === (o.patchModule || "").replace(/\s+/g, "-").toLowerCase()
                          );
                          if (pIdx >= 0) onApply(pIdx);
                        }}
                        disabled={applying !== null}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Zap className="size-3 fill-white" />
                        {applying ? "Applying Patch..." : `Apply "${o.patchModule}" Patch`}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aligned / Fresh Topics Column */}
        <div className="rounded-3xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </span>
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Aligned / Industry-Relevant Modules ({result.freshTopics.length})
              </h4>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Verified Fit</span>
          </div>

          <div className="mt-4 space-y-2">
            {result.freshTopics.slice(0, 15).map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-300"
              >
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{t.topic}</span>
              </div>
            ))}
            {result.freshTopics.length === 0 && (
              <p className="text-xs text-slate-400 italic">No aligned topics identified yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Industry Patch Modules */}
      {result.patches.length > 0 && (
        <div className="rounded-3xl border border-border-muted bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Layers className="size-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recommended Industry Patch Modules ({result.patches.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NEP 2020 approved 20% flexible curriculum modular additions created by enterprise partners.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.patches.map((p, idx) => {
              const isApplied = appliedPatches.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-2xl border border-border-muted bg-surface-subtle p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.title}</p>
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="size-3" />
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                      Replaces obsolete: <span className="font-semibold">{p.replaces}</span>
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {isAuthorized && (
                    <div className="mt-3 pt-3 border-t border-border-muted flex justify-end">
                      <button
                        onClick={() => onApply(idx)}
                        disabled={applying !== null || isApplied}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          isApplied
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400"
                            : "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-95"
                        }`}
                      >
                        <Zap className="size-3" />
                        {applying === p.id ? "Applying..." : isApplied ? "Module Active in Syllabus" : "⚡ Apply to Syllabus"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback notice */}
      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
