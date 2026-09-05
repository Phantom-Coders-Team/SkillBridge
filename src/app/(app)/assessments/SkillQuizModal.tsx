"use client";

import { useState, useTransition } from "react";
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
  Zap,
  ChevronDown,
  ChevronUp,
  XCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { ASSESSMENT_TRACKS, type AssessmentTrack } from "./assessmentData";
import { submitAssessmentAction } from "./actions";

export function SkillQuizModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AssessmentTrack | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStartTrack = (track: AssessmentTrack) => {
    setSelectedTrack(track);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setSavedSuccess(false);
    setShowReview(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (!selectedTrack) return;
    if (currentQuestionIndex < selectedTrack.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate score & finish
      setShowResult(true);
      calculateAndSave();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateAndSave = () => {
    if (!selectedTrack) return;
    let correctCount = 0;
    selectedTrack.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / selectedTrack.questions.length) * 100);

    startTransition(async () => {
      const res = await submitAssessmentAction({
        skillName: selectedTrack.primarySkill,
        score: scorePct,
        decayStatus: scorePct >= 70 ? "ACTIVE" : "STALE",
      });
      if (res.success) {
        setSavedSuccess(true);
        router.refresh();
      }
    });
  };

  const handleReset = () => {
    setSelectedTrack(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setSavedSuccess(false);
    setShowReview(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
    router.refresh();
  };

  // Score analysis
  const currentQuestions = selectedTrack?.questions ?? [];
  const correctCount = selectedTrack
    ? currentQuestions.filter((q, idx) => answers[idx] === q.correctIndex).length
    : 0;
  const score = selectedTrack ? Math.round((correctCount / currentQuestions.length) * 100) : 0;

  const strengths = currentQuestions
    .filter((q, idx) => answers[idx] === q.correctIndex)
    .map((q) => q.skillTested);

  const gaps = currentQuestions
    .filter((q, idx) => answers[idx] !== q.correctIndex)
    .map((q) => q.skillTested);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm hover:shadow transition-all cursor-pointer"
      >
        <ClipboardCheck className="size-4" />
        <span>Take Skill Assessment</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-muted bg-surface p-6 shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <ClipboardCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedTrack ? selectedTrack.title : "Industry Skill Assessment Engine"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Standardized questionnaire & aptitude tests evaluating technical, soft, and industry competencies.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* STAGE 1: Track Selection */}
            {!selectedTrack && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Select a standardized evaluation track aligned with active industry placement benchmarks:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {ASSESSMENT_TRACKS.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => handleStartTrack(track)}
                      className="group flex flex-col justify-between p-4 rounded-xl border border-border-muted bg-surface hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300">
                            {track.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{track.durationMinutes} mins</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                          {track.title}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {track.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-muted/50 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span>{track.questions.length} Questions</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 2: Interactive Questionnaire */}
            {selectedTrack && !showResult && (
              <div className="space-y-5">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span>
                      Question {currentQuestionIndex + 1} of {currentQuestions.length}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      Skill Tested: {currentQuestions[currentQuestionIndex]?.skillTested}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border-muted">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {currentQuestions[currentQuestionIndex]?.text}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestions[currentQuestionIndex]?.options.map((opt, idx) => {
                    const isSelected = answers[currentQuestionIndex] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl text-xs font-medium border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs"
                            : "border-border-muted hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div
                          className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 dark:border-slate-600 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border-muted">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" /> Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer"
                  >
                    {currentQuestionIndex === currentQuestions.length - 1 ? (
                      <>
                        <Sparkles className="size-3.5" /> Finish & View Gaps
                      </>
                    ) : (
                      <>
                        Next <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: Results & Skill Gap Analysis */}
            {selectedTrack && showResult && (
              <div className="space-y-6 animate-in fade-in">
                {/* Score Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-4">
                    <div className="relative size-16 flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shrink-0">
                      {score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {score >= 90
                            ? "Exceptional Proficiency"
                            : score >= 70
                            ? "Industry Ready"
                            : "Skill Gap Identified"}
                        </span>
                        {score >= 70 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Verified Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            Requires Upskilling
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Answered {correctCount} of {currentQuestions.length} questions correctly in {selectedTrack.primarySkill}.
                        {savedSuccess ? " Synced to your verified profile!" : isPending ? " Saving to profile..." : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-muted text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" /> Retake
                  </button>
                </div>

                {/* Breakdown: Strengths vs Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2.5">
                      <CheckCircle2 className="size-4" />
                      <span>Demonstrated Strengths ({strengths.length})</span>
                    </div>
                    {strengths.length === 0 ? (
                      <p className="text-xs text-slate-400">Review fundamentals to build strength profile.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {strengths.map((s, i) => (
                          <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Skill Gaps */}
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2.5">
                      <AlertTriangle className="size-4" />
                      <span>Identified Skill Gaps ({gaps.length})</span>
                    </div>
                    {gaps.length === 0 ? (
                      <p className="text-xs text-slate-400">Zero gaps detected! Ready for prime placement.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {gaps.map((g, i) => (
                          <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Question-by-Question Diagnostic Review Accordion */}
                <div className="rounded-xl border border-border-muted overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowReview((prev) => !prev)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="size-4 text-indigo-500" />
                      Detailed Diagnostic Review & Explanations ({currentQuestions.length} Questions)
                    </span>
                    {showReview ? (
                      <ChevronUp className="size-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-400" />
                    )}
                  </button>

                  {showReview && (
                    <div className="divide-y divide-border-muted p-4 space-y-4">
                      {currentQuestions.map((q, idx) => {
                        const userAns = answers[idx];
                        const isCorrect = userAns === q.correctIndex;
                        return (
                          <div key={q.id} className="pt-3 first:pt-0 space-y-2">
                            <div className="flex items-start gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {idx + 1}. {q.text}
                                </span>
                                <span className="ml-2 text-[10px] font-medium text-slate-400">
                                  ({q.skillTested})
                                </span>
                              </div>
                            </div>

                            {/* Options with state */}
                            <div className="ml-6 space-y-1.5">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = userAns === optIdx;
                                const isRightAnswer = optIdx === q.correctIndex;

                                let styleClass = "border-border-muted text-slate-600 dark:text-slate-400";
                                if (isRightAnswer) {
                                  styleClass = "border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold";
                                } else if (isSelected && !isRightAnswer) {
                                  styleClass = "border-rose-400 bg-rose-50/70 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 font-medium";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-between ${styleClass}`}
                                  >
                                    <span>
                                      <strong className="mr-1.5">{String.fromCharCode(65 + optIdx)}.</strong>
                                      {opt}
                                    </span>
                                    {isRightAnswer && (
                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                        Correct Answer
                                      </span>
                                    )}
                                    {isSelected && !isRightAnswer && (
                                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                        Your Answer
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            <div className="ml-6 rounded-lg bg-slate-50 dark:bg-slate-800/30 p-2.5 text-xs text-slate-600 dark:text-slate-300 border border-border-muted/50">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">Explanation: </span>
                              {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Recommended Pathways to Close Gaps
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    Based on your skill evaluation, the portal recommends exploring these active opportunities:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/internships"
                      onClick={handleClose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      <Zap className="size-3.5" /> View Matched Internships
                    </Link>
                    <Link
                      href="/challenges"
                      onClick={handleClose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-muted text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Award className="size-3.5" /> Take Industry Challenges
                    </Link>
                    <Link
                      href="/skills"
                      onClick={handleClose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-muted text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="size-3.5" /> Skill Decay Radar
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
