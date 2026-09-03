"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { submitSkillQuestionnaire } from "./actions";

const SKILL_GROUPS: { group: string; skills: string[] }[] = [
  {
    group: "Programming & Development",
    skills: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "React", "Node.js", "SQL", "HTML/CSS"],
  },
  {
    group: "Data & AI",
    skills: ["Machine Learning", "Deep Learning", "Data Analysis", "Statistics", "TensorFlow", "NLP", "Power BI", "Excel"],
  },
  {
    group: "Cloud & Infra",
    skills: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Linux", "Networking", "DevOps"],
  },
  {
    group: "Design & Product",
    skills: ["UI/UX Design", "Figma", "Product Management", "Wireframing", "Design Thinking"],
  },
  {
    group: "Ayush & Health Informatics",
    skills: ["Botanical AI Identification", "Clinical Trial Analytics", "Bioinformatics", "Digital Health Records (ABDM)", "Pharmacovigilance"],
  },
  {
    group: "Business & Soft Skills",
    skills: ["Communication", "Leadership", "Problem Solving", "Teamwork", "Project Management", "Public Speaking", "Writing"],
  },
];

const RATINGS = [20, 40, 60, 80, 100];
const RATING_LABEL: Record<number, string> = {
  20: "Beginner",
  40: "Basic",
  60: "Intermediate",
  80: "Advanced",
  100: "Expert",
};

export default function SkillQuestionnaire({ selected }: { selected: string[] }) {
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const g of SKILL_GROUPS) for (const s of g.skills) if (selected.includes(s)) init[s] = 60;
    return init;
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const ratedCount = Object.values(ratings).filter((v) => v > 0).length;

  function toggleSkill(name: string) {
    setRatings((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = 60;
      return next;
    });
  }

  function rate(name: string, score: number) {
    setRatings((prev) => ({ ...prev, [name]: score }));
  }

  function reset() {
    setRatings({});
    setMessage("");
  }

  function submit() {
    const payload = Object.entries(ratings).map(([name, score]) => ({ name, score }));
    startTransition(async () => {
      const result = await submitSkillQuestionnaire(payload);
      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Select the skills you know and rate your self-assessed proficiency. These feed your verified skill profile and drive
        internship &amp; job recommendations.
      </p>

      {SKILL_GROUPS.map((group) => (
        <div key={group.group}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{group.group}</h3>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => {
              const active = Boolean(ratings[skill]);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "border-border-muted bg-white text-slate-600 hover:border-slate-300 dark:bg-surface dark:text-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  {active && <CheckCircle2 className="size-3.5" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {ratedCount > 0 && (
        <div className="space-y-3 rounded-2xl border border-border-muted bg-slate-50/60 p-4 dark:bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Rate your proficiency ({ratedCount} selected)</h3>
          {Object.entries(ratings).map(([name, score]) => (
            <div key={name} className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-[140px] text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
              <div className="flex items-center gap-1.5">
                {RATINGS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => rate(name, r)}
                    className={`h-7 rounded-lg px-2 text-xs font-semibold transition-colors ${
                      score === r
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-surface dark:text-slate-400 dark:hover:bg-indigo-500/15"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <span className="ml-1 w-24 text-xs font-medium text-indigo-600 dark:text-indigo-400">{RATING_LABEL[score]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <p className="rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          {message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || ratedCount === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Save Questionnaire
        </button>
        {ratedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
