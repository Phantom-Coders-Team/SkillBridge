"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckCircle2,
  X,
  FileQuestion,
  HelpCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react";
import { createCustomAssessmentAction, type CustomQuestion } from "./customAssessmentActions";

const DEFAULT_CATEGORIES = ["Technical", "Soft Skills", "Aptitude & Reasoning", "Domain Specific"];

export function IndustryAssessmentBuilder() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [primarySkill, setPrimarySkill] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [passingScore, setPassingScore] = useState(70);

  // Dynamic questions list
  const [questions, setQuestions] = useState<CustomQuestion[]>([
    {
      id: "q-1",
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
      skillTested: "",
    },
  ]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
        skillTested: primarySkill || "General",
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx].text = text;
      return updated;
    });
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = [...updated[qIdx].options];
      newOptions[optIdx] = val;
      updated[qIdx].options = newOptions;
      return updated;
    });
  };

  const setCorrectIndex = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].correctIndex = optIdx;
      return updated;
    });
  };

  const updateExplanation = (idx: number, explanation: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx].explanation = explanation;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) return setError("Please enter an assessment title.");
    if (!description.trim()) return setError("Please enter a short description.");
    if (!primarySkill.trim()) return setError("Please specify the primary skill tested.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        return setError(`Question ${i + 1} is missing the question prompt.`);
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          return setError(`Question ${i + 1} Option ${String.fromCharCode(65 + j)} is empty.`);
        }
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("primarySkill", primarySkill);
      formData.set("durationMinutes", String(durationMinutes));
      formData.set("passingScore", String(passingScore));
      formData.set("questionsJson", JSON.stringify(questions));

      const res = await createCustomAssessmentAction(formData);
      if (res.success) {
        setIsOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setPrimarySkill("");
        setQuestions([
          {
            id: "q-1",
            text: "",
            options: ["", "", "", ""],
            correctIndex: 0,
            explanation: "",
            skillTested: "",
          },
        ]);
        router.refresh();
      } else {
        setError(res.error || "Failed to publish assessment.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-95 transition-all"
      >
        <Plus className="size-4" />
        <span>Author Company Assessment</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Author Industry Screening Assessment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Publish customized aptitude or technical challenges for students to take.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Scrollable Form Content */}
            <form id="assessment-builder-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Meta Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Applied AI & Microservices Screening Challenge"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Instructions *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe the competency expectations and evaluation context for candidate selection..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Skill Evaluated *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PyTorch, Cloud Architecture, System Design"
                    value={primarySkill}
                    onChange={(e) => setPrimarySkill(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Limit (Minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 10)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 pl-8"
                    />
                    <Clock className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Benchmark Score (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(parseInt(e.target.value, 10) || 70)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="size-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Assessment Questions ({questions.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          Question #{qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove Question"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          placeholder={`Enter question ${qIdx + 1} prompt...`}
                          value={q.text}
                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>

                      {/* 4 Choices */}
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Select the radio button next to the correct answer:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors ${
                                q.correctIndex === optIdx
                                  ? "border-emerald-500 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/40"
                                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={q.correctIndex === optIdx}
                                onChange={() => setCorrectIndex(qIdx, optIdx)}
                                className="accent-emerald-600 size-3.5 cursor-pointer"
                              />
                              <input
                                type="text"
                                required
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                value={opt}
                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <input
                          type="text"
                          placeholder="Explanation for the correct answer (shown in student review)..."
                          value={q.explanation}
                          onChange={(e) => updateExplanation(qIdx, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                form="assessment-builder-form"
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
              >
                {isPending ? (
                  <>
                    <Sparkles className="size-4 animate-spin" />
                    <span>Publishing Assessment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Publish to Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
