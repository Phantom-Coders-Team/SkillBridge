"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Clock,
  Building2,
  Zap,
} from "lucide-react";
import { submitCustomAssessmentAction, type CustomQuestion } from "./customAssessmentActions";

export interface CustomAssessmentData {
  id: string;
  title: string;
  description: string;
  category: string;
  primarySkill: string;
  durationMinutes: number;
  passingScore: number;
  questionsJson: string;
  companyName: string;
}

export function CustomQuizModal({
  assessment,
  studentPreviousScore,
}: {
  assessment: CustomAssessmentData;
  studentPreviousScore?: number;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment.durationMinutes * 60);
  const [isPending, startTransition] = useTransition();

  const questions: CustomQuestion[] = JSON.parse(assessment.questionsJson || "[]");

  // Timer countdown
  useEffect(() => {
    if (!isOpen || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, showResult]);

  const handleStart = () => {
    setIsOpen(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setResultData(null);
    setShowReview(false);
    setTimeLeft(assessment.durationMinutes * 60);
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmitAnswers();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAnswers = () => {
    startTransition(async () => {
      const res = await submitCustomAssessmentAction({
        assessmentId: assessment.id,
        answers,
      });

      if (res.success && res.score !== undefined) {
        setResultData({
          score: res.score,
          passed: Boolean(res.passed),
          correctCount: res.correctCount || 0,
          totalQuestions: res.totalQuestions || questions.length,
        });
        setShowResult(true);
        router.refresh();
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <button
        onClick={handleStart}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-95 transition-all"
      >
        <Zap className="size-3.5" />
        <span>{studentPreviousScore !== undefined ? "Retake Test" : "Take Assessment"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {assessment.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sponsored by <span className="font-semibold text-purple-600 dark:text-purple-400">{assessment.companyName}</span> • Benchmark: {assessment.passingScore}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!showResult && (
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Clock className="size-3.5" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Test Body */}
            {!showResult ? (
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Completed</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Current Question */}
                {questions[currentQuestionIndex] && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {questions[currentQuestionIndex].text}
                    </h4>

                    <div className="space-y-2">
                      {questions[currentQuestionIndex].options.map((opt, optIdx) => {
                        const isSelected = answers[currentQuestionIndex] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(optIdx)}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs transition-all ${
                              isSelected
                                ? "border-purple-600 bg-purple-50/70 font-semibold text-purple-900 dark:border-purple-500 dark:bg-purple-950/50 dark:text-purple-200 shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <span
                              className={`flex size-6 shrink-0 items-center justify-center rounded-lg font-bold ${
                                isSelected
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Results & Review Screen */
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                <div className="text-center space-y-2">
                  <div
                    className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${
                      resultData?.passed
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                    }`}
                  >
                    {resultData?.passed ? <Award className="size-9" /> : <AlertTriangle className="size-9" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {resultData?.passed ? "Congratulations! Assessment Passed 🎉" : "Assessment Completed"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {resultData?.passed
                      ? `You met ${assessment.companyName}'s benchmark score (${assessment.passingScore}%). This skill has been verified in your digital portfolio and increased your Placement Readiness Index (PRI).`
                      : `You scored ${resultData?.score}%. The passing threshold for ${assessment.companyName} is ${assessment.passingScore}%. You can review the solutions and retake the test.`}
                  </p>
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Score</span>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                      {resultData?.score}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Correct Answers</span>
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {resultData?.correctCount} / {resultData?.totalQuestions}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Status</span>
                    <p
                      className={`text-sm font-bold mt-1 ${
                        resultData?.passed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {resultData?.passed ? "VERIFIED" : "NEEDS PRACTICE"}
                    </p>
                  </div>
                </div>

                {/* Question Review Accordion */}
                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => setShowReview(!showReview)}
                    className="flex w-full items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    <span>{showReview ? "Hide Question Review" : "Inspect Detailed Solutions"}</span>
                    <span className="text-purple-600 dark:text-purple-400 text-xs">
                      {showReview ? "Collapse" : "Expand"}
                    </span>
                  </button>

                  {showReview && (
                    <div className="mt-3 space-y-3">
                      {questions.map((q, idx) => {
                        const studentAnswer = answers[idx];
                        const isCorrect = studentAnswer === q.correctIndex;
                        return (
                          <div
                            key={q.id}
                            className={`rounded-xl border p-3 text-xs space-y-2 ${
                              isCorrect
                                ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                                : "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
                            }`}
                          >
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              #{idx + 1}. {q.text}
                            </p>
                            <div className="space-y-1">
                              {q.options.map((opt, optIdx) => (
                                <p
                                  key={optIdx}
                                  className={`rounded px-2 py-0.5 ${
                                    optIdx === q.correctIndex
                                      ? "font-bold text-emerald-700 dark:text-emerald-300"
                                      : optIdx === studentAnswer
                                      ? "line-through text-red-600 dark:text-red-400"
                                      : "text-slate-500 dark:text-slate-400"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                  {optIdx === q.correctIndex && " (Correct Answer)"}
                                  {optIdx === studentAnswer && optIdx !== q.correctIndex && " (Your Choice)"}
                                </p>
                              ))}
                            </div>
                            {q.explanation && (
                              <p className="border-t border-slate-200/60 pt-1 text-[11px] text-slate-600 dark:border-slate-700/60 dark:text-slate-400">
                                💡 {q.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              {!showResult ? (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Sparkles className="size-3.5 animate-spin" />
                          <span>Grading...</span>
                        </>
                      ) : currentQuestionIndex === questions.length - 1 ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          <span>Submit Test</span>
                        </>
                      ) : (
                        <>
                          <span>Next</span>
                          <ArrowRight className="size-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex w-full items-center justify-between">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Retake Test</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
