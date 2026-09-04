"use client";

import { useState } from "react";
import { Zap, Check, AlertCircle } from "lucide-react";
import { calculateSkillMatch } from "@/lib/matchingEngine";

export default function MatchBadge({
  skills,
  mySkills,
}: {
  skills: string;
  mySkills: string[] | string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!skills) return null;

  // Utilize our intelligent matching engine with alias normalization and gap analysis
  const match = calculateSkillMatch(mySkills, skills);

  const tierColors = {
    Exceptional: {
      badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-500",
    },
    High: {
      badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
      dot: "bg-indigo-500",
    },
    Moderate: {
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      dot: "bg-amber-500",
    },
    Emerging: {
      badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
      dot: "bg-rose-500",
    },
  }[match.matchTier];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold cursor-pointer transition-all ${tierColors.badge}`}
      >
        <span className={`size-1.5 rounded-full ${tierColors.dot}`} />
        <Zap className="size-3" />
        <span>
          {match.matchScore}% · {match.matchTier}
        </span>
      </button>

      {/* Interactive Tooltip showing Matched vs Missing Skills */}
      {showTooltip && (
        <div className="absolute right-0 bottom-full mb-2 z-30 w-64 rounded-xl border border-border-muted bg-surface/95 backdrop-blur-md p-3 shadow-xl text-left animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-border-muted pb-1.5 mb-2">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              Skill Alignment Breakdown
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {match.totalMatched}/{match.totalRequired} Matched
            </span>
          </div>

          {/* Matched skills */}
          <div className="space-y-1 mb-2">
            <p className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="size-3" /> Matched Skills
            </p>
            {match.matchedSkills.length === 0 ? (
              <p className="text-[10px] text-slate-400">No direct skill match yet</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {match.matchedSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing skills (Gaps) */}
          {match.missingSkills.length > 0 && (
            <div className="space-y-1 pt-1.5 border-t border-border-muted/60">
              <p className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="size-3" /> Skill Gap to Learn
              </p>
              <div className="flex flex-wrap gap-1">
                {match.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
