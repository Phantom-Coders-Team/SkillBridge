"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  generateDiagnosticQuestionsForSkills,
  sanitizeQuestionsForClient,
  type ClientDiagnosticQuestion,
  type DiagnosticSubmissionResult,
  type DiagnosticSkillResult,
} from "@/lib/skillsDiagnostic";

export type DecayStatus = "ACTIVE" | "STALE" | "EXPIRED" | "RECERTIFIED";

export interface RecertResult {
  refreshed: number;
  skills: { id: string; skillName: string; score: number; decayStatus: DecayStatus }[];
  message: string;
}

export interface QuestionnaireResult {
  added: number;
  message: string;
}

/**
 * Fetch randomized client-safe diagnostic test questions for the specified skills.
 */
export async function getDiagnosticTestQuestions(
  skillNames: string[]
): Promise<{ ok: boolean; questions: ClientDiagnosticQuestion[]; message?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { ok: false, questions: [], message: "Only students can take diagnostic assessments." };
  }

  const validSkills = (skillNames || []).map((s) => s.trim()).filter(Boolean);
  if (validSkills.length === 0) {
    return { ok: false, questions: [], message: "No skills provided for diagnostic." };
  }

  // Generate 3 questions per skill
  const fullQuestions = generateDiagnosticQuestionsForSkills(validSkills, 3);
  const clientQuestions = sanitizeQuestionsForClient(fullQuestions);

  return { ok: true, questions: clientQuestions };
}

/**
 * Submit diagnostic test answers, grade them objectively, and update skill assessments.
 */
export async function submitDiagnosticTest(payload: {
  answers: Record<string, number>; // questionId -> selectedOptionIndex (0-3)
  skillNames: string[];
}): Promise<{ ok: boolean; result?: DiagnosticSubmissionResult; message: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { ok: false, message: "Only students can submit diagnostic tests." };
  }

  const targetSkills = (payload.skillNames || []).map((s) => s.trim()).filter(Boolean);
  if (targetSkills.length === 0) {
    return { ok: false, message: "No skills were evaluated in this test." };
  }

  // Regenerate the exact master questions to verify correct answers server-side
  const masterQuestions = generateDiagnosticQuestionsForSkills(targetSkills, 3);
  const questionMap = new Map(masterQuestions.map((q) => [q.id, q]));

  // Track stats per skill
  const skillStats: Record<
    string,
    { total: number; correct: number }
  > = {};

  for (const s of targetSkills) {
    skillStats[s] = { total: 0, correct: 0 };
  }

  const review: DiagnosticSubmissionResult["review"] = [];

  for (const q of masterQuestions) {
    const userSelected = payload.answers[q.id] ?? -1;
    const isCorrect = userSelected === q.correctIndex;

    if (skillStats[q.skillName]) {
      skillStats[q.skillName].total += 1;
      if (isCorrect) {
        skillStats[q.skillName].correct += 1;
      }
    }

    review.push({
      questionId: q.id,
      skillName: q.skillName,
      question: q.question,
      options: q.options,
      userSelected,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    });
  }

  // Load existing records to record previous scores
  const existingAssessments = await prisma.skillAssessment.findMany({
    where: { studentId: user.id },
  });
  const existingMap = new Map(existingAssessments.map((a) => [a.skillName.toLowerCase(), a]));

  const skillResults: DiagnosticSkillResult[] = [];
  let totalOverallQuestions = 0;
  let totalOverallCorrect = 0;

  for (const [skillName, stats] of Object.entries(skillStats)) {
    totalOverallQuestions += stats.total;
    totalOverallCorrect += stats.correct;

    const ratio = stats.total > 0 ? stats.correct / stats.total : 0;
    // Objective benchmark score:
    // 100% correct -> 95-98%
    // 66% correct -> 78%
    // 33% correct -> 52%
    // 0% correct -> 30%
    const computedScore = stats.total > 0
      ? Math.min(98, Math.max(25, Math.round(30 + 65 * ratio)))
      : 50;

    const passed = ratio >= 0.6; // 60% or higher is a pass
    const newStatus: DecayStatus = passed ? "RECERTIFIED" : "STALE";

    const existing = existingMap.get(skillName.toLowerCase());
    skillResults.push({
      skillName,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      score: computedScore,
      passed,
      previousScore: existing?.score,
    });

    if (existing) {
      await prisma.skillAssessment.update({
        where: { id: existing.id },
        data: {
          score: computedScore,
          decayStatus: newStatus,
          verifiedAt: passed ? new Date() : existing.verifiedAt,
          lastAssessedAt: new Date(),
        },
      });
    } else {
      await prisma.skillAssessment.create({
        data: {
          studentId: user.id,
          skillName,
          score: computedScore,
          decayStatus: newStatus,
          verifiedAt: passed ? new Date() : null,
          lastAssessedAt: new Date(),
        },
      });
    }
  }

  const overallRatio = totalOverallQuestions > 0 ? totalOverallCorrect / totalOverallQuestions : 0;
  const overallScore = Math.min(98, Math.max(25, Math.round(30 + 65 * overallRatio)));

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  revalidatePath("/portfolio");

  const passedCount = skillResults.filter((s) => s.passed).length;
  const message = `Diagnostic completed! Earned average score of ${overallScore}% across ${skillResults.length} skill${
    skillResults.length === 1 ? "" : "s"
  }. ${passedCount} verified/refreshed.`;

  return {
    ok: true,
    result: {
      overallScore,
      skills: skillResults,
      review,
      message,
    },
    message,
  };
}

/**
 * Submit self-declared skills from the questionnaire.
 * Marks newly declared skills as STALE / awaiting diagnostic verification
 * rather than automatically assigning verified ACTIVE status.
 */
export async function submitSkillQuestionnaire(
  skillRatings: { name: string; score: number }[],
): Promise<QuestionnaireResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { added: 0, message: "Only students can submit the skill questionnaire." };
  }

  const rated = (skillRatings || []).filter((r) => r && r.name && r.score > 0);
  if (rated.length === 0) {
    return { added: 0, message: "Select at least one skill." };
  }

  const existing = await prisma.skillAssessment.findMany({
    where: { studentId: user.id },
    select: { skillName: true, id: true, score: true, decayStatus: true },
  });
  const existingMap = new Map(existing.map((e) => [e.skillName.toLowerCase(), e]));

  let added = 0;
  for (const r of rated) {
    const key = r.name.toLowerCase();
    const existingEntry = existingMap.get(key);
    if (existingEntry) {
      // If already verified or existing, update self-declared baseline, but maintain verification status
      await prisma.skillAssessment.update({
        where: { id: existingEntry.id },
        data: {
          score: Math.max(30, Math.min(100, r.score)),
          lastAssessedAt: new Date(),
        },
      });
    } else {
      // New self-declared skill: mark as STALE (pending diagnostic verification)
      await prisma.skillAssessment.create({
        data: {
          studentId: user.id,
          skillName: r.name,
          score: Math.max(30, Math.min(100, r.score)),
          decayStatus: "STALE", // Needs diagnostic assessment to become verified ACTIVE/RECERTIFIED
          verifiedAt: null,
          lastAssessedAt: new Date(),
        },
      });
      added += 1;
    }
  }

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  return {
    added,
    message: `Skill profile updated. ${rated.length} skill${
      rated.length === 1 ? "" : "s"
    } registered. Take the diagnostic to verify your proficiency on the Skill Radar.`,
  };
}

/**
 * Backward-compatible helper for legacy callers.
 */
export async function runReCertificationDiagnostic(): Promise<RecertResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { refreshed: 0, skills: [], message: "Only students can take the diagnostic." };
  }

  const assessments = await prisma.skillAssessment.findMany({
    where: { studentId: user.id },
  });

  return {
    refreshed: 0,
    skills: assessments.map((a) => ({
      id: a.id,
      skillName: a.skillName,
      score: a.score,
      decayStatus: a.decayStatus as DecayStatus,
    })),
    message: "Please use the interactive diagnostic test to evaluate your skills.",
  };
}
