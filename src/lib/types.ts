export type Role =
  | "STUDENT"
  | "ACADEMICIAN"
  | "INDUSTRY"
  | "INSTITUTION"
  | "INDUSTRIES"
  | "INSTITUTIONS"
  | "FACULTY"
  | "TPO";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  ACADEMICIAN: "Academician",
  INDUSTRY: "Industry",
  INSTITUTION: "Institution",
  // Backwards compatibility aliases
  INDUSTRIES: "Industry",
  INSTITUTIONS: "Institution",
  FACULTY: "Academician",
  TPO: "Institution",
};

export const ROLE_COLORS: Record<Role, string> = {
  STUDENT: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  ACADEMICIAN: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  INDUSTRY: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  INSTITUTION: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  // Backwards compatibility aliases
  INDUSTRIES: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  INSTITUTIONS: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  FACULTY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  TPO: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};
