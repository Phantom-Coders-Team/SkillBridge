"use client";

import { useState } from "react";
import {
  Video,
  Code2,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  X,
  MessageSquare,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Play,
} from "lucide-react";
import { Card, Badge } from "@/components/ui";

interface MentorshipClinicModalProps {
  slotId: string;
  topic: string | null;
  studentName?: string | null;
  durationMins: number;
  meetingLink: string;
}

export default function MentorshipClinicModal({
  slotId,
  topic,
  studentName,
  durationMins,
  meetingLink,
}: MentorshipClinicModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"WORKSPACE" | "VIDEO">("WORKSPACE");
  const [codeSnippet, setCodeSnippet] = useState(`// 💡 Live Mentorship Code Review Workspace
// Topic: ${topic || "Architecture & Code Optimization"}
// Student: ${studentName || "Candidate"}

export async function processPaymentTransaction(req: Request) {
  // TODO: Add database transaction with idempotency key
  const { amount, currency, recipientId } = await req.json();
  
  if (amount <= 0) {
    throw new Error("Invalid transaction amount");
  }
  
  // Mentor Review Note: Ensure distributed lock or optimistic concurrency here
  return { status: "SUCCESS", txHash: "0x89ab...ef01" };
}`);

  const [notes, setNotes] = useState(
    "Key Discussion Notes:\n- Recommended refactoring to eliminate redundant database queries.\n- Focus on Docker multi-stage builds before production rollout.\n- Recommended applying for Cloud DevOps internship listings."
  );

  const [copied, setCopied] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    arch: true,
    code: true,
    feedback: false,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
      >
        <Code2 className="size-3.5" />
        <span>Open Collaboration Clinic</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl border border-border-muted bg-surface shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-border-muted bg-slate-50/80 px-6 py-3.5 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm font-bold">
                  <Code2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {topic || "1:1 Mentorship Clinic & Code Review"}
                    </h3>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      LIVE COLLAB
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Candidate: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{studentName || "Mentee"}</span> · {durationMins} Min Session
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border-muted bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("WORKSPACE")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      activeTab === "WORKSPACE"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    Code & Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("VIDEO")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      activeTab === "VIDEO"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    In-Browser Video
                  </button>
                </div>

                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Video className="size-3.5" />
                  <span>External Window</span>
                  <ExternalLink className="size-2.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {activeTab === "WORKSPACE" ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] flex-1 overflow-hidden">
                {/* Left: Code Review Canvas */}
                <div className="flex flex-col border-r border-border-muted bg-slate-950 text-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono font-semibold text-slate-300">live_review.ts</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    >
                      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copied ? "Copied" : "Copy Code"}</span>
                    </button>
                  </div>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="flex-1 w-full bg-transparent p-4 font-mono text-xs leading-relaxed text-emerald-300 placeholder:text-slate-600 focus:outline-none resize-none"
                    spellCheck={false}
                  />
                </div>

                {/* Right: Agenda & Shared Mentorship Notes */}
                <div className="flex flex-col overflow-y-auto bg-surface p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Session Agenda Checklist
                    </h4>
                    <div className="space-y-2">
                      {[
                        { key: "arch", label: "Architecture Review & Data Flow" },
                        { key: "code", label: "Live Code Profiling & Edge Cases" },
                        { key: "feedback", label: "Action Items & Skill Recommendations" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleItem(item.key)}
                          className="flex w-full items-center justify-between rounded-xl border border-border-muted p-2.5 text-xs text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <span className={completedItems[item.key] ? "line-through text-slate-400" : "font-medium text-slate-800 dark:text-slate-200"}>
                            {item.label}
                          </span>
                          <CheckCircle2
                            className={`size-4 ${
                              completedItems[item.key]
                                ? "text-emerald-500"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Mentorship Notes & Action Items
                    </h4>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={8}
                      className="flex-1 w-full rounded-xl border border-border-muted bg-surface p-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <p className="text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
                      💡 <strong>Accreditation Compliance:</strong> Mentorship interactions are logged for institutional NEP/NIRF industrial exposure verification.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* In-Browser Video Embed */
              <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
                <iframe
                  src={meetingLink}
                  allow="camera; microphone; fullscreen; display-capture"
                  className="w-full h-full border-0"
                  title="Mentorship Video Call"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
