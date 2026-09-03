import "server-only";

export interface PriInputs {
  skillScore: number;
  projectsCompleted: number;
  proofOfWorkCount: number;
  dualGradingScore: number | null;
  tokenBalance: number;
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
const MAX_TOKENS = 100;
const MAX_CHALLENGES = 50;

/**
 * Placement Readiness Index (PRI) — a 0..1000 scale reflecting a student's
 * verified evidence of job readiness. When PRI > 850, reverse campus
 * placement unlocks (recruiters can pitch the student directly).
 */
export function calculatePri(inputs: PriInputs): PriResult {
  const skillComponent = clampScore(inputs.skillScore, MAX_SKILL) * (inputs.skillScore / 100);
  const projectComponent = clampUnit(Math.min(inputs.projectsCompleted, 5) / 5) * MAX_PROJECTS;
  const powComponent = clampUnit(Math.min(inputs.proofOfWorkCount, 3) / 3) * MAX_POW;
  const dualComponent =
    inputs.dualGradingScore === null || inputs.dualGradingScore === undefined
      ? 0
      : clampUnit(inputs.dualGradingScore / 100) * MAX_DUAL;
  const tokenComponent = clampUnit(Math.min(inputs.tokenBalance, 100) / 100) * MAX_TOKENS;
  const challengeComponent = clampUnit(Math.min(inputs.challengeCompletions, 5) / 5) * MAX_CHALLENGES;

  const breakdown: Record<string, number> = {
    skills: Math.round(skillComponent),
    projects: Math.round(projectComponent),
    proofOfWork: Math.round(powComponent),
    dualGrading: Math.round(dualComponent),
    tokens: Math.round(tokenComponent),
    challenges: Math.round(challengeComponent),
  };

  const maxScore =
    (inputs.skillScore >= 0 ? MAX_SKILL : 0) +
    MAX_PROJECTS +
    MAX_POW +
    (inputs.dualGradingScore !== null && inputs.dualGradingScore !== undefined ? MAX_DUAL : 0) +
    MAX_TOKENS +
    MAX_CHALLENGES;

  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

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
