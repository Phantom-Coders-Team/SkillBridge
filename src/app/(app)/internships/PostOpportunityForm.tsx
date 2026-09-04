"use client";

import { useActionState, useState, useEffect, useMemo } from "react";
import { Loader2, Check, X, Search, Plus, Sparkles } from "lucide-react";
import { postOpportunity, type ActionState } from "./actions";

const TYPES = [
  "INTERNSHIP",
  "APPRENTICESHIP",
  "ENTRY_JOB",
  "TRAINING",
  "CERTIFICATION",
  "WORKSHOP",
  "MENTORSHIP",
];

const MODES = [
  "Remote",
  "Hybrid",
  "On-site",
];

export const SKILL_CATEGORIES: { category: string; skills: string[] }[] = [
  {
    category: "Popular",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Python",
      "PostgreSQL",
      "Tailwind CSS",
      "Git",
      "REST APIs",
    ],
  },
  {
    category: "Frontend",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Vue.js",
      "Angular",
      "Redux",
      "UI/UX Design",
      "Figma",
    ],
  },
  {
    category: "Backend",
    skills: [
      "Node.js",
      "Express",
      "Python",
      "Django",
      "FastAPI",
      "Java",
      "Spring Boot",
      "Go",
      "C++",
      "C#",
      ".NET",
      "Rust",
      "PHP",
      "REST APIs",
      "GraphQL",
      "Microservices",
    ],
  },
  {
    category: "Database & Cloud",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Redis",
      "Prisma",
      "Supabase",
      "Firebase",
      "AWS",
      "Docker",
      "Kubernetes",
      "Google Cloud",
    ],
  },
  {
    category: "AI & Data Science",
    skills: [
      "Machine Learning",
      "Deep Learning",
      "PyTorch",
      "TensorFlow",
      "Data Analysis",
      "Pandas",
      "NumPy",
      "NLP",
      "Computer Vision",
      "Generative AI",
    ],
  },
  {
    category: "DevOps & Mobile",
    skills: [
      "Git",
      "GitHub",
      "CI/CD",
      "Linux",
      "Cybersecurity",
      "System Design",
      "React Native",
      "Flutter",
      "Android",
      "iOS",
    ],
  },
];

const ALL_UNIQUE_SKILLS = Array.from(
  new Set(SKILL_CATEGORIES.flatMap((c) => c.skills))
);

export default function PostOpportunityForm() {
  const [state, action, pending] = useActionState(postOpportunity, null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Popular");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reset selected skills upon successful posting
  useEffect(() => {
    if (state?.success) {
      setSelectedSkills([]);
      setSearchQuery("");
    }
  }, [state?.success]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const addCustomSkill = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setSearchQuery("");
  };

  // Filter skills based on search or category
  const visibleSkills = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return ALL_UNIQUE_SKILLS.filter((s) => s.toLowerCase().includes(q));
    }

    if (activeCategory === "All") {
      return ALL_UNIQUE_SKILLS;
    }

    const cat = SKILL_CATEGORIES.find((c) => c.category === activeCategory);
    return cat ? cat.skills : ALL_UNIQUE_SKILLS;
  }, [searchQuery, activeCategory]);

  return (
    <form action={action} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
          Post an Opportunity
        </h3>
        <span className="text-[11px] font-medium text-slate-400">Industry Portal</span>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Opportunity Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Full Stack Developer Intern"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Role Description & Responsibilities <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          placeholder="Describe the responsibilities, expected projects, and learning outcomes…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="programType" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Opportunity Type <span className="text-rose-500">*</span>
          </label>
          <select
            id="programType"
            name="programType"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100 cursor-pointer"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mode" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Work Mode
          </label>
          <select
            id="mode"
            name="mode"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100 cursor-pointer"
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="duration" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Work Duration
          </label>
          <input
            id="duration"
            name="duration"
            type="text"
            placeholder="e.g. 3 Months / 6 Months"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="deadline" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Last Date to Apply (Deadline)
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100 cursor-pointer"
          />
        </div>
      </div>

      {/* Selective Required Skills Section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700/80 dark:bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Required Skills</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {selectedSkills.length} selected
              </span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Click skills to select. Students are matched based on their verified skills.
            </p>
          </div>

          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedSkills([])}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Selected skills pills badge bar */}
        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-indigo-200/60 bg-white p-2 dark:border-indigo-900/50 dark:bg-surface">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:opacity-80 cursor-pointer"
                  title="Remove skill"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-center text-xs text-slate-400 dark:border-slate-700">
            No skills selected yet. Select from the curated list below.
          </div>
        )}

        {/* Hidden input to pass comma-separated skills to form submission */}
        <input type="hidden" name="skills" value={selectedSkills.join(", ")} />

        {/* Search / Filter input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="Search skills or type custom skill and press Enter…"
            className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-20 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-surface dark:text-slate-100"
          />
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={addCustomSkill}
              className="absolute right-1 top-1 h-6 inline-flex items-center gap-1 rounded bg-indigo-600 px-2 text-[10px] font-bold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="size-3" /> Add
            </button>
          )}
        </div>

        {/* Category Tabs (shown when not searching) */}
        {!searchQuery.trim() && (
          <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2 dark:border-slate-700/60">
            {["Popular", "Frontend", "Backend", "Database & Cloud", "AI & Data Science", "DevOps & Mobile", "All"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-200/70 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        )}

        {/* Skill Selection Grid / Pill list */}
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-0.5">
          {visibleSkills.length > 0 ? (
            visibleSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-slate-700"
                  }`}
                >
                  {isSelected && <Check className="size-3 stroke-[3]" />}
                  <span>{skill}</span>
                </button>
              );
            })
          ) : (
            <div className="w-full py-2 text-center text-xs text-slate-500">
              No matching skill found.{" "}
              <button
                type="button"
                onClick={addCustomSkill}
                className="font-bold text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
              >
                Add "{searchQuery}" as custom skill
              </button>
            </div>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          name="certification"
          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span>Offers completion certificate / credential upon program completion</span>
      </label>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-500/15 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          Opportunity published successfully! Candidates can now discover and apply.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer shadow-sm transition-all"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Publishing Opportunity…
          </>
        ) : (
          <>
            <Sparkles className="size-4" /> Publish Opportunity
          </>
        )}
      </button>
    </form>
  );
}
