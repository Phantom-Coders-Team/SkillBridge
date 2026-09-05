"use client";

import { useState, useTransition } from "react";
import { X, Sparkles, AlertCircle, CheckCircle2, FlaskConical, Briefcase } from "lucide-react";
import { createGradingRecord } from "./actions";

interface ChallengeOption {
  id: string;
  title: string;
  domain: string | null;
  stipend: number | null;
  companyName?: string;
}

interface LabUnitOption {
  id: string;
  name: string;
  facultyName: string;
  memberCount: number;
}

interface NewGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: ChallengeOption[];
  labUnits: LabUnitOption[];
}

export default function NewGradingModal({
  isOpen,
  onClose,
  challenges,
  labUnits,
}: NewGradingModalProps) {
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [selectedLabUnitId, setSelectedLabUnitId] = useState("");
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    const formData = new FormData();
    formData.append("challengeId", selectedChallengeId);
    formData.append("labUnitId", selectedLabUnitId);

    startTransition(async () => {
      const res = await createGradingRecord(null, formData);
      if (res.error) {
        setStatus({ error: res.error });
      } else {
        setStatus({ success: true });
        setTimeout(() => {
          onClose();
          setStatus(null);
          setSelectedChallengeId("");
          setSelectedLabUnitId("");
        }, 1200);
      }
    });
  };

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId);
  const selectedLab = labUnits.find((l) => l.id === selectedLabUnitId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-indigo-600/10 p-2 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Initiate Joint Evaluation Session
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pair an active Industry Challenge with a Student Lab Unit for simultaneous review.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Challenge Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Industry Challenge <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">-- Choose an Enterprise Challenge --</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.companyName ? `(${c.companyName})` : ""} {c.domain ? `• ${c.domain}` : ""}
                </option>
              ))}
            </select>
            {selectedChallenge && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-50/60 px-3 py-1.5 text-xs text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                <Briefcase className="size-3.5" />
                <span>Domain: {selectedChallenge.domain || "Technology"}</span>
                {selectedChallenge.stipend ? (
                  <span className="font-semibold">• Stipend: ₹{selectedChallenge.stipend.toLocaleString("en-IN")}</span>
                ) : null}
              </div>
            )}
          </div>

          {/* Lab Unit Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Student Lab Unit <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedLabUnitId}
              onChange={(e) => setSelectedLabUnitId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">-- Choose a Supervised Lab Unit --</option>
              {labUnits.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} • Faculty: {l.facultyName} ({l.memberCount} members)
                </option>
              ))}
            </select>
            {selectedLab && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50/60 px-3 py-1.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <FlaskConical className="size-3.5" />
                <span>Supervised by {selectedLab.facultyName}</span>
                <span className="font-semibold">• {selectedLab.memberCount} student researchers</span>
              </div>
            )}
          </div>

          {/* Alert Messages */}
          {status?.error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {status?.success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Joint evaluation session created! Initializing review matrix...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedChallengeId || !selectedLabUnitId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Initialize Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
