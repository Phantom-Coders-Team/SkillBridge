"use client";

export default function MatchBadge({ skills, mySkills }: { skills: string; mySkills: string[] }) {
  const required = skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (required.length === 0) return null;

  const matched = required.filter((r) => mySkills.includes(r)).length;
  const pct = Math.round((matched / required.length) * 100);

  const tone =
    pct >= 70
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : pct >= 40
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {pct}% match
    </span>
  );
}
