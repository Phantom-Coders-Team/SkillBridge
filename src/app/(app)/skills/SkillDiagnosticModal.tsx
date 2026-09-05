"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  getDiagnosticTestQuestions,
  submitDiagnosticTest,
  type DecayStatus,
} from "./actions";
import type {
  ClientDiagnosticQuestion,
  DiagnosticSubmissionResult,
} from "@/lib/skillsDiagnostic";

interface SkillDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillsToTest: string[];
  onComplete: (
    updatedSkills: {
      skillName: string;
      score: number;
      decayStatus: DecayStatus;
    }[]
  ) => void;
}

export function SkillDiagnosticModal({
  isOpen,
  onClose,
  skillsToTest,
  onComplete,
}: SkillDiagnosticModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<ClientDiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DiagnosticSubmissionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (!isOpen || skillsToTest.length === 0) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);

    async function load() {
      const res = await getDiagnosticTestQuestions(skillsToTest);
      if (!isMounted) return;
      if (!res.ok || res.questions.length === 0) {
        setErrorMessage(res.message || "Failed to load diagnostic questions.");
        setLoading(false);
        return;
      }
      setQuestions(res.questions);
      setLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [isOpen, skillsToTest]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const allAnswered = questions.length > 0 && answeredCount >= questions.length;

  function handleSelectOption(optionIndex: number) {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    const res = await submitDiagnosticTest({
      answers,
      skillNames: skillsToTest,
    });

    setSubmitting(false);

    if (!res.ok || !res.result) {
      setErrorMessage(res.message || "Failed to submit diagnostic assessment.");
      return;
    }

    setResult(res.result);
    onComplete(
      res.result.skills.map((s) => ({
        skillName: s.skillName,
        score: s.score,
        decayStatus: s.passed ? "RECERTIFIED" : "STALE",
      }))
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Skill Diagnostic Assessment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {result
                  ? "Assessment Results & Score Breakdown"
                  : `Evaluating ${skillsToTest.length} skill${
                      skillsToTest.length === 1 ? "" : "s"
                    } • Real diagnostic testing`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="size-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Loading Diagnostic Questions...
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Generating domain-specific questions to benchmark your actual skills.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="mx-auto size-6 text-red-500" />
              <p className="mt-2 text-sm font-semibold">{errorMessage}</p>
              <button
                onClick={onClose}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Close
              </button>
            </div>
          ) : result ? (
            /* Results Screen */
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-indigo-100">
                      <Award className="size-3.5" /> Diagnostic Completed
                    </span>
                    <h2 className="mt-2 text-2xl font-black">
                      Earned Score: {result.overallScore}%
                    </h2>
                    <p className="mt-1 text-xs text-indigo-100/90">
                      Based on your actual answers across {result.skills.length} tested skill
                      {result.skills.length === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <div className="hidden size-20 items-center justify-center rounded-2xl bg-white/10 font-mono text-3xl font-black text-white sm:flex">
                    {result.overallScore}%
                  </div>
                </div>
              </div>

              {/* Individual Skill Results */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Skill Performance & Radar Updates
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {result.skills.map((skill) => (
                    <div
                      key={skill.skillName}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {skill.skillName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {skill.correctAnswers} of {skill.totalQuestions} questions correct
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            skill.passed
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {skill.score}% {skill.passed ? "• Verified" : "• Stale"}
                        </span>
                        {skill.previousScore !== undefined && (
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Prev: {skill.previousScore}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanations Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExplanations(!showExplanations)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="size-4 text-indigo-500" />
                    Review Diagnostic Questions & Correct Answers ({result.review.length})
                  </span>
                  {showExplanations ? (
                    <ChevronUp className="size-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400" />
                  )}
                </button>

                {showExplanations && (
                  <div className="divide-y divide-slate-100 border-t border-slate-100 p-4 dark:divide-slate-800 dark:border-slate-800">
                    {result.review.map((item, idx) => (
                      <div key={item.questionId} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <span className="mr-1.5 text-indigo-600 dark:text-indigo-400">
                              Q{idx + 1}. [{item.skillName}]
                            </span>
                            {item.question}
                          </p>
                          {item.isCorrect ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="size-3.5" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                              <XCircle className="size-3.5" /> Incorrect
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-1 text-xs">
                          <p className="text-slate-600 dark:text-slate-400">
                            Your answer:{" "}
                            <span
                              className={
                                item.isCorrect ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"
                              }
                            >
                              {item.userSelected >= 0
                                ? item.options[item.userSelected]
                                : "No answer selected"}
                            </span>
                          </p>
                          {!item.isCorrect && (
                            <p className="text-slate-600 dark:text-slate-400">
                              Correct answer:{" "}
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {item.options[item.correctIndex]}
                              </span>
                            </p>
                          )}
                          <p className="rounded-lg bg-indigo-50/50 p-2 text-[11px] text-slate-700 dark:bg-indigo-950/20 dark:text-slate-300">
                            💡 <span className="font-semibold">Explanation:</span> {item.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : currentQ ? (
            /* Live Diagnostic Testing Step */
            <div className="space-y-5">
              {/* Progress & Meta */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <span className="size-2 rounded-full bg-indigo-500" />
                    Skill: {currentQ.skillName}
                  </span>
                  <span>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4.5 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="inline-block rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {currentQ.difficulty}
                </span>
                <h4 className="mt-2 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 font-medium text-indigo-950 shadow-xs ring-2 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "border border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          {result ? (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
            >
              <CheckCircle2 className="size-4" /> Done &amp; View Radar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0 || loading || submitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="size-3.5" /> Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {answeredCount}/{questions.length} answered
                </span>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={loading || submitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
                  >
                    Next <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" /> Evaluating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" /> Submit Diagnostic
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
