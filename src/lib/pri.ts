import "server-only";

export interface PriInputs {
  skillScore: number;
  projectsCompleted: number;
  proofOfWorkCount: number;
  dualGradingScore: number | null;
  mentorshipSlots?: number;
  tokenBalance?: number;
  challengeCompletions: number;
}

export interface PriResult {
  score: number;
  unlocked: boolean;
  breakdown: Record<string, number>;
  maxScore: number;
}

const PRI_THRESHOLD = 850;
const MAX_SKILL = 300;
const MAX_PROJECTS = 250;
const MAX_POW = 150;
const MAX_DUAL = 150;
const MAX_MENTORSHIP = 100;
const MAX_CHALLENGES = 50;

/**
 * Placement Readiness Index (PRI) — a 0..1000 scale reflecting a student's
 * verified evidence of job readiness. When PRI > 850, reverse campus
 * placement unlocks (recruiters can pitch the student directly).
 */
export function calculatePri(inputs: PriInputs): PriResult {
  // Skill component: inputs.skillScore is typically 0..100 (percentage score).
  // If > 100, it's already on the 0..MAX_SKILL scale.
  const rawSkillScore = Number(inputs.skillScore || 0);
  const skillComponent =
    rawSkillScore > 100
      ? clampScore(rawSkillScore, MAX_SKILL)
      : clampUnit(rawSkillScore / 100) * MAX_SKILL;

  const projectComponent = clampUnit(Math.min(inputs.projectsCompleted, 4) / 4) * MAX_PROJECTS;
  const powComponent = clampUnit(Math.min(inputs.proofOfWorkCount, 3) / 3) * MAX_POW;
  const dualComponent =
    inputs.dualGradingScore === null || inputs.dualGradingScore === undefined
      ? 0
      : clampUnit(inputs.dualGradingScore / 100) * MAX_DUAL;
  const mentorSlotsCount = inputs.mentorshipSlots ?? inputs.tokenBalance ?? 0;
  const mentorshipComponent = clampUnit(Math.min(mentorSlotsCount, 2) / 2) * MAX_MENTORSHIP;
  const challengeComponent = clampUnit(Math.min(inputs.challengeCompletions, 2) / 2) * MAX_CHALLENGES;

  const breakdown: Record<string, number> = {
    skills: Math.round(skillComponent),
    projects: Math.round(projectComponent),
    proofOfWork: Math.round(powComponent),
    dualGrading: Math.round(dualComponent),
    mentorship: Math.round(mentorshipComponent),
    tokens: Math.round(mentorshipComponent), // legacy alias for backward compatibility
    challenges: Math.round(challengeComponent),
  };

  const maxScore = 1000;

  // Compute total based on distinct components (excluding the legacy tokens alias)
  const rawScore =
    breakdown.skills +
    breakdown.projects +
    breakdown.proofOfWork +
    breakdown.dualGrading +
    breakdown.mentorship +
    breakdown.challenges;

  const score = Math.min(1000, Math.max(0, rawScore));

  return {
    score,
    unlocked: score >= PRI_THRESHOLD,
    breakdown,
    maxScore,
  };
}

function clampScore(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}
