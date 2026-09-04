"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, RotateCcw, Sparkles, Target } from "lucide-react";
import { submitSkillQuestionnaire } from "./actions";
import { SkillDiagnosticModal } from "./SkillDiagnosticModal";

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
  // Store selected skills with an optional self-rated target, without hardcoding verified 60s
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const g of SKILL_GROUPS) {
      for (const s of g.skills) {
        if (selected.includes(s)) {
          init[s] = 60; // existing skills keep baseline
        }
      }
    }
    return init;
  });

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [skillsToTest, setSkillsToTest] = useState<string[]>([]);

  const selectedSkillsList = Object.keys(ratings);
  const ratedCount = selectedSkillsList.length;

  function toggleSkill(name: string) {
    setRatings((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        // Default declared level
        next[name] = 60;
      }
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

  function handleTakeDiagnosticForSelected() {
    if (selectedSkillsList.length === 0) return;
    setSkillsToTest(selectedSkillsList.slice(0, 5)); // test up to 5 at a time
    setDiagnosticOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
          💡 Objective Skill Radar Verification
        </p>
        <p className="mt-1 text-xs leading-relaxed text-indigo-800/90 dark:text-indigo-300/90">
          Select skills to add them to your profile. Self-ratings serve as your declared learning
          targets. To establish or improve your <strong>verified score</strong> on the Skill Radar,
          take the interactive diagnostic assessment below.
        </p>
      </div>

      {SKILL_GROUPS.map((group) => (
        <div key={group.group}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {group.group}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => {
              const active = Boolean(ratings[skill]);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-border-muted bg-white text-slate-700 hover:border-slate-300 dark:bg-surface dark:text-slate-300 dark:hover:border-slate-600"
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
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Self-Declared Proficiency Targets ({ratedCount} selected)
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Needs diagnostic verification to turn Fresh
            </span>
          </div>

          <div className="divide-y divide-border-muted">
            {Object.entries(ratings).map(([name, score]) => (
              <div key={name} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-[140px] text-xs font-medium text-slate-800 dark:text-slate-200">
                  {name}
                </span>
                <div className="flex items-center gap-1.5">
                  {RATINGS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => rate(name, r)}
                      className={`h-6 rounded-md px-2 text-[11px] font-semibold transition-colors ${
                        score === r
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-surface dark:text-slate-400 dark:hover:bg-indigo-950/30"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                  <span className="ml-1 w-20 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {RATING_LABEL[score] || "Custom"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-medium text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleTakeDiagnosticForSelected}
          disabled={ratedCount === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-xs font-bold text-white shadow-md transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          Take Diagnostic Test Now
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={pending || ratedCount === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-muted bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:bg-surface dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
          Save Declared Skills
        </button>

        {ratedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RotateCcw className="size-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Modal for testing questionnaire skills */}
      <SkillDiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        skillsToTest={skillsToTest}
        onComplete={() => {
          // Revalidation happens automatically in server action
        }}
      />
    </div>
  );
}
