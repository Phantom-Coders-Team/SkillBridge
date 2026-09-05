"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export interface CustomQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  skillTested: string;
}

export async function createCustomAssessmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INDUSTRY" && user.role !== "INDUSTRIES")) {
    return { success: false, error: "Only verified industry partners can author assessments." };
  }

  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = (formData.get("category") as string) || "Technical";
    const primarySkill = (formData.get("primarySkill") as string) || "General Competency";
    const durationMinutes = Math.max(1, parseInt((formData.get("durationMinutes") as string) || "10", 10));
    const passingScore = Math.min(100, Math.max(10, parseInt((formData.get("passingScore") as string) || "70", 10)));
    const questionsJson = formData.get("questionsJson") as string;

    if (!title || !description || !questionsJson) {
      return { success: false, error: "Title, description, and at least one question are required." };
    }

    const parsedQuestions = JSON.parse(questionsJson);
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return { success: false, error: "Assessment must have at least one question." };
    }

    const created = await prisma.customAssessment.create({
      data: {
        companyId: user.id,
        title,
        description,
        category,
        primarySkill,
        durationMinutes,
        passingScore,
        questionsJson,
        status: "ACTIVE",
      },
    });

    revalidatePath("/assessments");
    return { success: true, assessmentId: created.id };
  } catch (err: unknown) {
    console.error("Error creating custom assessment:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create assessment." };
  }
}

export async function submitCustomAssessmentAction(data: {
  assessmentId: string;
  answers: Record<number, number>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can take assessments." };
  }

  try {
    const assessment = await prisma.customAssessment.findUnique({
      where: { id: data.assessmentId },
      include: {
        company: {
          select: { id: true, name: true, email: true, profile: { select: { companyName: true } } },
        },
      },
    });

    if (!assessment) {
      return { success: false, error: "Assessment test not found." };
    }

    const questions: CustomQuestion[] = JSON.parse(assessment.questionsJson);
    if (!questions.length) {
      return { success: false, error: "Invalid assessment data." };
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (data.answers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= assessment.passingScore;

    // Record submission
    await prisma.assessmentSubmission.create({
      data: {
        assessmentId: assessment.id,
        studentId: user.id,
        score,
        passed,
        answersJson: JSON.stringify(data.answers),
      },
    });

    // Record or update verified skill assessment in student's record
    const existingSkill = await prisma.skillAssessment.findFirst({
      where: {
        studentId: user.id,
        skillName: assessment.primarySkill,
      },
    });

    if (existingSkill) {
      await prisma.skillAssessment.update({
        where: { id: existingSkill.id },
        data: {
          score: Math.max(existingSkill.score, score),
          decayStatus: passed ? "ACTIVE" : existingSkill.decayStatus,
          verifiedAt: passed ? new Date() : existingSkill.verifiedAt,
          lastAssessedAt: new Date(),
        },
      });
    } else {
      await prisma.skillAssessment.create({
        data: {
          studentId: user.id,
          skillName: assessment.primarySkill,
          score,
          decayStatus: passed ? "ACTIVE" : "STALE",
          verifiedAt: passed ? new Date() : null,
          lastAssessedAt: new Date(),
        },
      });
    }

    // If passed, add skill to profile if not present
    if (passed) {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      if (profile) {
        const skillsList = profile.skills
          ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        if (!skillsList.some((s) => s.toLowerCase() === assessment.primarySkill.toLowerCase())) {
          await prisma.profile.update({
            where: { userId: user.id },
            data: { skills: [...skillsList, assessment.primarySkill].join(", ") },
          });
        }
      }

      // Dispatch notification to company recruiter
      const companyName = assessment.company.profile?.companyName || assessment.company.name;
      await createNotification({
        userId: assessment.company.id,
        userEmail: assessment.company.email,
        userName: companyName,
        title: "Candidate Passed Your Assessment! 🎯",
        message: `${user.name} scored ${score}% on "${assessment.title}". Profile & skills have been updated.`,
        type: "TEST",
        link: `/portfolio/${user.id}`,
      });
    }

    revalidatePath("/assessments");
    revalidatePath("/portfolio");
    revalidatePath("/skills");
    revalidatePath("/dashboard");

    return {
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      passingScore: assessment.passingScore,
      companyName: assessment.company.profile?.companyName || assessment.company.name,
    };
  } catch (err: unknown) {
    console.error("Error submitting custom assessment:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to submit assessment." };
  }
}

export async function deleteCustomAssessmentAction(assessmentId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.customAssessment.deleteMany({
      where: {
        id: assessmentId,
        companyId: user.id,
      },
    });
    revalidatePath("/assessments");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete" };
  }
}
